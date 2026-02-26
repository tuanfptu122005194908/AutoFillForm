import { Eye, ChevronDown, FileText } from 'lucide-react';
import { GeneratedResponse } from '@/types/form';
import { FormField } from '@/types/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsePreviewProps {
  responses: GeneratedResponse[];
  fields: FormField[];
}

export function ResponsePreview({ responses, fields }: ResponsePreviewProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

  if (responses.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    const newSet = new Set(openItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setOpenItems(newSet);
  };

  const getFieldName = (entryId: string) => {
    const field = fields.find((f) => f.entryId === entryId);
    return field?.name || entryId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent/10">
          <Eye className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Xem trước câu trả lời</h3>
          <p className="text-sm text-muted-foreground">Kiểm tra trước khi gửi</p>
        </div>
        <Badge className="gradient-accent text-accent-foreground px-3 py-1 text-sm font-bold">
          {responses.length} bộ
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {responses.map((response, index) => (
          <Collapsible
            key={index}
            open={openItems.has(index)}
            onOpenChange={() => toggleItem(index)}
          >
            <div 
              className="overflow-hidden rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-300 animate-fade-in" 
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <div className="gradient-accent text-accent-foreground w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold">Response #{index + 1}</span>
                    <p className="text-xs text-muted-foreground">{Object.keys(response).length} câu trả lời</p>
                  </div>
                </div>
                <div className={cn(
                  'p-2 rounded-lg bg-muted transition-all duration-300',
                  openItems.has(index) && 'bg-accent/10'
                )}>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-300',
                      openItems.has(index) && 'rotate-180 text-accent'
                    )}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                  {Object.entries(response).map(([entryId, value]) => (
                    <div key={entryId} className="p-3 rounded-lg bg-card border border-border/50">
                      <p className="text-muted-foreground text-xs font-medium mb-1.5 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        {getFieldName(entryId)}
                      </p>
                      <p className="font-medium text-sm leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
