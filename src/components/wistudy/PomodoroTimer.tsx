import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  studyTime: number;
  breakTime: number;
  rounds: number;
  compact?: boolean;
  draggable?: boolean;
}

export function PomodoroTimer({ studyTime, breakTime, rounds, compact = false, draggable = false }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(studyTime * 60);
  
  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

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

  // Drag handlers
  useEffect(() => {
    if (!draggable) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, draggable]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return;
    e.preventDefault();
    setIsDragging(true);
    if ('touches' in e) {
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

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

  // Compact version for overlay
  if (compact) {
    const compactCircumference = 2 * Math.PI * 28;
    const compactStrokeDashoffset = compactCircumference - (progress / 100) * compactCircumference;

    return (
      <div 
        ref={dragRef}
        className={cn(
          "flex flex-col items-center bg-background/85 backdrop-blur-md rounded-xl p-2.5 shadow-lg select-none",
          draggable && "cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        style={draggable ? { transform: `translate(${position.x}px, ${position.y}px)` } : undefined}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Status Badge */}
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full mb-2 transition-colors duration-300",
          isBreak ? "bg-accent-pink" : "bg-accent-blue"
        )}>
          {isBreak ? (
            <Coffee className="w-2.5 h-2.5 text-primary" />
          ) : (
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse-soft" />
          )}
          <span className="text-[10px] font-medium">
            {isBreak ? "Nghỉ" : "Học"} · {currentRound}/{rounds}
          </span>
        </div>

        {/* Timer Circle */}
        <div className="relative w-16 h-16 mb-2">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-border/50"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000",
                isBreak ? "text-accent-pink" : "text-primary"
              )}
              style={{
                strokeDasharray: compactCircumference,
                strokeDashoffset: compactStrokeDashoffset
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-medium tracking-tight text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => { e.stopPropagation(); resetTimer(); }}
            className="w-6 h-6 rounded-full"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          
          <Button
            size="icon"
            onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
            className={cn(
              "w-8 h-8 rounded-full",
              isRunning ? "bg-accent-pink hover:bg-accent-pink/80" : ""
            )}
          >
            {isRunning ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Full version
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
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-border"
          />
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
        
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}
