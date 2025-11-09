import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface QuickActionProps {
  onAction: () => Promise<void> | void;
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  onAction,
  icon,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAction = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onAction();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erro na ação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          base: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          success: 'bg-green-600 text-white',
          disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
        };
      case 'secondary':
        return {
          base: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          success: 'bg-green-100 text-green-700',
          disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed'
        };
      case 'danger':
        return {
          base: 'bg-red-600 hover:bg-red-700 text-white',
          success: 'bg-green-600 text-white',
          disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
        };
      case 'success':
        return {
          base: 'bg-green-600 hover:bg-green-700 text-white',
          success: 'bg-green-600 text-white',
          disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
        };
      default:
        return {
          base: 'bg-gray-600 hover:bg-gray-700 text-white',
          success: 'bg-green-600 text-white',
          disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-3 py-1.5 text-sm',
          icon: 'h-4 w-4'
        };
      case 'lg':
        return {
          button: 'px-6 py-3 text-base',
          icon: 'h-5 w-5'
        };
      default:
        return {
          button: 'px-4 py-2 text-sm',
          icon: 'h-4 w-4'
        };
    }
  };

  const styles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const getCurrentStyle = () => {
    if (disabled) return styles.disabled;
    if (showSuccess) return styles.success;
    return styles.base;
  };

  return (
    <button
      onClick={handleAction}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        ${sizeStyles.button}
        ${getCurrentStyle()}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className={`${sizeStyles.icon} animate-spin`} />
      ) : showSuccess ? (
        <Check className={sizeStyles.icon} />
      ) : (
        <div className={sizeStyles.icon}>
          {icon}
        </div>
      )}
      
      <span>
        {isLoading ? 'Processando...' : showSuccess ? 'Concluído!' : label}
      </span>
    </button>
  );
};

export default QuickAction;
