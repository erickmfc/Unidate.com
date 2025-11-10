import React from 'react';
import { Sparkles } from 'lucide-react';

interface StatueBustProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'gold' | 'silver' | 'bronze';
  symbol?: string;
  className?: string;
}

const StatueBust: React.FC<StatueBustProps> = ({ 
  size = 'medium', 
  variant = 'gold',
  symbol,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const variantClasses = {
    gold: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
    silver: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
    bronze: 'bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`
        ${variantClasses[variant]}
        rounded-full flex items-center justify-center
        shadow-2xl border-4 border-yellow-300
        transform hover:scale-110 transition-transform duration-300
        relative overflow-hidden
      `}>
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
        
        {/* Símbolo ou ícone */}
        {symbol ? (
          <span className="text-4xl font-bold text-white relative z-10">{symbol}</span>
        ) : (
          <Sparkles className="h-12 w-12 text-white relative z-10" />
        )}
      </div>
      
      {/* Efeito de partículas */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
    </div>
  );
};

export default StatueBust;

