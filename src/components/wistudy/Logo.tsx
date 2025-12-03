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
    <div className={`font-bold ${sizeClasses[size]} tracking-tight`}>
      <span className="text-primary">Wi</span>
      <span className="text-foreground">Study</span>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
