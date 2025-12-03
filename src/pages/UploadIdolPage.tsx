import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, UserX, User, Settings } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/')} className="p-2 -m-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <Link to="/settings" className="p-2 -m-2 hover:bg-secondary rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 page-transition">
        <div className="max-w-md mx-auto space-y-8">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={1} totalSteps={4} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Tải ảnh của {userName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Tải ảnh để AI tạo không gian học tập
            </p>
          </div>

          {/* Anonymous Mode Toggle */}
          <button
            onClick={handleToggleAnonymous}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
              isAnonymous
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-full ${isAnonymous ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              {isAnonymous ? <UserX className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-foreground">
                {isAnonymous ? 'Chế độ ẩn danh đang bật' : 'Chế độ ẩn danh'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAnonymous ? 'AI sẽ tạo người ngẫu nhiên' : 'Bật để AI tạo người ngẫu nhiên thay vì dùng ảnh của bạn'}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </button>

          {/* Upload Areas - Only show when not anonymous */}
          {!isAnonymous && (
            <div className="space-y-6">
              <ImageUploader
                image={localIdolImage}
                onImageChange={setLocalIdolImage}
                label="Ảnh của bạn"
                hint="Chọn ảnh rõ mặt, chính diện"
                required
              />

              {/* Lưu ý về chất lượng ảnh */}
              <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">💡 Lưu ý:</span> Để có kết quả tốt nhất, hãy chọn ảnh rõ nét, chính diện khuôn mặt, ánh sáng tốt và không bị che khuất.
                </p>
              </div>
            </div>
          )}

          {/* Anonymous Mode Info */}
          {isAnonymous && (
            <div className="p-4 bg-accent-blue/50 rounded-xl">
              <p className="text-sm text-foreground">
                🎭 <strong>Chế độ ẩn danh:</strong> AI sẽ tạo một nhân vật ngẫu nhiên đang học bài với background bạn chọn.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card">
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={!isAnonymous && !localIdolImage}
        >
          Tiếp tục
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
