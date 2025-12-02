import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Coffee, Repeat, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const studyTimeOptions = [15, 25, 30, 45, 60];
const breakTimeOptions = [5, 10, 15];
const roundOptions = [2, 4, 6, 8];

export default function PomodoroSetupPage() {
  const navigate = useNavigate();
  const { userData, setPomodoroSettings } = useWiStudy();
  const [studyTime, setStudyTime] = useState(userData.pomodoroSettings.studyTime);
  const [breakTime, setBreakTime] = useState(userData.pomodoroSettings.breakTime);
  const [rounds, setRounds] = useState(userData.pomodoroSettings.rounds);
  
  const [customStudyTime, setCustomStudyTime] = useState(false);
  const [customBreakTime, setCustomBreakTime] = useState(false);
  const [customRounds, setCustomRounds] = useState(false);

  const handleStudyTimeSelect = (time: number) => {
    setStudyTime(time);
    setCustomStudyTime(false);
  };

  const handleBreakTimeSelect = (time: number) => {
    setBreakTime(time);
    setCustomBreakTime(false);
  };

  const handleRoundsSelect = (r: number) => {
    setRounds(r);
    setCustomRounds(false);
  };

  const handleStart = () => {
    setPomodoroSettings({ studyTime, breakTime, rounds });
    navigate('/study-room');
  };

  const totalTime = (studyTime + breakTime) * rounds - breakTime;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  const isCustomStudyTime = customStudyTime || !studyTimeOptions.includes(studyTime);
  const isCustomBreakTime = customBreakTime || !breakTimeOptions.includes(breakTime);
  const isCustomRounds = customRounds || !roundOptions.includes(rounds);

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
                  onClick={() => handleStudyTimeSelect(time)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    studyTime === time && !isCustomStudyTime
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                  )}
                >
                  {time} phút
                </button>
              ))}
              <button
                onClick={() => setCustomStudyTime(true)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1",
                  isCustomStudyTime
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                )}
              >
                <Settings2 className="w-3 h-3" />
                Tùy chỉnh
              </button>
            </div>
            {isCustomStudyTime && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={studyTime}
                  onChange={(e) => setStudyTime(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">phút</span>
              </div>
            )}
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
                  onClick={() => handleBreakTimeSelect(time)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    breakTime === time && !isCustomBreakTime
                      ? "bg-accent-pink text-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50"
                  )}
                >
                  {time} phút
                </button>
              ))}
              <button
                onClick={() => setCustomBreakTime(true)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1",
                  isCustomBreakTime
                    ? "bg-accent-pink text-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50"
                )}
              >
                <Settings2 className="w-3 h-3" />
                Tùy chỉnh
              </button>
            </div>
            {isCustomBreakTime && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={breakTime}
                  onChange={(e) => setBreakTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">phút</span>
              </div>
            )}
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
                  onClick={() => handleRoundsSelect(r)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    rounds === r && !isCustomRounds
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                  )}
                >
                  {r} vòng
                </button>
              ))}
              <button
                onClick={() => setCustomRounds(true)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1",
                  isCustomRounds
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                )}
              >
                <Settings2 className="w-3 h-3" />
                Tùy chỉnh
              </button>
            </div>
            {isCustomRounds && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={rounds}
                  onChange={(e) => setRounds(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">vòng</span>
              </div>
            )}
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
