import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { backgrounds } from '@/data/backgrounds';
import { supabase } from '@/integrations/supabase/client';

export default function GeneratePage() {
  const navigate = useNavigate();
  const { userData, setGeneratedImage } = useWiStudy();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(userData.generatedImage);
  const hasGeneratedRef = useRef(false);
  const [userName, setUserName] = useState<string>('bạn');

  const isTextPrompt = userData.selectedBackground?.startsWith('text:');
  const isGalleryImage = userData.selectedBackground?.startsWith('gallery:');
  const textPromptValue = isTextPrompt ? userData.selectedBackground?.substring(5) : null;
  const galleryImageSrc = isGalleryImage ? userData.selectedBackground?.substring(8) : null;
  const selectedBg = !isTextPrompt && !isGalleryImage ? backgrounds.find(b => b.id === userData.selectedBackground) : null;
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
      navigate('/upload-idol');
      return;
    }

    setIsGenerating(true);

    try {
      const backgroundPrompt = textPromptValue || selectedBg?.prompt || 'cozy modern study room with warm lighting';
      
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
      } else {
        // Fallback: use idol image as preview if AI fails
        setGeneratedPreview(userData.idolImage);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to idol image
      setGeneratedPreview(userData.idolImage);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Nếu là ảnh từ thư viện, dùng trực tiếp không cần AI
    if (isGalleryImage && galleryImageSrc) {
      setGeneratedPreview(galleryImageSrc);
      return;
    }
    
    // Chỉ tự động gen 1 lần khi chưa có ảnh
    if (!generatedPreview && userData.idolImage && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateImage();
    }
  }, [isGalleryImage, galleryImageSrc]);

  const handleRegenerate = () => {
    generateImage();
  };

  const handleContinue = () => {
    if (!generatedPreview) {
      return;
    }
    setGeneratedImage(generatedPreview);
    navigate('/choose-music');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/choose-background')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={3} totalSteps={6} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Ảnh học tập
            </h1>
            <p className="text-muted-foreground text-sm">
              {selectedBg ? `Background: ${selectedBg.nameVi}` : isTextPrompt ? 'Background từ mô tả' : isGalleryImage ? 'Background từ thư viện' : customBackground ? 'Background tùy chỉnh' : 'Đang tạo ảnh...'}
            </p>
          </div>

          {/* Generated Image Preview */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-accent-gray border border-border shadow-card">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent-blue/40 to-accent-pink/40">
                <div className="p-5 bg-gradient-to-br from-accent-blue to-accent-pink rounded-2xl mb-4 animate-pulse shadow-soft">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-foreground font-semibold">Đang tạo ảnh với AI...</p>
                <p className="text-xs text-muted-foreground mt-1">Có thể mất 10-30 giây</p>
                <div className="mt-4 flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
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
                <Button onClick={generateImage} className="shadow-soft">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo ảnh
                </Button>
              </div>
            )}
          </div>

          {/* Regenerate Button - Only show for AI-generated images */}
          {!isGenerating && generatedPreview && !isGalleryImage && (
            <Button
              variant="secondary"
              className="w-full shadow-soft"
              onClick={handleRegenerate}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tạo lại ảnh khác
            </Button>
          )}

          {/* Info Card - Only show for AI-generated images */}
          {!isGalleryImage && (
            <div className="p-4 bg-gradient-to-r from-accent-blue/40 to-accent-pink/30 rounded-2xl border border-primary/20">
              <p className="text-sm text-foreground leading-relaxed">
                💡 <strong>Mẹo:</strong> Ảnh được tạo bằng AI. Nếu không hài lòng, {userName} có thể tạo lại nhiều lần.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm flex justify-center">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto shadow-soft"
          onClick={handleContinue}
          disabled={isGenerating || !generatedPreview}
        >
          Chọn nhạc
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
