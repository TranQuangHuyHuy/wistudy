import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Maximize, Minimize, Music2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { PomodoroTimer } from '@/components/wistudy/PomodoroTimer';
import { MusicPlayer } from '@/components/wistudy/MusicPlayer';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { userData } = useWiStudy();
  const [showTimer, setShowTimer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleExit = () => {
    navigate('/choose-music');
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) {
        // Start hide timer when entering fullscreen
        hideTimeoutRef.current = setTimeout(() => {
          setShowOverlays(false);
        }, 5000);
      } else {
        // Show overlays when exiting fullscreen
        setShowOverlays(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle mouse move to show overlays
  const handleMouseMove = useCallback(() => {
    if (!isFullscreen) return;
    
    setShowOverlays(true);
    
    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Set new hide timeout
    hideTimeoutRef.current = setTimeout(() => {
      setShowOverlays(false);
    }, 5000);
  }, [isFullscreen]);

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className="min-h-screen bg-background relative"
        onMouseMove={handleMouseMove}
      >
        {/* Main Content - Full screen image with overlays */}
        <main className="absolute inset-0 animate-fade-in">
          {/* Full screen image */}
          <div className="absolute inset-0">
            {userData.generatedImage ? (
              <img
                src={userData.generatedImage}
                alt="Study companion"
                className="w-full h-full object-cover"
              />
            ) : userData.selectedBackground ? (
              <img
                src={userData.selectedBackground}
                alt="Study background"
                className="w-full h-full object-cover"
              />
            ) : userData.idolImage ? (
              <img
                src={userData.idolImage}
                alt="Study companion"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent-blue to-accent-pink flex items-center justify-center">
                <p className="text-muted-foreground">Không có ảnh</p>
              </div>
            )}
          </div>

          {/* Overlays container - buttons only, fade after 5s */}
          <div className={cn(
            "transition-opacity duration-500",
            showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {/* Logo overlay - top left with glassmorphism */}
            <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-border/30 shadow-lg">
              <Logo size="sm" />
            </div>

            {/* Exit button - below logo */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-[72px] left-4 z-10 bg-background/80 hover:bg-background/90 backdrop-blur-xl rounded-full w-11 h-11 border border-border/30 shadow-lg hover:scale-105 transition-all"
                >
                  <X className="w-5 h-5 text-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Thoát phòng học?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tiến trình học hiện tại sẽ không được lưu. Bạn có chắc muốn thoát?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Tiếp tục học</AlertDialogCancel>
                  <AlertDialogAction onClick={handleExit} className="rounded-full">
                    Thoát phòng học
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Floating control bar - right side */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-xl rounded-full px-2 py-2 border border-border/30 shadow-lg">
              {/* Timer toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowTimer(!showTimer)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10 transition-all hover:scale-105",
                      showTimer && "bg-primary/20 text-primary"
                    )}
                  >
                    <Clock className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{showTimer ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Music toggle */}
              {userData.selectedMusic && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-10 h-10 transition-all hover:scale-105",
                        showMusicPlayer && "bg-primary/20 text-primary"
                      )}
                    >
                      <Music2 className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{showMusicPlayer ? 'Ẩn nhạc' : 'Hiện nhạc'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Sound toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10 transition-all hover:scale-105",
                      isMuted && "bg-destructive/20 text-destructive"
                    )}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Divider */}
              <div className="w-px h-6 bg-border/50" />

              {/* Fullscreen toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleFullscreen}
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-10 h-10 transition-all hover:scale-105"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Timer panel - always mounted, visibility controlled */}
          <div className={cn(
            "transition-all duration-500",
            showTimer ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          )}>
            <PomodoroTimer
              studyTime={userData.pomodoroSettings.studyTime}
              breakTime={userData.pomodoroSettings.breakTime}
              rounds={userData.pomodoroSettings.rounds}
              compact
              draggable
              muted={isMuted}
              initialPosition={{ x: window.innerWidth - 220, y: 80 }}
            />
          </div>

          {/* Music Player - outside overlay, stays visible */}
          {userData.selectedMusic && (
            <MusicPlayer 
              music={userData.selectedMusic} 
              onClose={() => setShowMusicPlayer(false)}
              isVisible={showMusicPlayer}
              muted={isMuted}
            />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
