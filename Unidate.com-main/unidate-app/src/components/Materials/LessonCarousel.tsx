import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain,
  BookOpen,
  FlaskConical,
  Atom,
  Dna,
  ScrollText,
  Calculator,
  Microscope,
  Lightbulb,
  Sparkles,
  Star
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  expertName?: string;
  expertImage?: string;
  icon?: string;
  color?: string;
}

interface LessonCarouselProps {
  lessons: Lesson[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onLessonClick?: (lessonId: string) => void;
  subjectColor?: string;
}

// Mapeamento de ícones por título/área
const getLessonIcon = (title: string): React.ReactNode => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('lógica') || lowerTitle.includes('lógica')) return <Brain className="h-8 w-8" />;
  if (lowerTitle.includes('epistemologia') || lowerTitle.includes('conhecimento')) return <Lightbulb className="h-8 w-8" />;
  if (lowerTitle.includes('ética') || lowerTitle.includes('moral')) return <Sparkles className="h-8 w-8" />;
  if (lowerTitle.includes('cálculo') || lowerTitle.includes('matemática')) return <Calculator className="h-8 w-8" />;
  if (lowerTitle.includes('álgebra')) return <BookOpen className="h-8 w-8" />;
  if (lowerTitle.includes('geometria')) return <ScrollText className="h-8 w-8" />;
  if (lowerTitle.includes('mecânica') || lowerTitle.includes('física')) return <Atom className="h-8 w-8" />;
  if (lowerTitle.includes('química') || lowerTitle.includes('orgânica')) return <FlaskConical className="h-8 w-8" />;
  if (lowerTitle.includes('biologia') || lowerTitle.includes('celular')) return <Microscope className="h-8 w-8" />;
  if (lowerTitle.includes('genética')) return <Dna className="h-8 w-8" />;
  if (lowerTitle.includes('história')) return <ScrollText className="h-8 w-8" />;
  if (lowerTitle.includes('literatura')) return <BookOpen className="h-8 w-8" />;
  
  return <Star className="h-8 w-8" />;
};

const LessonCarousel: React.FC<LessonCarouselProps> = ({
  lessons,
  currentIndex,
  onPrevious,
  onNext,
  onLessonClick,
  subjectColor = 'from-yellow-500 to-amber-500'
}) => {
  const currentLesson = lessons[currentIndex];

  return (
    <div className="relative w-full">
      {/* Card Principal Central - Lição Ativa */}
      <div className="mb-8">
        <div className={`
          relative mx-auto max-w-md
          bg-gradient-to-br ${subjectColor}
          rounded-2xl p-8 shadow-2xl
          border-2 border-yellow-400/50
          transform transition-all duration-500
          hover:scale-105 hover:shadow-yellow-500/30
        `}>
          {/* Ícone Central Grande */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              {getLessonIcon(currentLesson?.title || '')}
            </div>
          </div>

          {/* Título e Professor */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              {currentLesson?.title || 'Carregando...'}
            </h3>
            {currentLesson?.expertName && (
              <p className="text-white/80 text-sm font-serif">
                {currentLesson.expertName}
              </p>
            )}
          </div>

          {/* Descrição */}
          {currentLesson?.description && (
            <p className="text-white/90 text-sm text-center leading-relaxed">
              {currentLesson.description}
            </p>
          )}

          {/* Botão de Ação */}
          <div className="flex justify-center mt-6">
            <button className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-semibold transition-all duration-300 border border-white/30">
              Começar Lição
            </button>
          </div>
        </div>
      </div>

      {/* Navegação com Setas */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 hover:border-yellow-400/50 group"
          aria-label="Lição anterior"
        >
          <ChevronLeft className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Cards de Lições Laterais */}
        <div className="flex items-center space-x-4">
          {lessons.map((lesson, index) => {
            const isActive = index === currentIndex;
            const isAdjacent = Math.abs(index - currentIndex) === 1;
            const isFar = Math.abs(index - currentIndex) > 1;
            
            if (isFar) return null; // Não mostrar lições muito distantes

            return (
              <button
                key={lesson.id}
                onClick={() => onLessonClick?.(lesson.id)}
                className={`
                  relative transition-all duration-500 ease-in-out
                  ${isActive 
                    ? 'scale-100 opacity-100 z-10' 
                    : isAdjacent 
                      ? 'scale-75 opacity-60 hover:opacity-80 z-0' 
                      : 'scale-50 opacity-0 hidden'
                  }
                `}
              >
                <div className={`
                  w-32 h-40 rounded-xl p-4
                  ${isActive
                    ? `bg-gradient-to-br ${subjectColor} border-2 border-yellow-400 shadow-lg`
                    : 'bg-gray-800/60 border border-gray-700 hover:border-yellow-400/50'
                  }
                  backdrop-blur-sm
                  transition-all duration-300
                  cursor-pointer
                  group
                `}>
                  {/* Ícone */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-3
                    ${isActive 
                      ? 'bg-white/20 border-2 border-white/30' 
                      : 'bg-gray-700/50 border border-gray-600'
                    }
                    group-hover:scale-110 transition-transform
                  `}>
                    <div className={isActive ? 'text-white' : 'text-gray-400'}>
                      {getLessonIcon(lesson.title)}
                    </div>
                  </div>

                  {/* Texto */}
                  <div className="text-left">
                    <p className={`
                      text-xs font-serif mb-1
                      ${isActive ? 'text-white/90' : 'text-gray-400'}
                    `}>
                      Lição
                    </p>
                    <p className={`
                      text-xs font-semibold line-clamp-2
                      ${isActive ? 'text-white' : 'text-gray-500'}
                    `}>
                      {lesson.title}
                    </p>
                  </div>

                  {/* Indicador de Ativo */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-yellow-400 rounded-full"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === lessons.length - 1}
          className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 hover:border-yellow-400/50 group"
          aria-label="Próxima lição"
        >
          <ChevronRight className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Indicadores de Progresso */}
      <div className="flex items-center justify-center space-x-2">
        {lessons.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              // Navegação direta via índice
            }}
            className={`
              transition-all duration-300 rounded-full
              ${index === currentIndex 
                ? 'w-8 h-2 bg-yellow-400' 
                : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
              }
            `}
            aria-label={`Ir para lição ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonCarousel;
