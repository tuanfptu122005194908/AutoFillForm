import { FormField } from '@/types/form';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Circle, AlignLeft, List, BarChart3, FileQuestion } from 'lucide-react';

interface FieldsListProps {
  fields: FormField[];
}

function getTypeIcon(type: number) {
  switch (type) {
    case 0:
    case 1:
      return <AlignLeft className="h-4 w-4" />;
    case 2:
      return <Circle className="h-4 w-4" />;
    case 3:
      return <List className="h-4 w-4" />;
    case 4:
      return <CheckSquare className="h-4 w-4" />;
    case 5:
      return <BarChart3 className="h-4 w-4" />;
    default:
      return <AlignLeft className="h-4 w-4" />;
  }
}

function getTypeColor(type: number): string {
  switch (type) {
    case 2:
      return 'bg-primary/10 text-primary border-primary/20';
    case 3:
      return 'bg-accent/10 text-accent border-accent/20';
    case 4:
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 5:
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function FieldsList({ fields }: FieldsListProps) {
  if (fields.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground font-medium">
          Chưa có câu hỏi nào
        </p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Dán HTML và nhấn "Phân tích Form" để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="gradient-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow-glow-sm">
          {fields.length}
        </div>
        <div>
          <h3 className="text-lg font-bold">Câu hỏi đã phát hiện</h3>
          <p className="text-sm text-muted-foreground">Sẵn sàng để tạo câu trả lời</p>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
        {fields.map((field, index) => (
          <div
            key={field.entryId}
            className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg ${getTypeColor(field.type)}`}>
                {getTypeIcon(field.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground line-clamp-2">{field.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className={`text-xs font-medium ${getTypeColor(field.type)} border`}>
                    {field.typeLabel}
                  </Badge>
                  <code className="text-xs bg-muted px-2 py-1 rounded-md font-mono text-muted-foreground">
                    {field.entryId}
                  </code>
                </div>
                {field.options && field.options.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <span className="font-medium">Lựa chọn:</span> 
                    <span className="truncate">{field.options.slice(0, 3).join(' • ')}</span>
                    {field.options.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{field.options.length - 3}
                      </Badge>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
