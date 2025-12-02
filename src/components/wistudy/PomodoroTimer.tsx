import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  studyTime: number;
  breakTime: number;
  rounds: number;
}

export function PomodoroTimer({ studyTime, breakTime, rounds }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(studyTime * 60);

  const totalTime = isBreak ? breakTime * 60 : studyTime * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isBreak) {
        if (currentRound < rounds) {
          setCurrentRound(prev => prev + 1);
          setIsBreak(false);
          setTimeLeft(studyTime * 60);
        } else {
          setIsRunning(false);
        }
      } else {
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, currentRound, rounds, studyTime, breakTime]);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setCurrentRound(1);
    setTimeLeft(studyTime * 60);
  }, [studyTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Status Badge */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full mb-6 transition-colors duration-300",
        isBreak ? "bg-accent-pink" : "bg-accent-blue"
      )}>
        {isBreak ? (
          <>
            <Coffee className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Nghỉ ngơi</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-sm font-medium">Đang học</span>
          </>
        )}
        <span className="text-xs text-muted-foreground">
          Vòng {currentRound}/{rounds}
        </span>
      </div>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-border"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000",
              isBreak ? "text-accent-pink" : "text-primary"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset
            }}
          />
        </svg>
        
        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light tracking-tight text-foreground">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        
        <Button
          size="lg"
          onClick={toggleTimer}
          className={cn(
            "w-16 h-16 rounded-full",
            isRunning ? "bg-accent-pink hover:bg-accent-pink/80" : ""
          )}
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>
        
        <div className="w-12 h-12" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
