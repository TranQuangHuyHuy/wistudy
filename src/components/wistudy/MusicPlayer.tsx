import { useState, useRef, useEffect, useCallback } from 'react';
import { Music2, GripVertical, VolumeX } from 'lucide-react';
import { MusicSelection } from '@/types/wistudy';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  music: MusicSelection;
  onClose: () => void;
  isVisible: boolean;
  muted?: boolean;
}

export function MusicPlayer({ music, onClose, isVisible, muted = false }: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
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
    return { width: 320, height: isExpanded ? 240 : 50 };
  }, [isExpanded]);

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
      console.log('mouseup fired, stopping drag');
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isDragging) {
      console.log('Adding drag listeners');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getElementSize]);

  // Adjust position when expanding to keep within bounds
  useEffect(() => {
    const size = getElementSize();
    setPosition(prev => ({
      x: Math.max(0, Math.min(window.innerWidth - size.width, prev.x)),
      y: Math.max(0, Math.min(window.innerHeight - size.height, prev.y))
    }));
  }, [isExpanded, getElementSize]);

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
    console.log('mousedown, starting drag');
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
        "fixed z-50 bg-background/95 backdrop-blur-sm rounded-2xl border border-border shadow-xl overflow-hidden",
        !isVisible && "pointer-events-none opacity-0"
      )}
      style={{ left: position.x, top: position.y }}
    >
      {/* Drag overlay - covers iframe to capture mouse events */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-transparent" />
      )}
      
      {/* Header - Draggable */}
      <div 
        className="flex items-center justify-center p-2 border-b border-border bg-muted/50 cursor-grab select-none active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 px-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Music2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{music.name}</span>
        </div>
      </div>

      {/* Player */}
      {isExpanded && (
        <div className="w-80 h-48">
          {muted ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
              <VolumeX className="w-12 h-12 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Đã tắt âm thanh</span>
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
      )}
    </div>
  );
}
