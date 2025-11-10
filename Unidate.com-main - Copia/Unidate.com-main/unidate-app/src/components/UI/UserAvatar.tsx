import React from 'react';
import { GraduationCap } from 'lucide-react';

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGraduationCap?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  displayName,
  email,
  size = 'md',
  className = '',
  showGraduationCap = true,
}) => {
  // Tamanhos do avatar
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Tamanhos do chapéu de formatura
  const capSizeClasses = {
    sm: 'w-4 h-4 -top-1 -right-1',
    md: 'w-5 h-5 -top-1 -right-1',
    lg: 'w-8 h-8 -top-2 -right-2',
    xl: 'w-10 h-10 -top-3 -right-3',
  };

  // Tamanhos do texto
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // Obter inicial
  const getInitial = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Classe de gradiente base
  const gradientClass = 'bg-gradient-to-r from-indigo-500 to-pink-500';

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Avatar */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${!photoURL || imageError ? gradientClass : ''} flex items-center justify-center relative`}>
        {photoURL && !imageError ? (
          <img
            src={photoURL}
            alt={displayName || 'Usuário'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={`text-white font-semibold ${textSizeClasses[size]}`}>
            {getInitial()}
          </span>
        )}
      </div>

      {/* Chapéu de Formatura */}
      {showGraduationCap && (
        <div className={`absolute ${capSizeClasses[size]} bg-yellow-400 rounded-full p-0.5 shadow-lg border-2 border-white z-10`}>
          <GraduationCap className="w-full h-full text-yellow-600" fill="currentColor" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;

