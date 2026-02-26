import { Sparkles, Clock, MessageSquare, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface GenerateControlsProps {
  submitCount: number;
  onSubmitCountChange: (value: number) => void;
  delayMs: number;
  onDelayChange: (value: number) => void;
  guideline: string;
  onGuidelineChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  fieldsCount: number;
}

export function GenerateControls({
  submitCount,
  onSubmitCountChange,
  delayMs,
  onDelayChange,
  guideline,
  onGuidelineChange,
  onGenerate,
  isGenerating,
  fieldsCount,
}: GenerateControlsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label htmlFor="submit-count" className="flex items-center gap-2 font-semibold">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            Số lượng response
          </Label>
          <Input
            id="submit-count"
            type="number"
            min={1}
            max={100}
            value={submitCount}
            onChange={(e) => onSubmitCountChange(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="h-12 bg-muted/50 border-2 border-transparent focus:border-primary rounded-xl text-center font-semibold text-lg"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="delay" className="flex items-center gap-2 font-semibold">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Clock className="h-3.5 w-3.5 text-accent" />
            </div>
            Delay (ms)
          </Label>
          <Input
            id="delay"
            type="number"
            min={500}
            max={10000}
            step={100}
            value={delayMs}
            onChange={(e) => onDelayChange(Math.max(500, parseInt(e.target.value) || 1500))}
            className="h-12 bg-muted/50 border-2 border-transparent focus:border-accent rounded-xl text-center font-semibold text-lg"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="guideline" className="flex items-center gap-2 font-semibold">
          <div className="p-1.5 rounded-lg bg-secondary/10">
            <MessageSquare className="h-3.5 w-3.5 text-secondary" />
          </div>
          Hướng dẫn cho AI
          <span className="text-xs font-normal text-muted-foreground ml-1">(tùy chọn)</span>
        </Label>
        <Textarea
          id="guideline"
          placeholder="Ví dụ: Trả lời theo hướng tích cực, như một sinh viên năm 3 đại học..."
          value={guideline}
          onChange={(e) => onGuidelineChange(e.target.value)}
          className="min-h-[100px] p-4 bg-muted/50 border-2 border-transparent focus:border-secondary rounded-xl transition-all duration-300 resize-none placeholder:text-muted-foreground/50"
        />
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || fieldsCount === 0}
        className="w-full h-16 gap-3 font-bold text-lg rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="h-6 w-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>Đang tạo câu trả lời...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-6 w-6" />
            <span>Tạo câu trả lời với AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
