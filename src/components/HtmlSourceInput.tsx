import { Code2, Search, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HtmlSourceInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
}

export function HtmlSourceInput({ value, onChange, onAnalyze }: HtmlSourceInputProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onAnalyze();
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="html-source" className="flex items-center gap-2 text-base font-semibold">
        <div className="p-2 rounded-lg bg-secondary/10">
          <Code2 className="h-4 w-4 text-secondary" />
        </div>
        Mã nguồn HTML của Form
      </Label>
      <div className="relative group">
        <Textarea
          id="html-source"
          placeholder="Dán toàn bộ mã nguồn HTML của trang Form vào đây...&#10;&#10;Hướng dẫn: Mở Form → Nhấn Ctrl+U (hoặc Cmd+Option+U trên Mac) → Copy toàn bộ nội dung"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[160px] p-5 bg-muted/50 border-2 border-transparent focus:border-secondary focus:bg-card rounded-xl font-mono text-sm transition-all duration-300 placeholder:text-muted-foreground/50 resize-none"
        />
        <div className="absolute inset-0 rounded-xl gradient-secondary opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none" />
      </div>
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !value.trim()}
        className="w-full h-14 gap-3 font-bold text-base rounded-xl gradient-secondary text-secondary-foreground hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang phân tích...
          </>
        ) : (
          <>
            <Search className="h-5 w-5" />
            Phân tích Form
          </>
        )}
      </Button>
    </div>
  );
}
