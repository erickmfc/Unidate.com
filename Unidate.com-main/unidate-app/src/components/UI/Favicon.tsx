import React from 'react';

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
      
      {}
      <g transform="translate(50, 20)">
        {}
        <rect
          x="-8"
          y="-8"
          width="16"
          height="16"
          rx="2"
          fill="url(#faviconGradient)"
        />
        
        {}
        <rect
          x="-10"
          y="6"
          width="20"
          height="4"
          rx="2"
          fill="url(#faviconGradient)"
        />
        
        {}
        <line
          x1="8"
          y1="8"
          x2="12"
          y2="12"
          stroke="url(#faviconGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {}
        <circle
          cx="12"
          cy="12"
          r="1"
          fill="url(#faviconGradient)"
        />
      </g>
      
      {}
      <g transform="translate(50, 50)">
        {}
        <ellipse
          cx="-12"
          cy="0"
          rx="12"
          ry="8"
          fill="url(#faviconGradient)"
        />
        
        {}
        <ellipse
          cx="12"
          cy="0"
          rx="12"
          ry="8"
          fill="url(#faviconGradient)"
        />
        
        {}
        <rect
          x="-4"
          y="-8"
          width="8"
          height="16"
          fill="url(#faviconGradient)"
        />
        
        {}
        <circle
          cx="-12"
          cy="0"
          r="3"
          fill="#EC4899"
        />
        
        {}
        <circle
          cx="12"
          cy="0"
          r="3"
          fill="#8B5CF6"
        />
      </g>
      
      {}
      <g transform="translate(70, 25)">
        {}
        <path
          d="M-8 -6 L8 -6 L6 6 L-6 6 Z"
          fill="url(#faviconGradient)"
        />
        
        {}
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
