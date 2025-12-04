import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, Type, Images, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { BackgroundCard } from '@/components/wistudy/BackgroundCard';
import { ImageLibraryDialog } from '@/components/wistudy/ImageLibraryDialog';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { backgrounds } from '@/data/backgrounds';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

export default function ChooseBackgroundPage() {
  const navigate = useNavigate();
  const { userData, setSelectedBackground, setBackgroundVideo } = useWiStudy();
  const [selected, setSelected] = useState<string | null>(userData.selectedBackground);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [customVideo, setCustomVideo] = useState<string | null>(userData.backgroundVideo);
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState(false);
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
        setCustomVideo(null);
        setSelected('custom');
        setShowTextInput(false);
        setTextPrompt('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomVideo(result);
        setCustomBackground(null);
        setSelected('video');
        setShowTextInput(false);
        setTextPrompt('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextPromptSelect = () => {
    if (selected === 'text-prompt') {
      setSelected(null);
      setShowTextInput(false);
      setTextPrompt('');
    } else {
      setSelected('text-prompt');
      setShowTextInput(true);
      setCustomBackground(null);
    }
  };

  const handlePresetSelect = (bgId: string) => {
    setSelected(selected === bgId ? null : bgId);
    setShowTextInput(false);
    setTextPrompt('');
    setCustomBackground(null);
    setCustomVideo(null);
  };

  const handleLibrarySelect = (imageUrl: string) => {
    setCustomBackground(imageUrl);
    setCustomVideo(null);
    setSelected('library-image');
    setShowTextInput(false);
    setTextPrompt('');
  };

  const handleContinue = () => {
    if (!selected) return;
    
    if (selected === 'video' && customVideo) {
      setBackgroundVideo(customVideo);
      setSelectedBackground(null);
      navigate('/choose-music');
    } else if (selected === 'text-prompt' && textPrompt.trim()) {
      setBackgroundVideo(null);
      setSelectedBackground(`text:${textPrompt.trim()}`);
      navigate('/generate');
    } else if (selected === 'custom' || selected === 'library-image') {
      setBackgroundVideo(null);
      setSelectedBackground(customBackground);
      navigate('/generate');
    } else {
      setBackgroundVideo(null);
      setSelectedBackground(selected);
      navigate('/generate');
    }
  };

  const isValid = selected && (selected !== 'text-prompt' || textPrompt.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/upload-idol')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105">
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
            <StepIndicator currentStep={2} totalSteps={6} />
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

          {/* Background Grid */}
          <div className="grid grid-cols-2 gap-3">
            {backgrounds.map((bg) => (
              <BackgroundCard
                key={bg.id}
                background={bg}
                isSelected={selected === bg.id}
                onSelect={() => handlePresetSelect(bg.id)}
                previewImage={bg.preview}
              />
            ))}
          </div>

          {/* Options Row: Image Library, Upload, Video & Text Prompt */}
          <div className="grid grid-cols-4 gap-3">
            {/* Image Library */}
            <button
              onClick={() => setShowLibrary(true)}
              className={`
                relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-video
                border-2 ${selected === 'library-image' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50 hover:shadow-card'}
                flex items-center justify-center bg-gradient-to-br from-secondary to-accent-gray
              `}
            >
              {selected === 'library-image' && customBackground ? (
                <>
                  <img src={customBackground} alt="Library" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <p className="absolute bottom-2 left-2 text-primary-foreground text-xs font-medium">
                    Thư viện
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Images className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Thư viện</span>
                </div>
              )}
            </button>

            {/* Custom Upload */}
            <label className={`
              relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-video cursor-pointer
              border-2 ${selected === 'custom' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50 hover:shadow-card'}
              flex items-center justify-center bg-gradient-to-br from-secondary to-accent-gray
            `}>
              {selected === 'custom' && customBackground ? (
                <>
                  <img src={customBackground} alt="Custom" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <p className="absolute bottom-2 left-2 text-primary-foreground text-xs font-medium">
                    Ảnh
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Tải ảnh</span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCustomUpload}
              />
            </label>

            {/* Video Upload */}
            <label className={`
              relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-video cursor-pointer
              border-2 ${selected === 'video' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50 hover:shadow-card'}
              flex items-center justify-center bg-gradient-to-br from-secondary to-accent-gray
            `}>
              {selected === 'video' && customVideo ? (
                <>
                  <video src={customVideo} className="absolute inset-0 w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <p className="absolute bottom-2 left-2 text-primary-foreground text-xs font-medium">
                    Video
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Video className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Tải video</span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleVideoUpload}
              />
            </label>

            {/* Text Prompt Option */}
            <button
              onClick={handleTextPromptSelect}
              className={`
                relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-video
                border-2 ${selected === 'text-prompt' ? 'border-primary shadow-elevated' : 'border-dashed border-border hover:border-primary/50 hover:shadow-card'}
                flex items-center justify-center bg-gradient-to-br from-secondary to-accent-gray
              `}
            >
              <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                <Type className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Mô tả</span>
              </div>
            </button>
          </div>

          {/* Text Input Area */}
          {showTextInput && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-foreground">
                Mô tả không gian bạn muốn
              </label>
              <Textarea
                placeholder="Ví dụ: Phòng học với cửa sổ nhìn ra biển, ánh hoàng hôn ấm áp..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                AI sẽ tạo background dựa trên mô tả của bạn
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
          disabled={!isValid}
        >
          {selected === 'video' ? 'Tiếp tục' : 'Tạo ảnh'}
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
