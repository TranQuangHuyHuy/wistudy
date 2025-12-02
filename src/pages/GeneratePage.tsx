import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { backgrounds } from '@/data/backgrounds';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function GeneratePage() {
  const navigate = useNavigate();
  const { userData, setGeneratedImage } = useWiStudy();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(userData.generatedImage);
  const hasGeneratedRef = useRef(false);
  const [userName, setUserName] = useState<string>('bạn');

  const selectedBg = backgrounds.find(b => b.id === userData.selectedBackground);
  const customBackground = userData.selectedBackground?.startsWith('data:') ? userData.selectedBackground : null;

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) {
          const nameParts = profile.full_name.trim().split(' ');
          setUserName(nameParts[nameParts.length - 1]);
        }
      }
    };
    fetchUserName();
  }, []);

  const generateImage = async () => {
    if (!userData.idolImage) {
      toast.error('Vui lòng tải ảnh idol lên');
      navigate('/upload-idol');
      return;
    }

    setIsGenerating(true);
    toast.info('Đang tạo ảnh với AI...');

    try {
      const backgroundPrompt = selectedBg?.prompt || 'cozy modern study room with warm lighting';
      
      const { data, error } = await supabase.functions.invoke('generate-study-image', {
        body: {
          idolImageBase64: userData.idolImage,
          userImageBase64: userData.userImage !== 'anonymous' ? userData.userImage : null,
          backgroundPrompt
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Không thể tạo ảnh');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.imageUrl) {
        setGeneratedPreview(data.imageUrl);
        toast.success('Đã tạo ảnh thành công!');
      } else {
        // Fallback: use idol image as preview if AI fails
        setGeneratedPreview(userData.idolImage);
        toast.info('Đã sử dụng ảnh idol làm preview');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to idol image
      setGeneratedPreview(userData.idolImage);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra, đã sử dụng ảnh idol');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Chỉ tự động gen 1 lần khi chưa có ảnh
    if (!generatedPreview && userData.idolImage && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
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
              Ảnh học tập
            </h1>
            <p className="text-muted-foreground text-sm">
              {selectedBg ? `Background: ${selectedBg.nameVi}` : customBackground ? 'Background tùy chỉnh' : 'Đang tạo ảnh...'}
            </p>
          </div>

          {/* Generated Image Preview */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-border">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent-blue/30 to-accent-pink/30">
                <div className="p-4 bg-accent-blue rounded-full mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">Đang tạo ảnh với AI...</p>
                <p className="text-xs text-muted-foreground mt-1">Có thể mất 10-30 giây</p>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Button onClick={generateImage} variant="pastel">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo ảnh
                </Button>
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
              💡 <strong>Mẹo:</strong> Ảnh được tạo bằng AI. Nếu không hài lòng, {userName} có thể tạo lại nhiều lần.
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
