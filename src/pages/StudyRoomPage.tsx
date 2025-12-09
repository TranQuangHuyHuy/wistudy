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
        hideTimeoutRef.current = setTimeout(() => {
          setShowOverlays(false);
        }, 5000);
      } else {
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
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setShowOverlays(false);
    }, 5000);
  }, [isFullscreen]);

  return (
    <TooltipProvider>
      <div 
        className="min-h-screen bg-background relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Background Image */}
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
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
        </div>

        {/* Top Bar - Logo & Exit */}
        <div className={cn(
          "absolute top-4 left-4 z-20 flex items-center gap-3 transition-opacity duration-500",
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {/* Logo */}
          <div className="bg-background/90 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-lg border border-border/30">
            <Logo size="sm" />
          </div>

          {/* Exit Button */}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="bg-background/90 hover:bg-background backdrop-blur-xl rounded-xl w-10 h-10 shadow-lg border border-border/30 hover:scale-105 transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Thoát phòng học</p>
              </TooltipContent>
            </Tooltip>
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
                  Thoát phòng học
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Control Bar - Right Side */}
        <div className={cn(
          "absolute top-4 right-4 z-20 transition-opacity duration-500",
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="bg-background/90 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-border/30 flex items-center gap-1">
            {/* Timer Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowTimer(!showTimer)}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-xl w-10 h-10 hover:bg-primary/10 transition-all duration-200",
                    showTimer && "bg-primary/15 text-primary"
                  )}
                >
                  <Clock className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{showTimer ? 'Ẩn đồng hồ' : 'Hiện đồng hồ'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Music Toggle */}
            {userData.selectedMusic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-xl w-10 h-10 hover:bg-primary/10 transition-all duration-200",
                      showMusicPlayer && "bg-primary/15 text-primary"
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

            {/* Mute Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-xl w-10 h-10 hover:bg-primary/10 transition-all duration-200",
                    isMuted && "bg-destructive/15 text-destructive"
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
            <div className="w-px h-6 bg-border/50 mx-1" />

            {/* Fullscreen Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  className="rounded-xl w-10 h-10 hover:bg-primary/10 transition-all duration-200"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Timer Panel */}
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
            muted={isMuted}
            initialPosition={{ x: window.innerWidth - 180, y: 80 }}
          />
        </div>

        {/* Music Player */}
        {userData.selectedMusic && (
          <MusicPlayer 
            music={userData.selectedMusic} 
            onClose={() => setShowMusicPlayer(false)}
            isVisible={showMusicPlayer}
            muted={isMuted}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
