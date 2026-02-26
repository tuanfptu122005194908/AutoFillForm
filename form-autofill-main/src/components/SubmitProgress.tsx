import { Play, Square, RotateCcw, CheckCircle2, AlertCircle, Pause, Rocket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SubmitStatus } from '@/types/form';
import { cn } from '@/lib/utils';

interface SubmitProgressProps {
  status: SubmitStatus;
  responsesCount: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function SubmitProgress({
  status,
  responsesCount,
  onStart,
  onStop,
  onReset,
}: SubmitProgressProps) {
  const progress = status.total > 0 ? (status.current / status.total) * 100 : 0;

  const getStatusConfig = () => {
    switch (status.status) {
      case 'generating':
        return { 
          color: 'text-primary', 
          bgColor: 'bg-primary/10',
          progressColor: 'bg-primary',
          icon: <Loader2 className="h-5 w-5 animate-spin" />
        };
      case 'submitting':
        return { 
          color: 'text-accent', 
          bgColor: 'bg-accent/10',
          progressColor: 'bg-accent',
          icon: <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        };
      case 'completed':
        return { 
          color: 'text-success', 
          bgColor: 'bg-success/10',
          progressColor: 'bg-success',
          icon: <CheckCircle2 className="h-5 w-5" />
        };
      case 'error':
        return { 
          color: 'text-destructive', 
          bgColor: 'bg-destructive/10',
          progressColor: 'bg-destructive',
          icon: <AlertCircle className="h-5 w-5" />
        };
      case 'paused':
        return { 
          color: 'text-warning', 
          bgColor: 'bg-warning/10',
          progressColor: 'bg-warning',
          icon: <Pause className="h-5 w-5" />
        };
      default:
        return { 
          color: 'text-muted-foreground', 
          bgColor: 'bg-muted',
          progressColor: 'bg-muted-foreground',
          icon: null 
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-5">
      {/* Progress display */}
      {status.status !== 'idle' && (
        <div className={cn('space-y-4 p-5 rounded-2xl border', config.bgColor, 'border-current/10')}>
          <div className="flex items-center justify-between">
            <div className={cn('flex items-center gap-3 font-semibold', config.color)}>
              {config.icon}
              <span>{status.message}</span>
            </div>
            {status.total > 0 && (
              <div className={cn('px-3 py-1.5 rounded-lg font-mono font-bold text-sm', config.bgColor, config.color)}>
                {status.current} / {status.total}
              </div>
            )}
          </div>
          {status.total > 0 && (
            <div className="relative">
              <Progress value={progress} className="h-3 rounded-full bg-muted/50" />
              <div 
                className={cn('absolute top-0 left-0 h-3 rounded-full transition-all duration-500', config.progressColor)}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        {status.status === 'submitting' ? (
          <Button
            onClick={onStop}
            variant="destructive"
            className="flex-1 h-14 gap-3 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Square className="h-5 w-5" />
            Dừng lại
          </Button>
        ) : (
          <Button
            onClick={onStart}
            disabled={responsesCount === 0 || status.status === 'generating'}
            className="flex-1 h-14 gap-3 font-bold text-base rounded-xl gradient-accent text-accent-foreground shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50"
          >
            <Rocket className="h-5 w-5" />
            Gửi Form ({responsesCount})
          </Button>
        )}
        <Button
          onClick={onReset}
          variant="outline"
          className="h-14 px-6 gap-2 font-semibold rounded-xl border-2 hover:bg-muted transition-all duration-300"
          disabled={status.status === 'submitting' || status.status === 'generating'}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
