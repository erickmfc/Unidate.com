import React from 'react';
import { Check, X, AlertTriangle, Info, Clock, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'pending';
  message: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <Check className="h-4 w-4" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: <X className="h-4 w-4" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: <Info className="h-4 w-4" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'loading':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600'
        };
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3'
        };
      case 'lg':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'h-5 w-5'
        };
      default:
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'h-4 w-4'
        };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = getSizeStyles();

  return (
    <div
      className={`
        inline-flex items-center space-x-2 rounded-lg border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeStyles.container}
        ${className}
      `}
    >
      {showIcon && (
        <div className={config.iconColor}>
          {React.cloneElement(config.icon, { className: sizeStyles.icon })}
        </div>
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default StatusIndicator;
