import React from 'react';

interface UniDateLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const UniDateLogo: React.FC<UniDateLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${currentSize.icon} relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          
          {/* Heart Shape with integrated graduation cap */}
          <g>
            {/* Heart body */}
            <path
              d="M50 85 C50 85, 20 60, 20 40 C20 25, 32 15, 50 15 C68 15, 80 25, 80 40 C80 60, 50 85, 50 85 Z"
              fill="url(#logoGradient)"
            />
            
            {/* Graduation cap integrated with heart */}
            <g transform="translate(50, 15)">
              {/* Cap top (square) */}
              <rect
                x="-8"
                y="-8"
                width="16"
                height="16"
                rx="2"
                fill="url(#logoGradient)"
              />
              
              {/* Cap band */}
              <rect
                x="-10"
                y="6"
                width="20"
                height="4"
                rx="2"
                fill="url(#logoGradient)"
              />
              
              {/* Tassel */}
              <line
                x1="8"
                y1="8"
                x2="12"
                y2="12"
                stroke="url(#logoGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              
              {/* Tassel end */}
              <circle
                cx="12"
                cy="12"
                r="1"
                fill="url(#logoGradient)"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${currentSize.text}`}>
            UniDate
          </h1>
          <div className="text-sm text-gray-600 font-medium">
            <div>Sua faculdade.</div>
            <div>Suas conexões.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniDateLogo;

