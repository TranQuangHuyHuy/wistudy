import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, UserX, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { ImageUploader } from '@/components/wistudy/ImageUploader';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { supabase } from '@/integrations/supabase/client';

export default function UploadIdolPage() {
  const navigate = useNavigate();
  const { userData, setIdolImage } = useWiStudy();
  const [localIdolImage, setLocalIdolImage] = useState<string | null>(userData.idolImage);
  const [isAnonymous, setIsAnonymous] = useState(userData.idolImage === 'anonymous');
  const [userName, setUserName] = useState<string>('bạn');

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

  const handleContinue = () => {
    if (!isAnonymous && !localIdolImage) {
      return;
    }
    setIdolImage(isAnonymous ? 'anonymous' : localIdolImage);
    navigate('/choose-background');
  };

  const handleToggleAnonymous = () => {
    setIsAnonymous(!isAnonymous);
    setLocalIdolImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-blue/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-5 w-52 h-52 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-5 w-64 h-64 bg-accent-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <button onClick={() => navigate('/')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition relative z-10">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center animate-fade-in">
            <StepIndicator currentStep={1} totalSteps={6} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2 animate-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Tải ảnh của {userName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Tải ảnh để AI tạo không gian học tập
            </p>
          </div>

          {/* Anonymous Mode Toggle */}
          <button
            onClick={handleToggleAnonymous}
            className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 glass-card animate-scale-in ${
              isAnonymous
                ? 'border-primary bg-gradient-to-r from-primary/10 to-accent-blue/20 shadow-lg shadow-primary/10'
                : 'border-border hover:border-primary/50 hover:shadow-lg'
            }`}
          >
            <div className={`p-3 rounded-xl transition-all duration-300 ${isAnonymous ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary'}`}>
              {isAnonymous ? <UserX className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-foreground">
                {isAnonymous ? 'Chế độ ẩn danh đang bật' : 'Chế độ ẩn danh'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAnonymous ? 'AI sẽ tạo người ngẫu nhiên' : 'Bật để AI tạo người ngẫu nhiên'}
              </p>
            </div>
            <div className={`w-14 h-8 rounded-full transition-all duration-300 relative ${isAnonymous ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isAnonymous ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </button>

          {/* Upload Areas - Only show when not anonymous */}
          {!isAnonymous && (
            <div className="space-y-5 animate-slide-up">
              <ImageUploader
                image={localIdolImage}
                onImageChange={setLocalIdolImage}
                label="Ảnh của bạn"
                hint="Chọn ảnh rõ mặt, chính diện"
                required
              />

              {/* Lưu ý về chất lượng ảnh */}
              <div className="p-5 bg-gradient-to-r from-accent-blue/40 to-accent-pink/30 rounded-2xl border border-primary/20 glass-card">
                <p className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Mẹo:</strong> Chọn ảnh rõ nét, chính diện, ánh sáng tốt để có kết quả tốt nhất.</span>
                </p>
              </div>
            </div>
          )}

          {/* Anonymous Mode Info */}
          {isAnonymous && (
            <div className="p-5 bg-gradient-to-r from-accent-blue/50 to-accent-pink/40 rounded-2xl border border-primary/30 glass-card animate-scale-in">
              <p className="text-sm text-foreground leading-relaxed">
                🎭 <strong>Chế độ ẩn danh:</strong> AI sẽ tạo một nhân vật ngẫu nhiên đang học bài với background bạn chọn.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-xl flex justify-center relative z-10">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto"
          onClick={handleContinue}
          disabled={!isAnonymous && !localIdolImage}
        >
          Chọn background
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
