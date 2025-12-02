import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { backgrounds } from '@/data/backgrounds';
import { toast } from 'sonner';

export default function GeneratePage() {
  const navigate = useNavigate();
  const { userData, setGeneratedImage } = useWiStudy();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(userData.generatedImage);

  const selectedBg = backgrounds.find(b => b.id === userData.selectedBackground);

  // Simulate image generation (will be replaced with actual AI call)
  const generateImage = async () => {
    setIsGenerating(true);
    toast.info('Đang tạo ảnh...');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now, use the idol image as preview
    // This will be replaced with actual AI-generated image
    setGeneratedPreview(userData.idolImage);
    setIsGenerating(false);
    toast.success('Đã tạo ảnh thành công!');
  };

  useEffect(() => {
    if (!generatedPreview && userData.idolImage) {
      generateImage();
    }
  }, []);

  const handleRegenerate = () => {
    generateImage();
  };

  const handleContinue = () => {
    if (!generatedPreview) {
      toast.error('Vui lòng tạo ảnh trước');
      return;
    }
    setGeneratedImage(generatedPreview);
    navigate('/pomodoro-setup');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/choose-background')} className="p-2 -m-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 animate-slide-up">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={3} totalSteps={4} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Ảnh học cùng Idol
            </h1>
            <p className="text-muted-foreground text-sm">
              {selectedBg ? `Background: ${selectedBg.nameVi}` : 'Đang tạo ảnh...'}
            </p>
          </div>

          {/* Generated Image Preview */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-border">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="p-4 bg-accent-blue rounded-full mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Đang tạo ảnh với AI...</p>
                <div className="mt-4 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : generatedPreview ? (
              <img
                src={generatedPreview}
                alt="Generated study image"
                className="w-full h-full object-cover animate-scale-in"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Nhấn để tạo ảnh</p>
              </div>
            )}
          </div>

          {/* Regenerate Button */}
          {!isGenerating && generatedPreview && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleRegenerate}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tạo lại ảnh khác
            </Button>
          )}

          {/* Info Card */}
          <div className="p-4 bg-accent-blue/50 rounded-xl">
            <p className="text-sm text-foreground">
              💡 <strong>Mẹo:</strong> Ảnh được tạo bằng AI. Nếu không hài lòng, bạn có thể tạo lại nhiều lần.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card">
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={isGenerating || !generatedPreview}
        >
          Thiết lập Pomodoro
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
