import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isFuture = stepNumber > currentStep;

        return (
          <div key={i} className="flex items-center gap-1.5">
            {/* Step dot/circle */}
            <div
              className={cn(
                "flex items-center justify-center rounded-full transition-all duration-500 ease-out",
                isCompleted && "w-6 h-6 bg-primary text-primary-foreground shadow-md",
                isCurrent && "w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 animate-pulse",
                isFuture && "w-5 h-5 bg-secondary border-2 border-border"
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : isCurrent ? (
                <span className="text-xs font-bold">{stepNumber}</span>
              ) : null}
            </div>

            {/* Connecting line */}
            {i < totalSteps - 1 && (
              <div className="relative w-6 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out",
                    isCompleted ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
