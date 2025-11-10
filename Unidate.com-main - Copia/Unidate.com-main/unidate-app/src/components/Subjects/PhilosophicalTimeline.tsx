import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  Lightbulb,
  RefreshCw,
  Quote,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GeminiService, PhilosophicalThought } from '../../services/geminiService';

interface PhilosophicalTimelineProps {
  subjectId?: string;
}

const PhilosophicalTimeline: React.FC<PhilosophicalTimelineProps> = ({
  subjectId
}) => {
  const [thoughts, setThoughts] = useState<PhilosophicalThought[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nextGenerationTime, setNextGenerationTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Carregar pensamento inicial
    generateNewThought();
    
    // Configurar intervalo de 1 minuto
    setupMinuteInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [subjectId]);

  const setupMinuteInterval = () => {
    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Gerar novo pensamento a cada 60 segundos (1 minuto)
    intervalRef.current = setInterval(() => {
      generateNewThought();
    }, 60 * 1000); // 60.000ms = 1 minuto

    // Atualizar contador regressivo
    updateCountdown();
    countdownRef.current = setInterval(() => {
      updateCountdown();
    }, 1000); // Atualizar a cada segundo
  };

  const updateCountdown = () => {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    nextMinute.setSeconds(0);
    nextMinute.setMilliseconds(0);
    setNextGenerationTime(nextMinute);
    
    const diff = Math.max(0, Math.floor((nextMinute.getTime() - now.getTime()) / 1000));
    setCountdown(diff);
  };

  const generateNewThought = async () => {
    try {
      setIsGenerating(true);
      
      const newThought = await GeminiService.generateUniquePhilosophicalThought(
        'reflexão sobre aprendizado e sabedoria',
        subjectId ? `Contexto da matéria: ${subjectId}` : undefined
      );
      
      // Adicionar no início da lista
      setThoughts(prev => {
        const updated = [newThought, ...prev];
        // Manter apenas os últimos 20 pensamentos
        return updated.slice(0, 20);
      });
      
      // Sempre mostrar o mais recente
      setCurrentIndex(0);
      
      // Atualizar estatísticas
      const stats = GeminiService.getDailyStats();
      console.log(`📊 Pensamentos gerados hoje: ${stats.count}`);
      
    } catch (error) {
      console.error('Erro ao gerar novo pensamento:', error);
    } finally {
      setIsGenerating(false);
      updateCountdown();
    }
  };

  const nextThought = () => {
    setCurrentIndex((prev) => (prev + 1) % thoughts.length);
  };

  const prevThought = () => {
    setCurrentIndex((prev) => (prev - 1 + thoughts.length) % thoughts.length);
  };

  const getCategoryIcon = (category: PhilosophicalThought['category']) => {
    switch (category) {
      case 'stoic':
        return <Brain className="h-5 w-5" />;
      case 'existential':
        return <Lightbulb className="h-5 w-5" />;
      case 'wisdom':
        return <BookOpen className="h-5 w-5" />;
      case 'motivation':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Quote className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: PhilosophicalThought['category']) => {
    switch (category) {
      case 'stoic':
        return 'from-blue-600 to-indigo-600';
      case 'existential':
        return 'from-purple-600 to-pink-600';
      case 'wisdom':
        return 'from-amber-600 to-orange-600';
      case 'motivation':
        return 'from-green-600 to-emerald-600';
      default:
        return 'from-gray-600 to-slate-600';
    }
  };

  const getCategoryName = (category: PhilosophicalThought['category']) => {
    switch (category) {
      case 'stoic':
        return 'Estoicismo';
      case 'existential':
        return 'Existencialismo';
      case 'wisdom':
        return 'Sabedoria';
      case 'motivation':
        return 'Motivação';
      default:
        return 'Reflexão';
    }
  };

  const stats = GeminiService.getDailyStats();

  if (loading && thoughts.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto my-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-yellow-500/20">
          <div className="flex items-center justify-center space-x-3 text-yellow-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
            <span className="text-lg font-serif">Gerando sabedoria...</span>
          </div>
        </div>
      </div>
    );
  }

  if (thoughts.length === 0) {
    return null;
  }

  const currentThought = thoughts[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto my-12 relative">
      {/* Timeline Vertical */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-500/30 via-yellow-400/20 to-yellow-500/30 hidden md:block"></div>

      {/* Pensamento Principal em Destaque */}
      <div className="relative z-10 mb-8">
        <div className={`
          bg-gradient-to-br ${getCategoryColor(currentThought.category)}
          rounded-2xl p-8 shadow-2xl
          border-2 border-yellow-500/30
          transform transition-all duration-500
          hover:scale-[1.02] hover:shadow-yellow-500/20
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 text-white/90">
              {getCategoryIcon(currentThought.category)}
              <span className="text-sm font-serif uppercase tracking-wider">
                {getCategoryName(currentThought.category)}
              </span>
              {isGenerating && (
                <div className="flex items-center space-x-2 text-white/70">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-xs">Gerando...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-white/70">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-serif">
                  {new Date(currentThought.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs font-serif">
                  {stats.count} hoje
                </span>
              </div>
            </div>
          </div>

          {/* Conteúdo do Pensamento */}
          <div className="mb-6">
            <Quote className="h-8 w-8 text-white/30 mb-4" />
            <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed italic">
              "{currentThought.content}"
            </p>
          </div>

          {/* Footer com Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevThought}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={thoughts.length <= 1}
                aria-label="Pensamento anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-white/70 text-sm font-serif">
                {currentIndex + 1} / {thoughts.length}
              </span>
              
              <button
                onClick={nextThought}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={thoughts.length <= 1}
                aria-label="Próximo pensamento"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Contador regressivo */}
              <div className="flex items-center space-x-2 text-white/70">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-serif">
                  Próximo em {countdown}s
                </span>
              </div>

              <button
                onClick={generateNewThought}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span className="text-sm font-serif">Agora</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de Pensamentos Anteriores */}
      {thoughts.length > 1 && (
        <div className="space-y-6">
          {thoughts.slice(1, 6).map((thought, index) => {
            const actualIndex = index + 1;
            const isActive = actualIndex === currentIndex;
            
            return (
              <div
                key={thought.id}
                className={`
                  relative flex items-center space-x-6
                  transform transition-all duration-300
                  ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95 hover:opacity-80'}
                  cursor-pointer
                `}
                onClick={() => setCurrentIndex(actualIndex)}
              >
                {/* Linha da Timeline */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 border-4 border-slate-900 z-20 hidden md:block"></div>
                
                {/* Card do Pensamento */}
                <div className={`
                  flex-1 ml-0 md:ml-12 bg-gradient-to-r from-slate-800/80 to-slate-900/80
                  rounded-xl p-4 border border-yellow-500/20
                  hover:border-yellow-500/40 transition-all
                `}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCategoryIcon(thought.category)}
                        <span className="text-xs text-yellow-400 font-serif uppercase">
                          {getCategoryName(thought.category)}
                        </span>
                      </div>
                      <p className="text-white/90 font-serif italic text-sm line-clamp-2">
                        "{thought.content}"
                      </p>
                    </div>
                    <div className="text-xs text-white/50 font-serif ml-4">
                      {new Date(thought.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhilosophicalTimeline;
