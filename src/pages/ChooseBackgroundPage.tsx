import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { BackgroundCard } from '@/components/wistudy/BackgroundCard';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { backgrounds } from '@/data/backgrounds';
import { supabase } from '@/integrations/supabase/client';

export default function ChooseBackgroundPage() {
  const navigate = useNavigate();
  const { userData, setSelectedBackground } = useWiStudy();
  const [selected, setSelected] = useState<string | null>(userData.selectedBackground);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
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

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomBackground(result);
        setSelected('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (!selected) {
      return;
    }
    setSelectedBackground(selected === 'custom' ? customBackground : selected);
    navigate('/generate');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/upload-idol')} className="p-2 -m-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 overflow-auto page-transition">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={2} totalSteps={4} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Chọn Background
            </h1>
            <p className="text-muted-foreground text-sm">
              Không gian học tập của {userName} mong muốn
            </p>
          </div>

          {/* Background Grid */}
          <div className="grid grid-cols-2 gap-3">
            {backgrounds.map((bg) => (
              <BackgroundCard
                key={bg.id}
                background={bg}
                isSelected={selected === bg.id}
                onSelect={() => setSelected(selected === bg.id ? null : bg.id)}
              />
            ))}
            
            {/* Custom Upload */}
            <label className={`
              relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-video cursor-pointer
              border-2 ${selected === 'custom' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50'}
              flex items-center justify-center bg-secondary
            `}>
              {customBackground ? (
                <>
                  <img src={customBackground} alt="Custom" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-primary-foreground text-sm font-medium">
                    Tùy chỉnh
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Tải lên</span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCustomUpload}
              />
            </label>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card">
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={!selected}
        >
          Tạo ảnh với Idol
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
