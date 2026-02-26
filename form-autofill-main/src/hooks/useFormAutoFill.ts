import { useState, useRef, useCallback } from 'react';
import { FormField, GeneratedResponse, SubmitStatus } from '@/types/form';
import { parseFormHtml, getSubmitUrl } from '@/lib/formParser';
import { submitFormResponse, sleep } from '@/lib/formSubmitter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ApiProvider } from '@/components/ApiSettings';

export function useFormAutoFill() {
  const [formUrl, setFormUrl] = useState('');
  const [htmlSource, setHtmlSource] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [submitCount, setSubmitCount] = useState(5);
  const [delayMs, setDelayMs] = useState(1500);
  const [guideline, setGuideline] = useState('');
  const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
  const [status, setStatus] = useState<SubmitStatus>({
    current: 0,
    total: 0,
    status: 'idle',
  });
  
  // API settings
  const [apiProvider, setApiProvider] = useState<ApiProvider>('lovable');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  
  // Password protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isRunningRef = useRef(false);

  const analyzeForm = useCallback(() => {
    if (!htmlSource.trim()) {
      toast({
        title: 'Thiếu dữ liệu',
        description: 'Vui lòng dán mã nguồn HTML của Form',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = parseFormHtml(htmlSource);
      
      if (result.fields.length === 0) {
        toast({
          title: 'Không tìm thấy câu hỏi',
          description: 'Không thể phân tích được câu hỏi từ HTML. Kiểm tra lại mã nguồn.',
          variant: 'destructive',
        });
        return;
      }

      setFields(result.fields);
      setPageCount(result.pageCount);
      setGeneratedResponses([]);
      
      toast({
        title: 'Phân tích thành công',
        description: `Đã tìm thấy ${result.fields.length} câu hỏi (${result.pageCount} trang)`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi phân tích',
        description: error instanceof Error ? error.message : 'Lỗi không xác định',
        variant: 'destructive',
      });
    }
  }, [htmlSource]);

  const generateResponses = useCallback(async () => {
    if (fields.length === 0) {
      toast({
        title: 'Chưa có câu hỏi',
        description: 'Vui lòng phân tích Form trước',
        variant: 'destructive',
      });
      return;
    }

    // Validate API key if needed
    if (apiProvider === 'gemini' && !geminiApiKey.trim()) {
      toast({
        title: 'Thiếu API key',
        description: 'Vui lòng nhập Google Gemini API key',
        variant: 'destructive',
      });
      return;
    }
    
    if (apiProvider === 'groq' && !groqApiKey.trim()) {
      toast({
        title: 'Thiếu API key',
        description: 'Vui lòng nhập Groq API key',
        variant: 'destructive',
      });
      return;
    }

    setStatus({ current: 0, total: submitCount, status: 'generating', message: 'Đang tạo câu trả lời...' });

    try {
      const requestBody: {
        fields: { entryId: string; name: string; type: number; options?: string[]; scaleMin?: number; scaleMax?: number }[];
        count: number;
        guideline?: string;
        provider: ApiProvider;
        apiKey?: string;
      } = {
        fields: fields.map((f) => ({
          entryId: f.entryId,
          name: f.name,
          type: f.type,
          options: f.options,
          scaleMin: f.scaleMin,
          scaleMax: f.scaleMax,
        })),
        count: submitCount,
        guideline: guideline || undefined,
        provider: apiProvider,
      };

      // Add API key based on provider
      if (apiProvider === 'gemini') {
        requestBody.apiKey = geminiApiKey;
      } else if (apiProvider === 'groq') {
        requestBody.apiKey = groqApiKey;
      }

      const { data, error } = await supabase.functions.invoke('generate-answers', {
        body: requestBody,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const answers = data?.answers || [];
      const usedProvider = data?.provider || apiProvider;
      
      setGeneratedResponses(answers);
      setStatus({ current: 0, total: answers.length, status: 'idle', message: `Đã tạo ${answers.length} câu trả lời` });

      toast({
        title: 'Tạo câu trả lời thành công',
        description: `Đã tạo ${answers.length} bộ câu trả lời bằng ${usedProvider === 'lovable' ? 'Lovable AI' : usedProvider === 'gemini' ? 'Google Gemini' : 'Groq'}`,
      });
    } catch (error) {
      console.error('Generate error:', error);
      setStatus({ current: 0, total: 0, status: 'error', message: error instanceof Error ? error.message : 'Lỗi' });
      
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      // Show helpful message for rate limits
      if (errorMessage.includes('Rate limit') || errorMessage.includes('rate limit')) {
        toast({
          title: 'Đã đạt giới hạn',
          description: 'Đổi sang nhà cung cấp AI khác hoặc đợi một lát.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Lỗi tạo câu trả lời',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  }, [fields, submitCount, guideline, apiProvider, geminiApiKey, groqApiKey]);

  const startSubmitting = useCallback(async () => {
    if (!formUrl.includes('docs.google.com/forms')) {
      toast({
        title: 'URL không hợp lệ',
        description: 'Vui lòng nhập link Google Form hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    if (generatedResponses.length === 0) {
      toast({
        title: 'Chưa có câu trả lời',
        description: 'Vui lòng tạo câu trả lời trước khi gửi',
        variant: 'destructive',
      });
      return;
    }

    isRunningRef.current = true;
    const submitUrl = getSubmitUrl(formUrl);
    const total = generatedResponses.length;

    setStatus({ current: 0, total, status: 'submitting', message: 'Đang gửi...' });

    for (let i = 0; i < total && isRunningRef.current; i++) {
      try {
        setStatus({ current: i, total, status: 'submitting', message: `Đang gửi ${i + 1}/${total}...` });
        
        await submitFormResponse(submitUrl, generatedResponses[i], fields, pageCount);
        
        setStatus({ current: i + 1, total, status: 'submitting', message: `Đã gửi ${i + 1}/${total}` });

        if (i < total - 1 && isRunningRef.current) {
          await sleep(delayMs);
        }
      } catch (error) {
        console.error(`Error submitting response ${i + 1}:`, error);
        setStatus({
          current: i,
          total,
          status: 'error',
          message: `Lỗi tại lần gửi ${i + 1}`,
        });
        isRunningRef.current = false;
        return;
      }
    }

    if (isRunningRef.current) {
      setStatus({ current: total, total, status: 'completed', message: 'Hoàn thành!' });
      toast({
        title: 'Hoàn thành',
        description: `Đã gửi thành công ${total} form`,
      });
    }

    isRunningRef.current = false;
  }, [formUrl, generatedResponses, delayMs, fields]);

  const stopSubmitting = useCallback(() => {
    isRunningRef.current = false;
    setStatus((prev) => ({
      ...prev,
      status: 'paused',
      message: `Đã dừng tại ${prev.current}/${prev.total}`,
    }));
  }, []);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    setFields([]);
    setPageCount(1);
    setGeneratedResponses([]);
    setStatus({ current: 0, total: 0, status: 'idle' });
  }, []);

  return {
    formUrl,
    setFormUrl,
    htmlSource,
    setHtmlSource,
    fields,
    submitCount,
    setSubmitCount,
    delayMs,
    setDelayMs,
    guideline,
    setGuideline,
    generatedResponses,
    setGeneratedResponses,
    status,
    analyzeForm,
    generateResponses,
    startSubmitting,
    stopSubmitting,
    reset,
    // API settings
    apiProvider,
    setApiProvider,
    geminiApiKey,
    setGeminiApiKey,
    groqApiKey,
    setGroqApiKey,
    // Password
    isAuthenticated,
    setIsAuthenticated,
  };
}
