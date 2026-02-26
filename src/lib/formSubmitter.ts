import { GeneratedResponse } from '@/types/form';
import { FormField } from '@/types/form';

export async function submitFormResponse(
  submitUrl: string,
  responseData: GeneratedResponse,
  fields: FormField[],
  pageCount?: number
): Promise<void> {
  try {
    // Build form data
    const formData = new URLSearchParams();
    
    // Add required Google Form parameters
    formData.append('fvv', '1');
    // For multi-page forms, pageHistory must list all pages: "0,1,2,..."
    const pages = pageCount && pageCount > 1
      ? Array.from({ length: pageCount }, (_, i) => i).join(',')
      : '0';
    formData.append('pageHistory', pages);
    
    // Create a map of field types by entryId for proper handling
    const fieldTypeMap = new Map<string, FormField>();
    fields.forEach(f => fieldTypeMap.set(f.entryId, f));

    Object.entries(responseData).forEach(([entryId, value]) => {
      if (!entryId.startsWith('entry.')) return;
      
      const field = fieldTypeMap.get(entryId);
      const fieldType = field?.type;
      
      // Handle different field types appropriately
      if (fieldType === 4) {
        // Checkbox type (4) - ưu tiên giữ nguyên option gốc (kể cả khi có dấu phẩy)
        const rawValue = value as unknown;
        let values: string[] = [];

        if (Array.isArray(rawValue)) {
          values = rawValue.map((v) => String(v).trim()).filter((v) => v.length > 0);
        } else {
          const textValue = String(rawValue ?? '').trim();

          if (textValue.length > 0) {
            // Nếu trùng chính xác 1 option thì gửi nguyên bản, không split theo dấu phẩy
            if (field?.options?.includes(textValue)) {
              values = [textValue];
            } else if (textValue.startsWith('[') && textValue.endsWith(']')) {
              try {
                const parsed = JSON.parse(textValue);
                if (Array.isArray(parsed)) {
                  values = parsed.map((v) => String(v).trim()).filter((v) => v.length > 0);
                }
              } catch {
                values = textValue.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
              }
            } else {
              values = textValue.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
            }
          }
        }

        values.forEach((v) => {
          formData.append(entryId, v);
        });
      } else {
        // All other types - send as single value (don't split by comma)
        const finalValue = String(value || '').trim();
        formData.append(entryId, finalValue);
      }
    });

    // Use fetch with no-cors mode to submit
    // Note: We can't read the response with no-cors, but the form will be submitted
    await fetch(submitUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // Since we can't verify success with no-cors, we assume it worked
    // Google Forms returns 200 for valid submissions
  } catch (error) {
    console.error('Submit error:', error);
    throw new Error('Không thể gửi form. Kiểm tra kết nối mạng.');
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
