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
  const [tier, setTier] = useState<string>('free');

  useEffect(() => {
    const fetchUserData = async () => {
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
        
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single();
        if (subData?.tier) {
          setTier(subData.tier);
        }
      }
    };
    fetchUserData();
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
    <div className="min-h-screen bg-gradient-to-b from-accent-pink/30 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-5 w-52 h-52 bg-accent-pink/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-5 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <button onClick={() => navigate('/choose-music')} className="p-2.5 -m-2 hover:bg-secondary rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6 overflow-auto page-transition relative z-10">
        <div className="max-w-md mx-auto space-y-5">
          {/* Step Indicator */}
          <div className="flex justify-center animate-fade-in">
            <StepIndicator currentStep={tier === 'free' ? 3 : 5} totalSteps={tier === 'free' ? 4 : 6} />
          </div>

          {/* Title */}
          <div className="text-center space-y-2 animate-slide-up">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Thiết lập Pomodoro
            </h1>
            <p className="text-muted-foreground text-sm">
              Tùy chỉnh thời gian học phù hợp với {userName}
            </p>
          </div>

          {/* Study Time */}
          <div className="space-y-4 bg-card p-5 rounded-2xl border border-border/50 shadow-card glass-card animate-scale-in">
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-primary/30 rounded-xl flex items-center justify-center shadow-md">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              Thời gian học
            </div>
            <div className="flex flex-wrap gap-2">
              {studyTimeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => handleStudyTimeSelect(time)}
                  className={cn(
                    "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                    studyTime === time && !isCustomStudyTime
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue hover:scale-105"
                  )}
                >
                  {time} phút
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomStudyTime(true)}
                className={cn(
                  "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isCustomStudyTime
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                )}
              >
                <Settings2 className="w-4 h-4" />
                Tùy chỉnh
              </button>
              {isCustomStudyTime && (
                <div className="flex items-center gap-2 animate-slide-in-right">
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
                    className="w-20 text-center h-10 rounded-xl border-2"
                  />
                  <span className="text-sm text-muted-foreground font-medium">phút</span>
                </div>
              )}
            </div>
          </div>

          {/* Break Time */}
          <div className="space-y-4 bg-card p-5 rounded-2xl border border-border/50 shadow-card glass-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-pink to-primary/30 rounded-xl flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5 text-primary" />
              </div>
              Thời gian nghỉ
            </div>
            <div className="flex flex-wrap gap-2">
              {breakTimeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => handleBreakTimeSelect(time)}
                  className={cn(
                    "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                    breakTime === time && !isCustomBreakTime
                      ? "bg-accent-pink text-foreground shadow-lg"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50 hover:scale-105"
                  )}
                >
                  {time} phút
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomBreakTime(true)}
                className={cn(
                  "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isCustomBreakTime
                    ? "bg-accent-pink text-foreground shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-pink/50"
                )}
              >
                <Settings2 className="w-4 h-4" />
                Tùy chỉnh
              </button>
              {isCustomBreakTime && (
                <div className="flex items-center gap-2 animate-slide-in-right">
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
                    className="w-20 text-center h-10 rounded-xl border-2"
                  />
                  <span className="text-sm text-muted-foreground font-medium">phút</span>
                </div>
              )}
            </div>
          </div>

          {/* Rounds */}
          <div className="space-y-4 bg-card p-5 rounded-2xl border border-border/50 shadow-card glass-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-primary/30 rounded-xl flex items-center justify-center shadow-md">
                <Repeat className="w-5 h-5 text-primary" />
              </div>
              Số vòng
            </div>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoundsSelect(r)}
                  className={cn(
                    "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                    rounds === r && !isCustomRounds
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary text-secondary-foreground hover:bg-accent-blue hover:scale-105"
                  )}
                >
                  {r} vòng
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomRounds(true)}
                className={cn(
                  "px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isCustomRounds
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-accent-blue"
                )}
              >
                <Settings2 className="w-4 h-4" />
                Tùy chỉnh
              </button>
              {isCustomRounds && (
                <div className="flex items-center gap-2 animate-slide-in-right">
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
                    className="w-20 text-center h-10 rounded-xl border-2"
                  />
                  <span className="text-sm text-muted-foreground font-medium">vòng</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-6 bg-gradient-to-r from-accent-blue/40 to-accent-pink/40 rounded-3xl shadow-xl border border-primary/30 glass-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-bold text-foreground mb-4">Tổng quan</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-foreground font-medium">Tổng thời gian</span>
                <span className="font-bold text-primary text-xl">
                  {hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`}
                </span>
              </div>
              <div className="h-px bg-border/50 my-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Học</span>
                <span className="font-bold">{studyTime * rounds} phút</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Nghỉ</span>
                <span className="font-bold">{breakTime * (rounds - 1)} phút</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-border bg-card/80 backdrop-blur-xl flex justify-center relative z-10">
        <Button
          size="lg"
          className="w-full md:max-w-md mx-auto"
          onClick={handleStart}
        >
          <Play className="w-5 h-5 mr-2" />
          Bắt đầu học
        </Button>
      </footer>
    </div>
  );
}
