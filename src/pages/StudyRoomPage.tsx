import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home, Clock, Maximize, Minimize, Music2 } from 'lucide-react';
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

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { userData, resetApp, setSelectedMusic } = useWiStudy();
  const [showTimer, setShowTimer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleExit = () => {
    resetApp();
    navigate('/');
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
          "transition-opacity duration-300",
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {/* Logo overlay - top left */}
          <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md rounded-xl px-3 py-2">
            <Logo size="sm" />
          </div>

          {/* Exit button - below logo */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-16 left-4 z-10 bg-background/80 hover:bg-background backdrop-blur-md rounded-full w-10 h-10"
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Thoát phòng học?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tiến trình học hiện tại sẽ không được lưu. Bạn có chắc muốn thoát?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Tiếp tục học</AlertDialogCancel>
                <AlertDialogAction onClick={handleExit}>
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Timer toggle button */}
          <Button
            onClick={() => setShowTimer(!showTimer)}
            className="absolute top-4 right-4 z-10 bg-background/95 hover:bg-background backdrop-blur-md rounded-full w-11 h-11 shadow-lg border border-border/50 hover:scale-105 transition-transform"
            size="icon"
          >
            <Clock className="w-5 h-5" />
          </Button>

          {/* Music button - below timer button */}
          {userData.selectedMusic && (
            <Button
              onClick={() => setShowMusicPlayer(!showMusicPlayer)}
              className="absolute top-[68px] right-4 z-10 bg-background/95 hover:bg-background backdrop-blur-md rounded-full w-11 h-11 shadow-lg border border-border/50 hover:scale-105 transition-transform"
              size="icon"
            >
              <Music2 className="w-5 h-5" />
            </Button>
          )}

          {/* Fullscreen button - bottom right */}
          <Button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 z-10 bg-background/95 hover:bg-background backdrop-blur-md rounded-full w-11 h-11 shadow-lg border border-border/50 hover:scale-105 transition-transform"
            size="icon"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Timer panel - always mounted, visibility controlled */}
        <div className={cn(
          "transition-opacity duration-300",
          showTimer ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <PomodoroTimer
            studyTime={userData.pomodoroSettings.studyTime}
            breakTime={userData.pomodoroSettings.breakTime}
            rounds={userData.pomodoroSettings.rounds}
            compact
            draggable
            initialPosition={{ x: window.innerWidth - 180, y: 16 }}
          />
        </div>

        {/* Music Player - outside overlay, stays visible */}
        {userData.selectedMusic && (
          <MusicPlayer 
            music={userData.selectedMusic} 
            onClose={() => setShowMusicPlayer(false)}
            isVisible={showMusicPlayer}
          />
        )}
      </main>
    </div>
  );
}
