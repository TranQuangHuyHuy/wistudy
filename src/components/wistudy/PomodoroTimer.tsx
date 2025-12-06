import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Shared AudioContext instance
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Play notification sound using Web Audio API
const playNotificationSound = (type: 'study-end' | 'break-end' | 'complete' | 'tick') => {
  try {
    const ctx = getAudioContext();
    
    const playTone = (frequency: number, duration: number, delay: number = 0, volume: number = 0.5) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const startTime = ctx.currentTime + delay;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    switch (type) {
      case 'tick':
        // Soft tick sound for last minute warning
        playTone(880, 0.1, 0, 0.25); // A5 - short beep
        break;
      case 'study-end':
        // Gentle chime - time to rest
        playTone(523, 0.4, 0, 0.6);    // C5
        playTone(659, 0.4, 0.2, 0.6);  // E5
        playTone(784, 0.5, 0.4, 0.6);  // G5
        break;
      case 'break-end':
        // Energetic tone - back to study
        playTone(440, 0.3, 0, 0.6);    // A4
        playTone(554, 0.3, 0.15, 0.6); // C#5
        playTone(659, 0.4, 0.3, 0.6);  // E5
        break;
      case 'complete':
        // Victory sound - all rounds complete
        playTone(523, 0.3, 0, 0.7);
        playTone(659, 0.3, 0.15, 0.7);
        playTone(784, 0.3, 0.3, 0.7);
        playTone(1047, 0.5, 0.45, 0.7); // C6
        break;
    }
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};

// Initialize audio context on user interaction
export const initAudioContext = () => {
  getAudioContext();
};

interface PomodoroTimerProps {
  studyTime: number;
  breakTime: number;
  rounds: number;
  compact?: boolean;
  draggable?: boolean;
  muted?: boolean;
  onDoubleClick?: () => void;
  initialPosition?: { x: number; y: number };
}

export function PomodoroTimer({ 
  studyTime, 
  breakTime, 
  rounds, 
  compact = false, 
  draggable = false, 
  muted = false,
  onDoubleClick,
  initialPosition = { x: 60, y: 16 }
}: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(studyTime * 60);
  
  // Drag state
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const totalTime = isBreak ? breakTime * 60 : studyTime * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          // Play tick sound during last 60 seconds (if not muted)
          if (!muted && newTime > 0 && newTime <= 60) {
            playNotificationSound('tick');
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (isBreak) {
        if (currentRound < rounds) {
          if (!muted) playNotificationSound('break-end');
          setCurrentRound(prev => prev + 1);
          setIsBreak(false);
          setTimeLeft(studyTime * 60);
        } else {
          if (!muted) playNotificationSound('complete');
          setIsRunning(false);
        }
      } else {
        if (!muted) playNotificationSound('study-end');
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, currentRound, rounds, studyTime, breakTime, muted]);

  // Get element size for boundary calculation
  const getElementSize = useCallback(() => {
    if (dragRef.current) {
      return {
        width: dragRef.current.offsetWidth,
        height: dragRef.current.offsetHeight
      };
    }
    return { width: 160, height: 200 };
  }, []);

  // Drag handlers
  useEffect(() => {
    if (!draggable) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const size = getElementSize();
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      
      const clampedX = Math.max(0, Math.min(window.innerWidth - size.width, newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - size.height, newY));
      
      setPosition({ x: clampedX, y: clampedY });
      
      if (clampedX !== newX) {
        offsetRef.current.x = e.clientX - clampedX;
      }
      if (clampedY !== newY) {
        offsetRef.current.y = e.clientY - clampedY;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggable, getElementSize]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    if ('touches' in e) {
      offsetRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else {
      offsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const toggleTimer = useCallback(() => {
    // Initialize audio context on user interaction
    initAudioContext();
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

  // Compact version for overlay with enhanced UI
  if (compact) {
    const compactCircumference = 2 * Math.PI * 42;
    const compactStrokeDashoffset = compactCircumference - (progress / 100) * compactCircumference;

    return (
      <div 
        ref={dragRef}
        className={cn(
          "bg-background/90 backdrop-blur-xl rounded-3xl shadow-elevated select-none border border-border/30",
          draggable && "fixed z-50",
          isRunning && "timer-glow"
        )}
        style={draggable ? { left: position.x, top: position.y } : undefined}
      >
        {/* Drag header */}
        {draggable && (
          <div 
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-border/30 cursor-grab active:cursor-grabbing bg-muted/30 rounded-t-3xl"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex flex-col items-center p-5" onDoubleClick={onDoubleClick}>
          {/* Enhanced Status Badge with gradient */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 transition-all duration-300",
            isBreak 
              ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30" 
              : "bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30"
          )}>
            {isBreak ? (
              <Coffee className="w-3.5 h-3.5 text-pink-500" />
            ) : (
              <span className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-primary animate-pulse" : "bg-primary/50"
              )} />
            )}
            <span className="text-xs font-semibold tracking-wide">
              {isBreak ? "Nghỉ ngơi" : "Đang học"}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {currentRound}/{rounds}
            </span>
          </div>

          {/* Enhanced Timer Circle with glow effect */}
          <div className={cn(
            "relative w-28 h-28 mb-5",
            isRunning && !isBreak && "timer-circle-glow-blue",
            isRunning && isBreak && "timer-circle-glow-pink"
          )}>
            {/* Background glow */}
            <div className={cn(
              "absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
              isRunning ? "opacity-40" : "opacity-0",
              isBreak ? "bg-pink-500/30" : "bg-primary/30"
            )} />
            
            <svg className="w-full h-full transform -rotate-90 relative z-10">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r="42"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-border/30"
              />
              {/* Gradient progress circle */}
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isBreak ? "#ec4899" : "#3b82f6"} />
                  <stop offset="100%" stopColor={isBreak ? "#f43f5e" : "#06b6d4"} />
                </linearGradient>
              </defs>
              <circle
                cx="56"
                cy="56"
                r="42"
                stroke="url(#timerGradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{
                  strokeDasharray: compactCircumference,
                  strokeDashoffset: compactStrokeDashoffset
                }}
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Enhanced Controls with pill buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => { e.stopPropagation(); resetTimer(); }}
              className="w-10 h-10 rounded-full hover:scale-105 transition-transform bg-muted/80 hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              size="lg"
              onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
              className={cn(
                "h-12 px-6 rounded-full font-semibold transition-all duration-300 hover:scale-105 gap-2",
                isRunning 
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30" 
                  : "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white shadow-lg shadow-primary/30"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-0.5" />
                  <span>Bắt đầu</span>
                </>
              )}
            </Button>
          </div>
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
