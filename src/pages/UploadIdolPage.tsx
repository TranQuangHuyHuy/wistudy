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
  const { userData, setIdolImage } = useWiStudy();
  const [localIdolImage, setLocalIdolImage] = useState<string | null>(userData.idolImage);

  const handleContinue = () => {
    if (!localIdolImage) {
      toast.error('Vui lòng tải ảnh lên');
      return;
    }
    setIdolImage(localIdolImage);
    navigate('/choose-background');
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
