import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Carregando...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4" aria-live="polite" aria-busy="true">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-14 w-14 rounded-full bg-primary-500/10 animate-ping" aria-hidden="true" />
        <span className="absolute h-12 w-12 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" aria-hidden="true" />
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
        <Sparkles className="absolute -right-3 -top-3 h-4 w-4 animate-pulse text-accent-500" aria-hidden="true" />
      </div>
      {text && (
        <div className="space-y-2 text-center">
          <p className="text-gray-600 font-medium">{text}</p>
          <div className="mx-auto flex items-center justify-center gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
