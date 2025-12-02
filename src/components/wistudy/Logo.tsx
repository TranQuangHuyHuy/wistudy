import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} tracking-tight`}>
      <span className="text-primary">Wi</span>
      <span className="text-foreground">Study</span>
    </div>
  );
}
