import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { ImageUploader } from '@/components/wistudy/ImageUploader';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { toast } from 'sonner';

export default function UploadIdolPage() {
  const navigate = useNavigate();
  const { userData, setIdolImage, setUserImage } = useWiStudy();
  const [localIdolImage, setLocalIdolImage] = useState<string | null>(userData.idolImage);
  const [localUserImage, setLocalUserImage] = useState<string | null>(userData.userImage);

  const handleContinue = () => {
    if (!localIdolImage) {
      toast.error('Vui lòng tải ảnh idol lên');
      return;
    }
    setIdolImage(localIdolImage);
    setUserImage(localUserImage);
    navigate('/choose-background');
  };

  const handleAnonymous = () => {
    setLocalUserImage('anonymous');
    toast.success('Đã chọn chế độ ẩn danh');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/')} className="p-2 -m-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 animate-slide-up">
        <div className="max-w-md mx-auto space-y-8">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={1} totalSteps={4} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Chọn Idol của bạn
            </h1>
            <p className="text-muted-foreground text-sm">
              Tải ảnh idol bạn muốn học cùng
            </p>
          </div>

          {/* Upload Areas */}
          <div className="space-y-6">
            <ImageUploader
              image={localIdolImage}
              onImageChange={setLocalIdolImage}
              label="Ảnh Idol"
              hint="Chọn ảnh rõ mặt, chính diện"
              required
            />

            <ImageUploader
              image={localUserImage === 'anonymous' ? null : localUserImage}
              onImageChange={setLocalUserImage}
              label="Ảnh của bạn"
              hint="Tùy chọn - để tạo ảnh học cùng"
              showAnonymousOption
              onAnonymousSelect={handleAnonymous}
            />
            
            {localUserImage === 'anonymous' && (
              <div className="flex items-center justify-center gap-2 p-3 bg-accent-blue rounded-xl text-sm">
                <span>✓</span>
                <span>Đã chọn chế độ ẩn danh</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card">
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={!localIdolImage}
        >
          Tiếp tục
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
