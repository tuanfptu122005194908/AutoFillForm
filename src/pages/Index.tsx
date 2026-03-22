import { useState } from 'react';
import { Zap, Bot, Sparkles, Send, Facebook, PenLine, Shuffle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormUrlInput } from '@/components/FormUrlInput';
import { HtmlSourceInput } from '@/components/HtmlSourceInput';
import { FieldsList } from '@/components/FieldsList';
import { GenerateControls } from '@/components/GenerateControls';
import { SubmitProgress } from '@/components/SubmitProgress';
import { ResponsePreview } from '@/components/ResponsePreview';
import { ApiSettings } from '@/components/ApiSettings';
import { PasswordDialog } from '@/components/PasswordDialog';
import { FormSetupGuide } from '@/components/FormSetupGuide';
import { ManualResponseInput } from '@/components/ManualResponseInput';
import { RandomResponseGenerator } from '@/components/RandomResponseGenerator';
import { useFormAutoFill } from '@/hooks/useFormAutoFill';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneratedResponse } from '@/types/form';

const Index = () => {
  const {
    formUrl,
    setFormUrl,
    htmlSource,
    setHtmlSource,
    fields,
    submitCount,
    setSubmitCount,
    delayMs,
    setDelayMs,
    guideline,
    setGuideline,
    generatedResponses,
    setGeneratedResponses,
    status,
    analyzeForm,
    generateResponses,
    startSubmitting,
    stopSubmitting,
    reset,
    apiProvider,
    setApiProvider,
    geminiApiKey,
    setGeminiApiKey,
    groqApiKey,
    setGroqApiKey,
    isAuthenticated,
    setIsAuthenticated,
  } = useFormAutoFill();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'analyze' | 'submit' | null>(null);
  const [responseMode, setResponseMode] = useState<'ai' | 'manual' | 'random'>('ai');

  const handleManualResponsesReady = (responses: GeneratedResponse[]) => {
    setGeneratedResponses(responses);
  };

  const handleAnalyze = () => {
    if (!isAuthenticated) {
      setPendingAction('analyze');
      setShowPasswordDialog(true);
      return;
    }
    analyzeForm();
  };

  const handleStartSubmitting = () => {
    if (!isAuthenticated) {
      setPendingAction('submit');
      setShowPasswordDialog(true);
      return;
    }
    startSubmitting();
  };

  const handlePasswordSuccess = () => {
    setIsAuthenticated(true);
    if (pendingAction === 'analyze') {
      analyzeForm();
    } else if (pendingAction === 'submit') {
      startSubmitting();
    }
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb orb-primary w-[500px] h-[500px] -top-40 -right-40 animate-float" />
      <div className="orb orb-secondary w-[400px] h-[400px] top-1/2 -left-40 animate-float" style={{ animationDelay: '-2s' }} />
      <div className="orb orb-accent w-[300px] h-[300px] bottom-20 right-20 animate-float" style={{ animationDelay: '-4s' }} />

      {/* Password Dialog */}
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handlePasswordSuccess}
        title="Xác thực"
        description="Nhập mật khẩu để sử dụng tính năng này"
      />

      {/* Hero Header */}
      <header className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="container max-w-4xl relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass shadow-soft text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary animate-bounce-gentle" />
              <span>Powered by AI</span>
              <span className="w-2 h-2 rounded-full gradient-primary animate-pulse" />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="text-foreground">Auto Fill</span>
              <br />
              <span className="text-gradient-hero">Google Form</span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tự động tạo và gửi câu trả lời Google Form với AI. 
              <br className="hidden md:block" />
              Chỉ cần dán link và HTML, AI sẽ lo phần còn lại.
            </p>

            {/* Creator badge */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">by</span>
              <span className="text-sm font-semibold gradient-primary bg-clip-text text-transparent">Tuấn và Quân</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl pb-20 relative z-10">
        <Card className="glass-strong shadow-elevated border-0 p-0 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Card header decoration */}
          <div className="h-1.5 gradient-hero" />
          
          <div className="p-6 md:p-10 space-y-10">
            {/* Form Setup Guide */}
            <section className="animate-fade-in">
              <FormSetupGuide />
            </section>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* API Settings */}
            <section className="animate-fade-in">
              <ApiSettings
                provider={apiProvider}
                onProviderChange={setApiProvider}
                geminiApiKey={geminiApiKey}
                onGeminiApiKeyChange={setGeminiApiKey}
                groqApiKey={groqApiKey}
                onGroqApiKeyChange={setGroqApiKey}
              />
            </section>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Step 1: Form URL & HTML */}
            <section className="space-y-6 animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4">
                <div className="step-number gradient-primary text-primary-foreground w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-glow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Nhập thông tin Form</h2>
                  <p className="text-sm text-muted-foreground">Dán link và mã nguồn HTML của Google Form</p>
                </div>
              </div>
              <div className="space-y-6 pl-0 md:pl-16">
                <FormUrlInput value={formUrl} onChange={setFormUrl} />
                <HtmlSourceInput
                  value={htmlSource}
                  onChange={setHtmlSource}
                  onAnalyze={handleAnalyze}
                />
              </div>
            </section>

            {fields.length > 0 && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                
                {/* Step 2: Fields & Generate */}
                <section className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="step-number gradient-secondary text-secondary-foreground w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-glow-sm">
                      2
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">Tạo câu trả lời</h2>
                      <p className="text-sm text-muted-foreground">Chọn cách tạo câu trả lời bên dưới</p>
                    </div>
                  </div>
                  <div className="space-y-6 pl-0 md:pl-16">
                    <FieldsList fields={fields} />
                    
                    <Tabs value={responseMode} onValueChange={(v) => setResponseMode(v as 'ai' | 'manual' | 'random')} className="w-full">
                      <TabsList className="w-full h-14 p-1.5 rounded-xl bg-muted/50">
                        <TabsTrigger value="ai" className="flex-1 h-full gap-2 rounded-lg font-semibold data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                          <Bot className="h-4 w-4" />
                          AI
                        </TabsTrigger>
                        <TabsTrigger value="random" className="flex-1 h-full gap-2 rounded-lg font-semibold data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
                          <Shuffle className="h-4 w-4" />
                          Random
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="flex-1 h-full gap-2 rounded-lg font-semibold data-[state=active]:gradient-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md">
                          <PenLine className="h-4 w-4" />
                          Thủ công
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="ai" className="mt-6">
                        <GenerateControls
                          submitCount={submitCount}
                          onSubmitCountChange={setSubmitCount}
                          delayMs={delayMs}
                          onDelayChange={setDelayMs}
                          guideline={guideline}
                          onGuidelineChange={setGuideline}
                          onGenerate={generateResponses}
                          isGenerating={status.status === 'generating'}
                          fieldsCount={fields.length}
                        />
                      </TabsContent>

                      <TabsContent value="random" className="mt-6">
                        <RandomResponseGenerator
                          fields={fields}
                          onResponsesReady={handleManualResponsesReady}
                        />
                      </TabsContent>
                      
                      <TabsContent value="manual" className="mt-6">
                        <ManualResponseInput
                          fields={fields}
                          onResponsesReady={handleManualResponsesReady}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </section>
              </>
            )}

            {generatedResponses.length > 0 && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                
                {/* Step 3: Review & Submit */}
                <section className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="step-number gradient-accent text-accent-foreground w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-glow-sm">
                      3
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        Xem trước & Gửi
                        <Send className="h-5 w-5 text-accent" />
                      </h2>
                      <p className="text-sm text-muted-foreground">Kiểm tra và gửi các câu trả lời</p>
                    </div>
                  </div>
                  <div className="space-y-6 pl-0 md:pl-16">
                    <ResponsePreview responses={generatedResponses} fields={fields} />
                    <SubmitProgress
                      status={status}
                      responsesCount={generatedResponses.length}
                      onStart={handleStartSubmitting}
                      onStop={stopSubmitting}
                      onReset={reset}
                    />
                  </div>
                </section>
              </>
            )}
          </div>
        </Card>

        {/* Footer */}
        <footer className="text-center mt-12 space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Được phát triển bởi</span>
            <span className="text-sm font-bold text-gradient">Tuấn và Quân</span>
          </div>
          <a 
            href="https://www.facebook.com/tuanvaquan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass hover-lift text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <Facebook className="h-4 w-4" />
            Liên hệ Facebook
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Index;
