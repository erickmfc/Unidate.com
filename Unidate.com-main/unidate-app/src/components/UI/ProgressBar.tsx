import React, { useEffect, useState } from 'react';
import { Sparkles, Brain } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  showIcon?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  message = 'Gerando conteúdo...',
  showIcon = true 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Animar progresso suavemente
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < progress) {
          const increment = Math.min(5, progress - prev);
          return prev + increment;
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  const stages = [
    { label: 'Analisando tema...', threshold: 20 },
    { label: 'Gerando conteúdo...', threshold: 50 },
    { label: 'Criando imagens...', threshold: 80 },
    { label: 'Finalizando...', threshold: 100 }
  ];

  const currentStage = stages.find(stage => displayProgress <= stage.threshold) || stages[stages.length - 1];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {showIcon && (
            <div className="relative">
              <Brain className="h-8 w-8 text-yellow-400 animate-pulse" />
              <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-ping" />
            </div>
          )}
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              {currentStage.label}
            </h3>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="relative">
          {/* Barra de fundo */}
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            {/* Barra de progresso animada */}
            <div
              className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(displayProgress, 100)}%` }}
            >
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Indicador de porcentagem */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-400 font-medium">
              {Math.round(displayProgress)}%
            </span>
            <div className="flex space-x-1">
              {stages.map((stage, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    displayProgress >= stage.threshold
                      ? 'bg-yellow-400 scale-125'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mensagens de estágio */}
        <div className="mt-6 space-y-2">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 text-sm transition-all ${
                displayProgress >= stage.threshold
                  ? 'text-yellow-400'
                  : 'text-gray-500'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  displayProgress >= stage.threshold
                    ? 'bg-yellow-400'
                    : 'bg-gray-600'
                }`}
              />
              <span>{stage.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

