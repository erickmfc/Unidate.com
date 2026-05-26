import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, Heart, Users, BookOpen, Zap } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'celebration';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    const duration = toast.duration || 4000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onHide: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onHide }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-200';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 border-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-200';
      case 'celebration':
        return 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-200';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-white" />;
      case 'info':
        return <Info className="h-5 w-5 text-white" />;
      case 'celebration':
        return <Heart className="h-5 w-5 text-white" />;
      default:
        return <Info className="h-5 w-5 text-white" />;
    }
  };

  return (
    <div className={`
      ${getToastStyles()}
      text-white p-4 rounded-2xl shadow-xl border backdrop-blur-sm
      transform transition-all duration-300 ease-out
      hover:scale-105 hover:shadow-2xl
      max-w-sm w-full
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {toast.title}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onHide(toast.id)}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const useUniDateToast = () => {
  const { showToast } = useToast();

  const showSuccess = useCallback((message: string, title = 'Sucesso! 🎉') => {
    showToast({
      type: 'success',
      title,
      message,
    });
  }, [showToast]);

  const showError = useCallback((message: string, title = 'Ops! Algo deu errado') => {
    showToast({
      type: 'error',
      title,
      message,
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, title = 'Informação') => {
    showToast({
      type: 'info',
      title,
      message,
    });
  }, [showToast]);

  const showCelebration = useCallback((message: string, title = 'Parabéns! 🎊') => {
    showToast({
      type: 'celebration',
      title,
      message,
      duration: 6000,
    });
  }, [showToast]);

  const showWelcome = useCallback((userName: string) => {
    const greetings = [
      `E aí, ${userName}! Bem-vindo(a) de volta! 👋`,
      `Oi, ${userName}! Que bom te ver por aqui! 😊`,
      `Olá, ${userName}! Pronto(a) para conectar? 🚀`,
      `Hey, ${userName}! Vamos fazer acontecer hoje! ⚡`,
      `Salve, ${userName}! Sua galera te espera! 🎯`
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    showToast({
      type: 'celebration',
      title: 'Bem-vindo(a) ao UniDate!',
      message: randomGreeting,
      duration: 5000,
    });
  }, [showToast]);

  const showGroupJoined = useCallback((groupName: string) => {
    showToast({
      type: 'success',
      title: 'Você entrou no grupo! 🎉',
      message: `Agora você faz parte de "${groupName}". Vamos conectar!`,
      duration: 4000,
    });
  }, [showToast]);

  const showMatchFound = useCallback((userName: string) => {
    showToast({
      type: 'celebration',
      title: 'Sintonia encontrada! 💕',
      message: `Você e ${userName} se apoiaram! Que tal conversar?`,
      duration: 6000,
      action: {
        label: 'Ver perfil',
        onClick: () => {
        }
      }
    });
  }, [showToast]);

  return {
    showSuccess,
    showError,
    showInfo,
    showCelebration,
    showWelcome,
    showGroupJoined,
    showMatchFound,
  };
};
