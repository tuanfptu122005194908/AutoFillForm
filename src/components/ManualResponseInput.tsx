import { useState } from 'react';
import { Plus, Trash2, Copy, PenLine } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField, GeneratedResponse } from '@/types/form';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ManualResponseInputProps {
  fields: FormField[];
  onResponsesReady: (responses: GeneratedResponse[]) => void;
}

export function ManualResponseInput({ fields, onResponsesReady }: ManualResponseInputProps) {
  const [responses, setResponses] = useState<GeneratedResponse[]>([createEmptyResponse()]);

  function createEmptyResponse(): GeneratedResponse {
    const resp: GeneratedResponse = {};
    fields.forEach((f) => {
      resp[f.entryId] = '';
    });
    return resp;
  }

  const updateField = (responseIndex: number, entryId: string, value: string) => {
    setResponses((prev) => {
      const updated = [...prev];
      updated[responseIndex] = { ...updated[responseIndex], [entryId]: value };
      return updated;
    });
  };

  const addResponse = () => {
    setResponses((prev) => [...prev, createEmptyResponse()]);
  };

  const duplicateResponse = (index: number) => {
    setResponses((prev) => {
      const copy = { ...prev[index] };
      const updated = [...prev];
      updated.splice(index + 1, 0, copy);
      return updated;
    });
  };

  const removeResponse = (index: number) => {
    if (responses.length <= 1) return;
    setResponses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    // Filter out completely empty responses
    const validResponses = responses.filter((r) =>
      Object.values(r).some((v) => v.trim() !== '')
    );
    if (validResponses.length === 0) return;
    onResponsesReady(validResponses);
  };

  const renderFieldInput = (field: FormField, responseIndex: number, value: string) => {
    // Type 2 = radio/dropdown, Type 4 = checkbox, Type 5 = scale
    if (field.type === 2 && field.options && field.options.length > 0) {
      return (
        <Select
          value={value}
          onValueChange={(v) => updateField(responseIndex, field.entryId, v)}
        >
          <SelectTrigger className="bg-muted/50 border-2 border-transparent focus:border-primary rounded-xl">
            <SelectValue placeholder="Chọn một đáp án..." />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 3 && field.options && field.options.length > 0) {
      return (
        <Select
          value={value}
          onValueChange={(v) => updateField(responseIndex, field.entryId, v)}
        >
          <SelectTrigger className="bg-muted/50 border-2 border-transparent focus:border-primary rounded-xl">
            <SelectValue placeholder="Chọn một đáp án..." />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 4 && field.options && field.options.length > 0) {
      const selectedValues = value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedValues.includes(opt)}
                onCheckedChange={(checked) => {
                  let newValues: string[];
                  if (checked) {
                    newValues = [...selectedValues, opt];
                  } else {
                    newValues = selectedValues.filter((v) => v !== opt);
                  }
                  updateField(responseIndex, field.entryId, newValues.join(', '));
                }}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === 5 && field.scaleMin !== undefined && field.scaleMax !== undefined) {
      const min = field.scaleMin;
      const max = field.scaleMax;
      const options = [];
      for (let i = min; i <= max; i++) {
        options.push(i);
      }
      return (
        <div className="flex gap-2 flex-wrap">
          {options.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => updateField(responseIndex, field.entryId, String(num))}
              className={cn(
                'w-10 h-10 rounded-xl border-2 font-semibold text-sm transition-all duration-200',
                value === String(num)
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-border bg-muted/50 hover:border-primary/50'
              )}
            >
              {num}
            </button>
          ))}
        </div>
      );
    }

    // Default: text input or textarea
    if (field.type === 1) {
      return (
        <Textarea
          value={value}
          onChange={(e) => updateField(responseIndex, field.entryId, e.target.value)}
          placeholder={`Nhập câu trả lời cho "${field.name}"...`}
          className="min-h-[80px] bg-muted/50 border-2 border-transparent focus:border-primary rounded-xl resize-none"
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => updateField(responseIndex, field.entryId, e.target.value)}
        placeholder={`Nhập câu trả lời cho "${field.name}"...`}
        className="h-11 bg-muted/50 border-2 border-transparent focus:border-primary rounded-xl"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary/10">
            <PenLine className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Nhập câu trả lời thủ công</h3>
            <p className="text-sm text-muted-foreground">Tự nhập câu trả lời cho từng bộ response</p>
          </div>
        </div>
        <Badge className="gradient-secondary text-secondary-foreground px-3 py-1 text-sm font-bold">
          {responses.length} bộ
        </Badge>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {responses.map((response, rIndex) => (
          <div
            key={rIndex}
            className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="gradient-secondary text-secondary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                  {rIndex + 1}
                </div>
                <span className="font-semibold text-sm">Response #{rIndex + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => duplicateResponse(rIndex)}
                  className="h-8 w-8 rounded-lg hover:bg-secondary/10"
                  title="Nhân đôi"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResponse(rIndex)}
                  disabled={responses.length <= 1}
                  className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  title="Xóa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.entryId} className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {field.name}
                    <span className="ml-1.5 text-[10px] text-muted-foreground/60">({field.typeLabel})</span>
                  </Label>
                  {renderFieldInput(field, rIndex, response[field.entryId] || '')}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={addResponse}
          className="flex-1 h-12 gap-2 rounded-xl border-2 border-dashed border-border hover:border-secondary hover:bg-secondary/5 transition-all"
        >
          <Plus className="h-4 w-4" />
          Thêm Response
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 h-12 gap-2 rounded-xl gradient-secondary text-secondary-foreground font-bold hover:opacity-90 transition-all shadow-lg"
        >
          <PenLine className="h-4 w-4" />
          Áp dụng ({responses.filter((r) => Object.values(r).some((v) => v.trim())).length} bộ)
        </Button>
      </div>
    </div>
  );
}
