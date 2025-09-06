import React from 'react';

// Componente para gerar o favicon SVG
const Favicon: React.FC = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      
      {/* Heart Shape with integrated graduation cap */}
      <path
        d="M50 85 C50 85, 20 60, 20 40 C20 25, 32 15, 50 15 C68 15, 80 25, 80 40 C80 60, 50 85, 50 85 Z"
        fill="url(#faviconGradient)"
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
          fill="url(#faviconGradient)"
        />
        
        {/* Cap band */}
        <rect
          x="-10"
          y="6"
          width="20"
          height="4"
          rx="2"
          fill="url(#faviconGradient)"
        />
        
        {/* Tassel */}
        <line
          x1="8"
          y1="8"
          x2="12"
          y2="12"
          stroke="url(#faviconGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Tassel end */}
        <circle
          cx="12"
          cy="12"
          r="1"
          fill="url(#faviconGradient)"
        />
      </g>
    </svg>
  );
};

export default Favicon;

