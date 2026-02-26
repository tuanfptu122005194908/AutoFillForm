import { Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FormUrlInput({ value, onChange }: FormUrlInputProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="form-url" className="flex items-center gap-2 text-base font-semibold">
        <div className="p-2 rounded-lg bg-primary/10">
          <Link2 className="h-4 w-4 text-primary" />
        </div>
        Link Google Form
      </Label>
      <div className="relative group">
        <Input
          id="form-url"
          type="url"
          placeholder="https://docs.google.com/forms/d/e/1FAIpQLSe.../viewform"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 pl-5 pr-5 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card rounded-xl text-base transition-all duration-300 placeholder:text-muted-foreground/50"
        />
        <div className="absolute inset-0 rounded-xl gradient-primary opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none" />
      </div>
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
        Dán link Google Form ở chế độ xem (viewform)
      </p>
    </div>
  );
}
