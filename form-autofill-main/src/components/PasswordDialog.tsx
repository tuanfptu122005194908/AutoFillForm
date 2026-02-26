import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const CORRECT_PASSWORD = '122005';

export function PasswordDialog({
  open,
  onOpenChange,
  onSuccess,
  title = 'Nhập mật khẩu',
  description = 'Vui lòng nhập mật khẩu để tiếp tục',
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      setPassword('');
      setError('');
      onOpenChange(false);
      onSuccess();
    } else {
      setError('Mật khẩu không đúng');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-strong border-0">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <div className={`relative ${isShaking ? 'animate-shake' : ''}`}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`h-14 pr-12 rounded-xl text-center text-lg font-semibold tracking-widest bg-muted/50 border-2 ${
                  error ? 'border-destructive' : 'border-transparent focus:border-primary'
                }`}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-muted rounded-lg"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive text-center animate-fade-in flex items-center justify-center gap-1">
                <X className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-14 gap-3 font-bold text-lg rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            <ShieldCheck className="h-5 w-5" />
            Xác nhận
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
