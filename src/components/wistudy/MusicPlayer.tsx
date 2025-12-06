import { useState, useRef, useEffect, useCallback } from 'react';
import { Music2, GripVertical, VolumeX, AudioLines } from 'lucide-react';
import { MusicSelection } from '@/types/wistudy';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  music: MusicSelection;
  onClose: () => void;
  isVisible: boolean;
  muted?: boolean;
}

export function MusicPlayer({ music, onClose, isVisible, muted = false }: MusicPlayerProps) {
  const [position, setPosition] = useState({ x: 16, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  const getElementSize = useCallback(() => {
    if (playerRef.current) {
      return {
        width: playerRef.current.offsetWidth,
        height: playerRef.current.offsetHeight
      };
    }
    return { width: 400, height: 280 };
  }, []);

  useEffect(() => {
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
  }, [isDragging, getElementSize]);

  // Adjust position when bounds change
  useEffect(() => {
    const size = getElementSize();
    setPosition(prev => ({
      x: Math.max(0, Math.min(window.innerWidth - size.width, prev.x)),
      y: Math.max(0, Math.min(window.innerHeight - size.height, prev.y))
    }));
  }, [getElementSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const size = getElementSize();
      setPosition(prev => ({
        x: Math.max(0, Math.min(window.innerWidth - size.width, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, prev.y))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getElementSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  return (
    <div 
      ref={playerRef}
      className={cn(
        "fixed z-50 bg-background/90 backdrop-blur-xl rounded-3xl border border-border/30 shadow-elevated overflow-hidden",
        !isVisible && "pointer-events-none opacity-0",
        "transition-all duration-300"
      )}
      style={{ left: position.x, top: position.y }}
    >
      {/* Drag overlay - covers iframe to capture mouse events */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-transparent" />
      )}
      
      {/* Enhanced Header with gradient */}
      <div 
        className="flex items-center justify-between px-5 py-3.5 cursor-grab select-none active:cursor-grabbing bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 border-b border-border/30"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            {/* Animated ring */}
            {!muted && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: '2s' }} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground line-clamp-1 max-w-[200px]">
              {music.name}
            </span>
            <span className="text-xs text-muted-foreground">Đang phát</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Music visualizer animation */}
          {!muted && (
            <div className="flex items-end gap-0.5 h-5">
              <div className="w-1 bg-primary rounded-full music-bar" style={{ height: '60%', animationDelay: '0ms' }} />
              <div className="w-1 bg-primary rounded-full music-bar" style={{ height: '100%', animationDelay: '150ms' }} />
              <div className="w-1 bg-primary rounded-full music-bar" style={{ height: '40%', animationDelay: '300ms' }} />
              <div className="w-1 bg-primary rounded-full music-bar" style={{ height: '80%', animationDelay: '450ms' }} />
            </div>
          )}
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Player content */}
      <div className="w-96 h-52 relative">
        {muted ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-muted/20 to-muted/40">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <VolumeX className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Đã tắt âm thanh</span>
            <span className="text-xs text-muted-foreground/70 mt-1">Bật lại để nghe nhạc</span>
          </div>
        ) : (
          <iframe
            src={music.url}
            width="100%"
            height="100%"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
          />
        )}
      </div>

      {/* Bottom wave decoration */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 opacity-80" />
    </div>
  );
}
