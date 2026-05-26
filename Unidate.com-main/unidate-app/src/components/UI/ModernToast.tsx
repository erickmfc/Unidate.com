import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Info, XCircle } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <Check className="h-5 w-5 text-green-600" />,
          titleColor: 'text-green-900',
          messageColor: 'text-green-700',
          progressColor: 'bg-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
          progressColor: 'bg-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
          progressColor: 'bg-yellow-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
          progressColor: 'bg-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: <Info className="h-5 w-5 text-gray-600" />,
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-700',
          progressColor: 'bg-gray-600'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        relative max-w-sm w-full bg-white border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${styles.bg}
      `}
    >
      {}
      <div className="absolute top-0 left-0 h-1 w-full bg-gray-200 rounded-t-lg overflow-hidden">
        <div
          className={`h-full ${styles.progressColor} transition-all ease-linear`}
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${styles.messageColor}`}>
                {message}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={`text-sm font-medium ${styles.titleColor} hover:underline`}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default ToastContainer;
