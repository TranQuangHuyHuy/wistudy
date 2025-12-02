import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home } from 'lucide-react';
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

  const handleExit = () => {
    resetApp();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b border-border">
        <Logo size="sm" />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <X className="w-5 h-5" />
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
      </header>

      {/* Main Content - Full screen image with timer overlay */}
      <main className="flex-1 relative animate-fade-in">
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

        {/* Timer overlay - top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <PomodoroTimer
            studyTime={userData.pomodoroSettings.studyTime}
            breakTime={userData.pomodoroSettings.breakTime}
            rounds={userData.pomodoroSettings.rounds}
            compact
          />
        </div>
      </main>
    </div>
  );
}
