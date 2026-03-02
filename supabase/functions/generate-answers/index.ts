import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormField {
  entryId: string;
  name: string;
  type: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

interface GenerateRequest {
  fields: FormField[];
  count: number;
  guideline?: string;
  provider?: 'lovable' | 'gemini' | 'groq';
  apiKey?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fields, count, guideline, provider = 'lovable', apiKey } = await req.json() as GenerateRequest;
    
    console.log(`Using provider: ${provider}, Generating ${count} responses for ${fields.length} fields`);

    // Determine API endpoint and key based on provider
    let apiEndpoint: string;
    let authKey: string;
    let model: string;

    switch (provider) {
      case 'gemini':
        if (!apiKey) {
          throw new Error('Gemini API key is required');
        }
        apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        authKey = apiKey;
        model = 'gemini-2.0-flash';
        break;
      
      case 'groq':
        if (!apiKey) {
          throw new Error('Groq API key is required');
        }
        apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
        authKey = apiKey;
        model = 'llama-3.3-70b-versatile';
        break;
      
      case 'lovable':
      default:
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
          throw new Error('LOVABLE_API_KEY is not configured');
        }
        apiEndpoint = 'https://ai.gateway.lovable.dev/v1/chat/completions';
        authKey = LOVABLE_API_KEY;
        model = 'google/gemini-2.5-flash';
        break;
    }

    const fieldDescriptions = fields.map((field) => {
      let desc = `- Entry ID: ${field.entryId}\n  Question: ${field.name}\n  Type: `;
      
      switch (field.type) {
        case 0:
          desc += "Short text answer";
          break;
        case 1:
          desc += "Paragraph text answer";
          break;
        case 2:
          desc += `Multiple choice (Radio). YOU MUST select EXACTLY ONE from these options: [${field.options?.join(', ')}]`;
          break;
        case 4:
          desc += `Checkbox (can select 1 or more). Select from these options ONLY: [${field.options?.join(', ')}]. Separate multiple selections with commas.`;
          break;
        case 5:
          desc += `Linear scale. Pick ONE number between ${field.scaleMin || 1} and ${field.scaleMax || 5} (inclusive). Return just the number.`;
          break;
        case 3:
          desc += `Dropdown. YOU MUST select EXACTLY ONE from these options: [${field.options?.join(', ')}]`;
          break;
        default:
          desc += "Text answer";
      }
      
      return desc;
    }).join('\n\n');

    const systemPrompt = `You are an AI assistant that generates realistic survey responses for Google Forms. 
Your task is to generate diverse, natural-sounding answers that vary across responses.

CRITICAL RULES - MUST FOLLOW:
1. For multiple choice (Radio) and Dropdown: Select EXACTLY ONE option. The answer MUST be one of the provided options EXACTLY as written (case-sensitive, no modifications).
2. For checkbox: Select 1-3 options separated by commas. Each option MUST match exactly as provided.
3. For scale questions: Return ONLY the number (e.g., "4", not "4 stars" or "4/5").
4. For text questions: Generate thoughtful, varied responses (1-3 sentences for short text, more for paragraphs). Do NOT include commas if you want to avoid splitting issues.
5. Make responses feel authentic and diverse across the ${count} submissions.
6. Vary the tone, word choice, and perspectives naturally.
${guideline ? `\nUser's special instruction: ${guideline}` : ''}

CRITICAL OUTPUT FORMAT: 
- Your response MUST be valid JSON only
- No markdown code blocks, no explanation, no text before or after
- Just the raw JSON array starting with [ and ending with ]`;

    const userPrompt = `Generate ${count} different survey responses for this Google Form.

Form fields:
${fieldDescriptions}

Return a JSON array with ${count} objects. Each object should have entry IDs as keys and the generated answers as values.

Example format:
[
  {"entry.123456": "Answer 1", "entry.789012": "Option A"},
  {"entry.123456": "Answer 2", "entry.789012": "Option B"}
]

Generate ${count} varied responses now:`;

    console.log(`Calling ${provider} API at ${apiEndpoint}`);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error:`, response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: `Rate limit exceeded on ${provider}. Please try a different provider or wait a moment.`,
          rateLimited: true
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'API key không hợp lệ. Vui lòng kiểm tra lại.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`${provider} API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI response:', content.substring(0, 500));

    // Clean up the response - remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.slice(7);
    } else if (content.startsWith('```')) {
      content = content.slice(3);
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3);
    }
    content = content.trim();

    let answers;
    try {
      answers = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Content was:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(answers)) {
      answers = [answers];
    }

    console.log(`Successfully generated ${answers.length} responses using ${provider}`);

    return new Response(JSON.stringify({ answers, provider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-answers function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
