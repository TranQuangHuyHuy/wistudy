import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Coffee, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { cn } from '@/lib/utils';

const studyTimeOptions = [15, 25, 30, 45, 60];
const breakTimeOptions = [5, 10, 15];
const roundOptions = [2, 4, 6, 8];

export default function PomodoroSetupPage() {
  const navigate = useNavigate();
  const { userData, setPomodoroSettings } = useWiStudy();
  const [studyTime, setStudyTime] = useState(userData.pomodoroSettings.studyTime);
  const [breakTime, setBreakTime] = useState(userData.pomodoroSettings.breakTime);
  const [rounds, setRounds] = useState(userData.pomodoroSettings.rounds);

  const handleStart = () => {
    setPomodoroSettings({ studyTime, breakTime, rounds });
    navigate('/study-room');
  };

  const totalTime = (studyTime + breakTime) * rounds - breakTime;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/generate')} className="p-2 -m-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 overflow-auto animate-slide-up">
        <div className="max-w-md mx-auto space-y-8">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator currentStep={4} totalSteps={4} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Thiết lập Pomodoro
            </h1>
            <p className="text-muted-foreground text-sm">
              Tùy chỉnh thời gian học phù hợp với bạn
            </p>
          </div>

          {/* Study Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Thời gian học
            </div>
            <div className="flex flex-wrap gap-2">
              {studyTimeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => setStudyTime(time)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    studyTime === time
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                  )}
                >
                  {time} phút
                </button>
              ))}
            </div>
          </div>

          {/* Break Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coffee className="w-4 h-4 text-primary" />
              Thời gian nghỉ
            </div>
            <div className="flex flex-wrap gap-2">
              {breakTimeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => setBreakTime(time)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    breakTime === time
                      ? "bg-accent-pink text-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50"
                  )}
                >
                  {time} phút
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Repeat className="w-4 h-4 text-primary" />
              Số vòng
            </div>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRounds(r)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    rounds === r
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                  )}
                >
                  {r} vòng
                </button>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-5 bg-card rounded-2xl shadow-card border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tổng quan</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground">Tổng thời gian</span>
                <span className="font-semibold text-primary">
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes} phút`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Học</span>
                <span>{studyTime * rounds} phút</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Nghỉ</span>
                <span>{breakTime * (rounds - 1)} phút</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card">
        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
        >
          <Play className="w-4 h-4 mr-2" />
          Bắt đầu học
        </Button>
      </footer>
    </div>
  );
}
