import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function Logo({ size = 'md', clickable = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  const content = (
    <div className={`font-bold ${sizeClasses[size]} tracking-tight group`}>
      <span className="text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">Wi</span>
      <span className="text-foreground transition-colors duration-300 group-hover:text-primary/80">Study</span>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="transition-transform duration-300 hover:scale-105">
        {content}
      </Link>
    );
  }

  return content;
}
