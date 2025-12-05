import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, Images, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { ImageLibraryDialog } from '@/components/wistudy/ImageLibraryDialog';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { supabase } from '@/integrations/supabase/client';

export default function FreeBackgroundPage() {
  const navigate = useNavigate();
  const { userData, setSelectedBackground } = useWiStudy();
  const [selected, setSelected] = useState<string | null>(userData.selectedBackground);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('bạn');
  const [showLibrary, setShowLibrary] = useState(false);

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

  const handleLibrarySelect = (imageUrl: string) => {
    setCustomBackground(imageUrl);
    setSelected('library-image');
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCustomBackground(null);
    setSelected(null);
  };

  const handleContinue = () => {
    if (!selected) return;
    setSelectedBackground(customBackground);
    navigate('/choose-music');
  };

  const isValid = selected && customBackground;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105">
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
            <StepIndicator currentStep={1} totalSteps={4} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Chọn Background
            </h1>
            <p className="text-muted-foreground text-sm">
              Không gian học tập của {userName} mong muốn
            </p>
          </div>

          {/* Options: Image Library & Upload */}
          <div className="grid grid-cols-2 gap-4">
            {/* Image Library */}
            <button
              onClick={() => selected !== 'custom' && setShowLibrary(true)}
              disabled={selected === 'custom'}
              className={`
                relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-square
                border-2 ${selected === 'library-image' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50 hover:shadow-card'}
                flex items-center justify-center bg-gradient-to-br from-secondary to-accent-gray
                ${selected === 'custom' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {selected === 'library-image' && customBackground ? (
                <>
                  <img src={customBackground} alt="Library" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="absolute bottom-3 left-3 text-primary-foreground text-sm font-medium">
                    Thư viện
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Images className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Thư viện ảnh</span>
                </div>
              )}
            </button>

            {/* Custom Upload */}
            <label className={`
              relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-square
              border-2 ${selected === 'custom' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50 hover:shadow-card'}
              flex items-center justify-center bg-gradient-to-br from-secondary to-accent-gray
              ${selected === 'library-image' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}>
              {selected === 'custom' && customBackground ? (
                <>
                  <img src={customBackground} alt="Custom" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="absolute bottom-3 left-3 text-primary-foreground text-sm font-medium">
                    Tùy chỉnh
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Upload className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Tải lên</span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCustomUpload}
                disabled={selected === 'library-image'}
              />
            </label>
          </div>

          {/* Info Text */}
          <p className="text-center text-xs text-muted-foreground">
            Chọn ảnh từ thư viện hoặc tải lên ảnh của bạn
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm flex justify-center">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto shadow-soft"
          onClick={handleContinue}
          disabled={!isValid}
        >
          Tiếp tục
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>

      {/* Image Library Dialog */}
      <ImageLibraryDialog
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelect={handleLibrarySelect}
      />
    </div>
  );
}