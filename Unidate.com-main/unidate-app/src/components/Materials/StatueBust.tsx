import React from 'react';

interface StatueBustProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'gold' | 'silver' | 'bronze';
}

const StatueBust: React.FC<StatueBustProps> = ({ size = 'medium', variant = 'gold' }) => {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-48 h-48',
    large: 'w-72 h-72',
  };

  const variantColors = {
    gold: 'from-yellow-400 to-yellow-600',
    silver: 'from-gray-300 to-gray-500',
    bronze: 'from-orange-400 to-orange-700',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`w-full h-full rounded-full bg-gradient-to-b ${variantColors[variant]} opacity-20 absolute inset-0 blur-2xl`} />
      <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="30" rx="20" ry="22" fill="currentColor" className={`text-${variant === 'gold' ? 'yellow' : variant === 'silver' ? 'gray' : 'orange'}-400`} />
          <path d="M28 75 Q28 55 50 50 Q72 55 72 75 L72 85 Q72 100 50 105 Q28 100 28 85 Z" fill="currentColor" className={`text-${variant === 'gold' ? 'yellow' : variant === 'silver' ? 'gray' : 'orange'}-500`} />
          <rect x="35" y="85" width="30" height="15" rx="3" fill="currentColor" className={`text-${variant === 'gold' ? 'yellow' : variant === 'silver' ? 'gray' : 'orange'}-600`} />
          <ellipse cx="50" cy="120" rx="25" ry="6" fill="currentColor" className={`text-${variant === 'gold' ? 'yellow' : variant === 'silver' ? 'gray' : 'orange'}-300`} opacity="0.5" />
        </svg>
      </div>
    </div>
  );
};

export default StatueBust;
