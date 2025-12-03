import { useState, useRef, useEffect } from 'react';
import { Music2, X, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MusicSelection } from '@/types/wistudy';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  music: MusicSelection;
  onClose: () => void;
}

export function MusicPlayer({ music, onClose }: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight - 250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 320, dragRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.initialY + deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div 
      ref={playerRef}
      className={cn(
        "fixed z-50 bg-background/95 backdrop-blur-sm rounded-2xl border border-border shadow-xl overflow-hidden transition-shadow duration-300",
        isDragging && "shadow-2xl"
      )}
      style={{ left: position.x, top: position.y }}
    >
      {/* Header - Draggable */}
      <div 
        className="flex items-center justify-between p-2 border-b border-border bg-muted/50 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 px-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Music2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{music.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Player */}
      {isExpanded && (
        <div className="w-80 h-48">
          <iframe
            src={music.url}
            width="100%"
            height="100%"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
          />
        </div>
      )}
    </div>
  );
}
