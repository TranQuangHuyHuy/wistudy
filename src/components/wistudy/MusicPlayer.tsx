import { useState } from 'react';
import { Music2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MusicSelection } from '@/types/wistudy';

interface MusicPlayerProps {
  music: MusicSelection;
  onClose: () => void;
}

export function MusicPlayer({ music, onClose }: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0 bg-background/80 backdrop-blur-sm border border-border hover:bg-background shadow-lg"
      >
        <Music2 className="h-5 w-5 text-foreground" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background/95 backdrop-blur-sm rounded-2xl border border-border shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2 px-2">
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
            onClick={() => setIsMinimized(true)}
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
