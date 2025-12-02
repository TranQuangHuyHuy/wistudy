import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home, Clock, EyeOff, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { PomodoroTimer } from '@/components/wistudy/PomodoroTimer';
import { useWiStudy } from '@/contexts/WiStudyContext';
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
  const { userData, resetApp } = useWiStudy();
  const [showTimer, setShowTimer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
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

        {/* Logo overlay - top left */}
        <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md rounded-xl px-3 py-2">
          <Logo size="sm" />
        </div>

        {/* Exit button - top left after logo */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 left-36 z-10 bg-background/80 hover:bg-background backdrop-blur-md rounded-full w-10 h-10"
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

        {/* Timer overlay - draggable */}
        {showTimer ? (
          <div className="absolute top-4 right-4 z-10">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTimer(false)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background/80 hover:bg-background z-10"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
              <PomodoroTimer
                studyTime={userData.pomodoroSettings.studyTime}
                breakTime={userData.pomodoroSettings.breakTime}
                rounds={userData.pomodoroSettings.rounds}
                compact
                draggable
              />
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowTimer(true)}
            className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background backdrop-blur-md rounded-full w-10 h-10"
            size="icon"
          >
            <Clock className="w-4 h-4" />
          </Button>
        )}

        {/* Fullscreen button - bottom right */}
        <Button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 z-10 bg-background/80 hover:bg-background backdrop-blur-md rounded-full w-10 h-10"
          size="icon"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>
      </main>
    </div>
  );
}
