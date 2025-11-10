import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, AlertTriangle } from 'lucide-react';

interface InlineConfirmationProps {
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const InlineConfirmation: React.FC<InlineConfirmationProps> = ({
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  size = 'md',
  children,
  className = ''
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setShowSuccess(true);
      setTimeout(() => {
        setIsConfirming(false);
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Erro na confirmação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
    onCancel?.();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          successBg: 'bg-red-50',
          successText: 'text-red-700',
          icon: <Trash2 className="h-4 w-4" />
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          successBg: 'bg-yellow-50',
          successText: 'text-yellow-700',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case 'success':
        return {
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          successBg: 'bg-green-50',
          successText: 'text-green-700',
          icon: <Check className="h-4 w-4" />
        };
      default:
        return {
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          successBg: 'bg-gray-50',
          successText: 'text-gray-700',
          icon: <Check className="h-4 w-4" />
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-xs',
          container: 'p-2'
        };
      case 'lg':
        return {
          button: 'px-6 py-3 text-base',
          container: 'p-4'
        };
      default:
        return {
          button: 'px-4 py-2 text-sm',
          container: 'p-3'
        };
    }
  };

  const styles = getTypeStyles();
  const sizeStyles = getSizeStyles();

  if (showSuccess) {
    return (
      <div className={`inline-flex items-center space-x-2 ${styles.successBg} ${styles.successText} rounded-lg ${sizeStyles.container} transition-all duration-300 ${className}`}>
        <Check className="h-4 w-4" />
        <span className="font-medium">Concluído!</span>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className={`inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-lg shadow-sm ${sizeStyles.container} ${className}`}>
        <span className="text-sm text-gray-600">Confirmar?</span>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`${styles.cancelButton} ${sizeStyles.button} rounded-md font-medium transition-colors disabled:opacity-50`}
        >
          <X className="h-3 w-3" />
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={`${styles.confirmButton} ${sizeStyles.button} rounded-md font-medium transition-colors disabled:opacity-50 flex items-center space-x-1`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>...</span>
            </>
          ) : (
            <>
              {styles.icon}
              <span>{confirmText}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className={`inline-flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export default InlineConfirmation;
