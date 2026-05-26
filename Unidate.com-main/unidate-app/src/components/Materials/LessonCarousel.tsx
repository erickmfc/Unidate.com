import React from 'react';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  expertName: string;
}

interface LessonCarouselProps {
  lessons: Lesson[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

const LessonCarousel: React.FC<LessonCarouselProps> = ({
  lessons,
  currentIndex,
  onPrevious,
  onNext,
}) => {
  const currentLesson = lessons[currentIndex];

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-gray-400">Nenhuma lição disponível</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <GraduationCap className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="text-sm text-yellow-400 font-medium">
            Lição {currentIndex + 1} de {lessons.length}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Lição anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === lessons.length - 1}
            className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Próxima lição"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h3>
        <p className="text-gray-400">Por <span className="text-yellow-400">{currentLesson.expertName}</span></p>
      </div>

      <div className="flex justify-center mt-4 space-x-1">
        {lessons.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? 'bg-yellow-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonCarousel;
