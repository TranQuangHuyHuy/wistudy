import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Background } from '@/types/wistudy';

interface BackgroundCardProps {
  background: Background;
  isSelected: boolean;
  onSelect: () => void;
  previewImage?: string;
}

export function BackgroundCard({ background, isSelected, onSelect, previewImage }: BackgroundCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative group rounded-2xl overflow-hidden transition-all duration-300 aspect-video",
        "border-2",
        isSelected 
          ? "border-primary shadow-elevated scale-[1.02]" 
          : "border-transparent hover:border-primary/50 hover:shadow-card"
      )}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-br from-accent-blue to-accent-pink"
        style={previewImage ? { backgroundImage: `url(${previewImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-primary-foreground text-sm font-medium text-left">
          {background.nameVi}
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 p-1.5 bg-primary rounded-full animate-scale-in">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
