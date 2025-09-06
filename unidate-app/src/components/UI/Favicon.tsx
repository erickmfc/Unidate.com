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
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
      
      {/* Infinity Symbol */}
      <g transform="translate(50, 50)">
        {/* Left loop */}
        <ellipse
          cx="-12"
          cy="0"
          rx="12"
          ry="8"
          fill="url(#faviconGradient)"
        />
        
        {/* Right loop */}
        <ellipse
          cx="12"
          cy="0"
          rx="12"
          ry="8"
          fill="url(#faviconGradient)"
        />
        
        {/* Center connection */}
        <rect
          x="-4"
          y="-8"
          width="8"
          height="16"
          fill="url(#faviconGradient)"
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
          fill="url(#faviconGradient)"
        />
        
        {/* Book spine */}
        <rect
          x="-2"
          y="-6"
          width="4"
          height="12"
          fill="url(#faviconGradient)"
        />
      </g>
    </svg>
  );
};

export default Favicon;

