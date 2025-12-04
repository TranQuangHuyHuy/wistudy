import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Coffee, Repeat, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/wistudy/Logo';
import { StepIndicator } from '@/components/wistudy/StepIndicator';
import { useWiStudy } from '@/contexts/WiStudyContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const studyTimeOptions = [15, 30, 45, 60, 90];
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
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/20 via-background to-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button onClick={() => navigate('/choose-music')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-105">
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
            <StepIndicator currentStep={5} totalSteps={6} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Thiết lập Pomodoro
            </h1>
            <p className="text-muted-foreground text-sm">
              Tùy chỉnh thời gian học phù hợp với {userName}
            </p>
          </div>

          {/* Study Time */}
          <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/50 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              Thời gian học
            </div>
            <div className="flex flex-wrap gap-2">
              {studyTimeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => handleStudyTimeSelect(time)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    studyTime === time && !isCustomStudyTime
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue hover:scale-105"
                  )}
                >
                  {time} phút
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustomStudyTime(true)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  isCustomStudyTime
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Tùy chỉnh
              </button>
              {isCustomStudyTime && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={studyTime || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setStudyTime(0);
                      } else {
                        setStudyTime(Math.min(180, parseInt(val) || 0));
                      }
                    }}
                    onBlur={() => {
                      if (studyTime < 1) setStudyTime(1);
                    }}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">phút</span>
                </div>
              )}
            </div>
          </div>

          {/* Break Time */}
          <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/50 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="w-8 h-8 bg-accent-pink rounded-lg flex items-center justify-center">
                <Coffee className="w-4 h-4 text-primary" />
              </div>
              Thời gian nghỉ
            </div>
            <div className="flex flex-wrap gap-2">
              {breakTimeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => handleBreakTimeSelect(time)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    breakTime === time && !isCustomBreakTime
                      ? "bg-accent-pink text-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50 hover:scale-105"
                  )}
                >
                  {time} phút
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustomBreakTime(true)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  isCustomBreakTime
                    ? "bg-accent-pink text-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Tùy chỉnh
              </button>
              {isCustomBreakTime && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={breakTime || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setBreakTime(0);
                      } else {
                        setBreakTime(Math.min(60, parseInt(val) || 0));
                      }
                    }}
                    onBlur={() => {
                      if (breakTime < 1) setBreakTime(1);
                    }}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">phút</span>
                </div>
              )}
            </div>
          </div>

          {/* Rounds */}
          <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/50 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <Repeat className="w-4 h-4 text-primary" />
              </div>
              Số vòng
            </div>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoundsSelect(r)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    rounds === r && !isCustomRounds
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue hover:scale-105"
                  )}
                >
                  {r} vòng
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustomRounds(true)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  isCustomRounds
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Tùy chỉnh
              </button>
              {isCustomRounds && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={rounds || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setRounds(0);
                      } else {
                        setRounds(Math.min(20, parseInt(val) || 0));
                      }
                    }}
                    onBlur={() => {
                      if (rounds < 1) setRounds(1);
                    }}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">vòng</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-5 bg-gradient-to-r from-accent-blue/30 to-accent-pink/30 rounded-2xl shadow-card border border-primary/20">
            <h3 className="text-sm font-semibold text-foreground mb-3">Tổng quan</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Tổng thời gian</span>
                <span className="font-bold text-primary text-lg">
                  {hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`}
                </span>
              </div>
              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Học</span>
                <span className="font-medium">{studyTime * rounds} phút</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Nghỉ</span>
                <span className="font-medium">{breakTime * (rounds - 1)} phút</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-sm">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto shadow-soft"
          onClick={handleStart}
        >
          <Play className="w-4 h-4 mr-2" />
          Bắt đầu học
        </Button>
      </footer>
    </div>
  );
}
