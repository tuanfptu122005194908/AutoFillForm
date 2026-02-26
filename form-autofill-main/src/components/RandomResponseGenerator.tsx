import { useState, useEffect, useCallback } from 'react';
import { Shuffle, Play, Percent } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField, GeneratedResponse } from '@/types/form';
import { toast } from '@/hooks/use-toast';

interface RandomResponseGeneratorProps {
  fields: FormField[];
  onResponsesReady: (responses: GeneratedResponse[]) => void;
}

interface FieldPercentages {
  [entryId: string]: number[];
}

interface FieldTextAnswers {
  [entryId: string]: string;
}

/**
 * Distribute `remaining` among `count` slots, each > 0, summing to `remaining`.
 * Values are rounded to 2 decimals.
 */
function randomDistribute(remaining: number, count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [Math.round(remaining * 100) / 100];

  // Generate random breakpoints
  const breaks: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    // Ensure each slot gets at least 0.01%
    breaks.push(Math.random());
  }
  breaks.sort((a, b) => a - b);

  const raw: number[] = [];
  let prev = 0;
  for (const b of breaks) {
    raw.push(b - prev);
    prev = b;
  }
  raw.push(1 - prev);

  // Scale to remaining, ensure min 0.01
  const minVal = 0.01;
  const totalMin = minVal * count;
  const distributable = remaining - totalMin;

  if (distributable < 0) {
    // Edge case: not enough to give everyone 0.01
    const each = Math.round((remaining / count) * 100) / 100;
    const result = Array(count).fill(each);
    // Fix rounding
    const diff = Math.round((remaining - each * count) * 100) / 100;
    result[0] = Math.round((result[0] + diff) * 100) / 100;
    return result;
  }

  const result = raw.map(r => Math.round((minVal + r * distributable) * 100) / 100);

  // Fix rounding error on last element
  const sum = result.reduce((a, b) => a + b, 0);
  const diff = Math.round((remaining - sum) * 100) / 100;
  result[result.length - 1] = Math.round((result[result.length - 1] + diff) * 100) / 100;

  return result;
}

function initPercentages(fields: FormField[]): FieldPercentages {
  const p: FieldPercentages = {};
  for (const field of fields) {
    if ([2, 3, 4].includes(field.type) && field.options && field.options.length > 0) {
      p[field.entryId] = randomDistribute(100, field.options.length);
    } else if (field.type === 5) {
      const min = field.scaleMin ?? 1;
      const max = field.scaleMax ?? 5;
      const count = max - min + 1;
      p[field.entryId] = randomDistribute(100, count);
    }
  }
  return p;
}

export function RandomResponseGenerator({ fields, onResponsesReady }: RandomResponseGeneratorProps) {
  const [count, setCount] = useState(5);
  const [percentages, setPercentages] = useState<FieldPercentages>(() => initPercentages(fields));
  const [textAnswers, setTextAnswers] = useState<FieldTextAnswers>({});
  // Track which percentages user manually set (by index)
  const [userSet, setUserSet] = useState<{ [entryId: string]: Set<number> }>({});

  useEffect(() => {
    setPercentages(initPercentages(fields));
    setUserSet({});
  }, [fields]);

  const handlePercentageChange = useCallback((entryId: string, index: number, value: string, optionCount: number) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0 || numVal > 100) return;

    setUserSet(prev => {
      const s = new Set(prev[entryId] || []);
      s.add(index);
      return { ...prev, [entryId]: s };
    });

    setPercentages(prev => {
      const current = [...(prev[entryId] || Array(optionCount).fill(0))];
      current[index] = numVal;

      // Get user-set indices including the new one
      const manualIndices = new Set(userSet[entryId] || []);
      manualIndices.add(index);

      const manualSum = Array.from(manualIndices).reduce((sum, i) => sum + (i === index ? numVal : current[i]), 0);
      const remaining = Math.max(0, 100 - manualSum);
      const autoIndices = Array.from({ length: optionCount }, (_, i) => i).filter(i => !manualIndices.has(i));

      if (autoIndices.length > 0) {
        const distributed = randomDistribute(remaining, autoIndices.length);
        autoIndices.forEach((ai, di) => {
          current[ai] = distributed[di];
        });
      }

      return { ...prev, [entryId]: current };
    });
  }, [userSet]);

  const handleTextChange = (entryId: string, value: string) => {
    setTextAnswers(prev => ({ ...prev, [entryId]: value }));
  };

  const handleGenerate = () => {
    const responses: GeneratedResponse[] = [];

    for (let i = 0; i < count; i++) {
      const resp: GeneratedResponse = {};

      for (const field of fields) {
        if ([2, 3].includes(field.type)) {
          // Radio / Dropdown - pick one based on percentages
          if (field.options && field.options.length > 0) {
            resp[field.entryId] = weightedPick(field.options, percentages[field.entryId]);
          }
        } else if (field.type === 4) {
          // Checkbox - pick one based on percentages
          if (field.options && field.options.length > 0) {
            resp[field.entryId] = weightedPick(field.options, percentages[field.entryId]);
          }
        } else if (field.type === 5) {
          // Scale
          const min = field.scaleMin ?? 1;
          const max = field.scaleMax ?? 5;
          const values = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
          resp[field.entryId] = weightedPick(values, percentages[field.entryId]);
        } else {
          // Text fields - pick from user lines or empty
          const lines = (textAnswers[field.entryId] || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length > 0) {
            resp[field.entryId] = lines[Math.floor(Math.random() * lines.length)];
          } else {
            resp[field.entryId] = '';
          }
        }
      }

      responses.push(resp);
    }

    onResponsesReady(responses);
    toast({
      title: 'Đã tạo xong',
      description: `Đã random ${responses.length} bộ câu trả lời theo tỷ lệ`,
    });
  };

  const choiceFields = fields.filter(f => [2, 3, 4].includes(f.type) && f.options && f.options.length > 0);
  const scaleFields = fields.filter(f => f.type === 5);
  const textFields = fields.filter(f => [0, 1].includes(f.type));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/10">
            <Shuffle className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Random theo tỷ lệ</h3>
            <p className="text-sm text-muted-foreground">
              Phân bổ tỷ lệ % cho từng đáp án, tổng luôn = 100%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Số lượng response</Label>
        <Input
          type="number"
          min={1}
          max={500}
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          className="h-11 bg-muted/50 border-2 border-transparent focus:border-accent rounded-xl max-w-[200px]"
        />
      </div>

      {/* Choice fields with percentage inputs */}
      {choiceFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Tỷ lệ đáp án trắc nghiệm</Label>
          </div>
          {choiceFields.map(field => (
            <PercentageField
              key={field.entryId}
              field={field}
              values={percentages[field.entryId] || []}
              onChange={(idx, val) => handlePercentageChange(field.entryId, idx, val, field.options!.length)}
            />
          ))}
        </div>
      )}

      {/* Scale fields with percentage inputs */}
      {scaleFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Tỷ lệ thang đo</Label>
          </div>
          {scaleFields.map(field => {
            const min = field.scaleMin ?? 1;
            const max = field.scaleMax ?? 5;
            const scaleOptions = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
            return (
              <PercentageField
                key={field.entryId}
                field={{ ...field, options: scaleOptions }}
                values={percentages[field.entryId] || []}
                onChange={(idx, val) => handlePercentageChange(field.entryId, idx, val, scaleOptions.length)}
              />
            );
          })}
        </div>
      )}

      {/* Text fields */}
      {textFields.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Câu trả lời tự luận (mỗi dòng = 1 câu trả lời mẫu)</Label>
          {textFields.map(field => (
            <div key={field.entryId} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{field.name}</p>
              <Textarea
                placeholder={`Nhập mỗi dòng 1 câu trả lời mẫu...\nVí dụ:\nRất hay\nTuyệt vời\nTốt lắm`}
                value={textAnswers[field.entryId] || ''}
                onChange={(e) => handleTextChange(field.entryId, e.target.value)}
                className="min-h-[80px] bg-muted/50 border-2 border-transparent focus:border-accent rounded-xl text-sm"
                rows={3}
              />
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleGenerate}
        className="w-full h-12 gap-2 rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 transition-all shadow-lg"
      >
        <Play className="h-4 w-4" />
        Random {count} bộ câu trả lời
      </Button>
    </div>
  );
}

function weightedPick(options: string[], weights: number[] | undefined): string {
  if (!weights || weights.length !== options.length) {
    return options[Math.floor(Math.random() * options.length)];
  }
  const r = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < options.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) return options[i];
  }
  return options[options.length - 1];
}

function PercentageField({
  field,
  values,
  onChange,
}: {
  field: FormField & { options?: string[] };
  values: number[];
  onChange: (index: number, value: string) => void;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  const totalRounded = Math.round(total * 100) / 100;

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium truncate max-w-[70%]">{field.name}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          Math.abs(totalRounded - 100) < 0.1
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          Tổng: {totalRounded}%
        </span>
      </div>
      <div className="grid gap-2">
        {(field.options || []).map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex-1 truncate">{opt}</span>
            <div className="flex items-center gap-1 w-24">
              <Input
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={values[idx] ?? 0}
                onChange={(e) => onChange(idx, e.target.value)}
                className="h-8 text-xs text-right bg-background/80 border border-border/50 rounded-lg px-2"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
