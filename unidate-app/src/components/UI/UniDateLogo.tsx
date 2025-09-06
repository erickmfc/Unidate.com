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
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          
          {/* Graduation Cap */}
          <g transform="translate(50, 20)">
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
          
          {/* Infinity Symbol */}
          <g transform="translate(50, 50)">
            {/* Left loop */}
            <ellipse
              cx="-12"
              cy="0"
              rx="12"
              ry="8"
              fill="url(#logoGradient)"
            />
            
            {/* Right loop */}
            <ellipse
              cx="12"
              cy="0"
              rx="12"
              ry="8"
              fill="url(#logoGradient)"
            />
            
            {/* Center connection */}
            <rect
              x="-4"
              y="-8"
              width="8"
              height="16"
              fill="url(#logoGradient)"
            />
            
            {/* Left circle */}
            <circle
              cx="-12"
              cy="0"
              r="3"
              fill="#EC4899"
            />
            
            {/* Right circle */}
            <circle
              cx="12"
              cy="0"
              r="3"
              fill="#8B5CF6"
            />
          </g>
          
          {/* Open Book */}
          <g transform="translate(70, 25)">
            {/* Book pages */}
            <path
              d="M-8 -6 L8 -6 L6 6 L-6 6 Z"
              fill="url(#logoGradient)"
            />
            
            {/* Book spine */}
            <rect
              x="-2"
              y="-6"
              width="4"
              height="12"
              fill="url(#logoGradient)"
            />
            
            {/* Book lines */}
            <line
              x1="-6"
              y1="-2"
              x2="4"
              y2="-2"
              stroke="url(#logoGradient)"
              strokeWidth="0.5"
            />
            <line
              x1="-6"
              y1="0"
              x2="4"
              y2="0"
              stroke="url(#logoGradient)"
              strokeWidth="0.5"
            />
            <line
              x1="-6"
              y1="2"
              x2="4"
              y2="2"
              stroke="url(#logoGradient)"
              strokeWidth="0.5"
            />
          </g>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent ${currentSize.text}`}>
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

