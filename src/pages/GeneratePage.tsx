import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { backgrounds } from '@/data/backgrounds';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GeneratedImage {
  id: string;
  image_url: string;
  background_prompt: string | null;
  created_at: string;
}

export default function GeneratePage() {
  const navigate = useNavigate();
  const { userData, setGeneratedImage } = useWiStudy();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(userData.generatedImage);
  const hasGeneratedRef = useRef(false);
  const [userName, setUserName] = useState<string>('bạn');
  const [todayImages, setTodayImages] = useState<GeneratedImage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const maxDailyGenerations = 2;

  const isTextPrompt = userData.selectedBackground?.startsWith('text:');
  const textPromptValue = isTextPrompt ? userData.selectedBackground?.substring(5) : null;
  const selectedBg = !isTextPrompt ? backgrounds.find(b => b.id === userData.selectedBackground) : null;
  const customBackground = userData.selectedBackground?.startsWith('data:') ? userData.selectedBackground : null;

  useEffect(() => {
    const fetchUserAndImages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (profile?.full_name) {
        const nameParts = profile.full_name.trim().split(' ');
        setUserName(nameParts[nameParts.length - 1]);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: images } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });

      const typedImages = (images || []) as GeneratedImage[];
      setTodayImages(typedImages);
      setIsLoadingHistory(false);

      if (typedImages.length > 0) {
        setGeneratedPreview(typedImages[0].image_url);
      }
    };
    
    fetchUserAndImages();
  }, [navigate]);

  useEffect(() => {
    if (!isLoadingHistory && todayImages.length === 0 && userData.idolImage && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateImage();
    }
  }, [isLoadingHistory, todayImages.length, userData.idolImage]);

  const remainingGenerations = Math.max(0, maxDailyGenerations - todayImages.length);

  const saveGeneratedImage = async (imageUrl: string) => {
    if (!userId) return;

    const backgroundPrompt = textPromptValue || selectedBg?.prompt || 'cozy modern study room with warm lighting';

    const { data, error } = await supabase
      .from('generated_images')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        background_prompt: backgroundPrompt
      })
      .select()
      .single();

    if (!error && data) {
      const typedData = data as GeneratedImage;
      setTodayImages(prev => [typedData, ...prev]);
    }
  };

  const generateImage = async () => {
    if (!userData.idolImage) {
      navigate('/upload-idol');
      return;
    }

    if (remainingGenerations <= 0 && todayImages.length > 0) {
      setGeneratedPreview(todayImages[0].image_url);
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
        await saveGeneratedImage(data.imageUrl);
      } else {
        setGeneratedPreview(userData.idolImage);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneratedPreview(userData.idolImage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (remainingGenerations > 0) {
      generateImage();
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setGeneratedPreview(imageUrl);
  };

  const handleContinue = () => {
    if (!generatedPreview) {
      return;
    }
    setGeneratedImage(generatedPreview);
    navigate('/choose-music');
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-5 w-52 h-52 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-5 w-64 h-64 bg-accent-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <button onClick={() => navigate('/choose-background')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition overflow-y-auto relative z-10">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center animate-fade-in">
            <StepIndicator currentStep={3} totalSteps={6} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2 animate-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Ảnh học tập
            </h1>
            <p className="text-muted-foreground text-sm">
              {selectedBg ? `Background: ${selectedBg.nameVi}` : isTextPrompt ? 'Background từ mô tả' : customBackground ? 'Background tùy chỉnh' : 'Đang tạo ảnh...'}
            </p>
          </div>

          {/* Generated Image Preview */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-accent-gray border-2 border-border shadow-xl animate-scale-in">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-accent-blue/50 to-accent-pink/50">
                <div className="p-6 bg-gradient-to-br from-accent-blue to-accent-pink rounded-3xl mb-5 shadow-2xl animate-pulse">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <p className="text-base text-foreground font-bold">Đang tạo ảnh với AI...</p>
                <p className="text-sm text-muted-foreground mt-2">Có thể mất 10-30 giây</p>
                <div className="mt-5 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : generatedPreview ? (
              <img
                src={generatedPreview}
                alt="Generated study image"
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Button onClick={generateImage} disabled={remainingGenerations <= 0}>
                  <Sparkles className="w-5 h-5 mr-2" />
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
              disabled={remainingGenerations <= 0}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {remainingGenerations > 0 
                ? `Tạo lại ảnh khác (còn ${remainingGenerations} lần hôm nay)`
                : 'Đã hết lượt tạo hôm nay'}
            </Button>
          )}

          {/* Today's Generated Images Gallery */}
          {todayImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                📸 Ảnh đã tạo hôm nay ({todayImages.length}/{maxDailyGenerations} lượt)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {todayImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img.image_url)}
                    className={cn(
                      "aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] opacity-0 animate-scale-in",
                      generatedPreview === img.image_url 
                        ? "border-primary ring-4 ring-primary/20 shadow-lg shadow-primary/20" 
                        : "border-border hover:border-primary/50 hover:shadow-lg"
                    )}
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <img src={img.image_url} alt="Generated" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Out of generations message */}
          {remainingGenerations === 0 && todayImages.length > 0 && (
            <div className="p-5 bg-amber-500/10 rounded-2xl border-2 border-amber-500/30 glass-card">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  Đã hết lượt tạo ảnh hôm nay. Lượt mới sẽ reset vào <strong>00:00</strong> ngày mai.
                  <br />
                  Bạn có thể chọn một trong các ảnh đã tạo ở trên.
                </span>
              </p>
            </div>
          )}

          {/* Info Card */}
          <div className="p-5 bg-gradient-to-r from-accent-blue/50 to-accent-pink/40 rounded-2xl border border-primary/30 glass-card">
            <p className="text-sm text-foreground leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Mẹo:</strong> Ảnh được tạo bằng AI. Mỗi ngày {userName} có thể tạo tối đa 2 ảnh (reset lúc 00:00).</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-xl flex justify-center relative z-10">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto"
          onClick={handleContinue}
          disabled={isGenerating || !generatedPreview}
        >
          Chọn nhạc
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
