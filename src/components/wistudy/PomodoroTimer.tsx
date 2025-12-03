import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Play notification sound using Web Audio API
const playNotificationSound = (type: 'study-end' | 'break-end' | 'complete' | 'tick') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, duration: number, delay: number = 0, volume: number = 0.3) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    const startTime = audioContext.currentTime + delay;
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  switch (type) {
    case 'tick':
      // Soft tick sound for last minute warning
      playTone(880, 0.08, 0, 0.15); // A5 - short soft beep
      break;
    case 'study-end':
      // Gentle chime - time to rest
      playTone(523, 0.3, 0);    // C5
      playTone(659, 0.3, 0.15); // E5
      playTone(784, 0.4, 0.3);  // G5
      break;
    case 'break-end':
      // Energetic tone - back to study
      playTone(440, 0.2, 0);    // A4
      playTone(554, 0.2, 0.1);  // C#5
      playTone(659, 0.3, 0.2);  // E5
      break;
    case 'complete':
      // Victory sound - all rounds complete
      playTone(523, 0.2, 0);
      playTone(659, 0.2, 0.1);
      playTone(784, 0.2, 0.2);
      playTone(1047, 0.4, 0.3); // C6
      break;
  }
};

interface PomodoroTimerProps {
  studyTime: number;
  breakTime: number;
  rounds: number;
  compact?: boolean;
  draggable?: boolean;
  onDoubleClick?: () => void;
  initialPosition?: { x: number; y: number };
}

export function PomodoroTimer({ 
  studyTime, 
  breakTime, 
  rounds, 
  compact = false, 
  draggable = false, 
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
          // Play tick sound during last 60 seconds
          if (newTime > 0 && newTime <= 60) {
            playNotificationSound('tick');
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (isBreak) {
        if (currentRound < rounds) {
          playNotificationSound('break-end');
          setCurrentRound(prev => prev + 1);
          setIsBreak(false);
          setTimeLeft(studyTime * 60);
        } else {
          playNotificationSound('complete');
          setIsRunning(false);
        }
      } else {
        playNotificationSound('study-end');
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, currentRound, rounds, studyTime, breakTime]);

  // Get element size for boundary calculation
  const getElementSize = useCallback(() => {
    if (dragRef.current) {
      return {
        width: dragRef.current.offsetWidth,
        height: dragRef.current.offsetHeight
      };
    }
    return { width: 120, height: 160 };
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
          "bg-background/85 backdrop-blur-md rounded-xl shadow-lg select-none",
          draggable && "fixed z-50"
        )}
        style={draggable ? { left: position.x, top: position.y } : undefined}
      >
        {/* Drag header */}
        {draggable && (
          <div 
            className="flex items-center justify-center gap-1 p-1.5 border-b border-border/50 cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Kéo để di chuyển</span>
          </div>
        )}
        
        <div className="flex flex-col items-center p-2.5" onDoubleClick={onDoubleClick}>
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
