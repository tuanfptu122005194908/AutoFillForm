export interface FormField {
  entryId: string;
  name: string;
  type: number;
  typeLabel: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

export interface GeneratedResponse {
  [entryId: string]: string;
}

export interface SubmitStatus {
  current: number;
  total: number;
  status: 'idle' | 'generating' | 'submitting' | 'paused' | 'completed' | 'error';
  message?: string;
}
