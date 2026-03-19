import { useState } from 'react';
import { Key, ChevronDown, ChevronUp, Sparkles, Zap, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SavedApiKeys } from './SavedApiKeys';

export type ApiProvider = 'lovable' | 'gemini' | 'groq';

interface ApiSettingsProps {
  provider: ApiProvider;
  onProviderChange: (provider: ApiProvider) => void;
  geminiApiKey: string;
  onGeminiApiKeyChange: (key: string) => void;
  groqApiKey: string;
  onGroqApiKeyChange: (key: string) => void;
}

const providerInfo = {
  lovable: {
    name: 'Lovable AI (Mặc định)',
    description: 'Sử dụng AI tích hợp sẵn, không cần API key',
    icon: Sparkles,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Sử dụng API key từ Google AI Studio',
    icon: Bot,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  groq: {
    name: 'Groq',
    description: 'Sử dụng API key từ Groq (siêu nhanh)',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
};

export function ApiSettings({
  provider,
  onProviderChange,
  geminiApiKey,
  onGeminiApiKeyChange,
  groqApiKey,
  onGroqApiKeyChange,
}: ApiSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentProvider = providerInfo[provider];
  const Icon = currentProvider.icon;

  const handleSelectSavedKey = (savedProvider: 'gemini' | 'groq', key: string) => {
    if (savedProvider === 'gemini') {
      onGeminiApiKeyChange(key);
      onProviderChange('gemini');
    } else {
      onGroqApiKeyChange(key);
      onProviderChange('groq');
    }
  };

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-14 justify-between px-4 rounded-xl border-2 hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentProvider.bgColor}`}>
                <Icon className={`h-4 w-4 ${currentProvider.color}`} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">{currentProvider.name}</div>
                <div className="text-xs text-muted-foreground">{currentProvider.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Cài đặt API</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-4 animate-fade-in">
          <div className="p-5 rounded-xl bg-muted/50 border border-border/50 space-y-5">
            {/* Provider Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-semibold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Key className="h-3.5 w-3.5 text-primary" />
                </div>
                Chọn nhà cung cấp AI
              </Label>
              <Select value={provider} onValueChange={(val) => onProviderChange(val as ApiProvider)}>
                <SelectTrigger className="h-12 rounded-xl bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(providerInfo).map(([key, info]) => {
                    const ProviderIcon = info.icon;
                    return (
                      <SelectItem key={key} value={key} className="py-3">
                        <div className="flex items-center gap-3">
                          <ProviderIcon className={`h-4 w-4 ${info.color}`} />
                          <span>{info.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Gemini API Key */}
            {provider === 'gemini' && (
              <div className="space-y-3 animate-fade-in">
                <Label htmlFor="gemini-key" className="flex items-center gap-2 font-semibold">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Bot className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Google Gemini API Key
                </Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => onGeminiApiKeyChange(e.target.value)}
                  className="h-12 rounded-xl bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Lấy API key miễn phí tại{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            )}

            {/* Groq API Key */}
            {provider === 'groq' && (
              <div className="space-y-3 animate-fade-in">
                <Label htmlFor="groq-key" className="flex items-center gap-2 font-semibold">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <Zap className="h-3.5 w-3.5 text-orange-500" />
                  </div>
                  Groq API Key
                </Label>
                <Input
                  id="groq-key"
                  type="password"
                  placeholder="gsk_..."
                  value={groqApiKey}
                  onChange={(e) => onGroqApiKeyChange(e.target.value)}
                  className="h-12 rounded-xl bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Lấy API key miễn phí tại{' '}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    Groq Console
                  </a>
                </p>
              </div>
            )}

            {provider === 'lovable' && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Lovable AI</span> được tích hợp sẵn và không cần API key. Đây là lựa chọn mặc định và dễ dùng nhất.
                </p>
              </div>
            )}

            {/* Saved API Keys */}
            <div className="pt-2 border-t border-border/50">
              <SavedApiKeys onSelectKey={handleSelectSavedKey} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
