import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  Play,
  Send,
  Compass,
} from 'lucide-react';
import StatueBust from '../components/Materials/StatueBust';
import EditableContentBlock from '../components/Materials/EditableContentBlock';
import SubjectTabs from '../components/Materials/SubjectTabs';
import LessonCarousel from '../components/Materials/LessonCarousel';
import ExpertCard from '../components/Materials/ExpertCard';
import PhilosophicalTimeline from '../components/Subjects/PhilosophicalTimeline';
import { useAuth } from '../contexts/AuthContext';
import { ExpertsService } from '../services/expertsService';
import { subjectsData, SubjectData } from '../data/subjectsData';
import { Expert } from '../types/subjects';

const Materials: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('logica');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotação automática de matérias a cada 10 segundos com animação melhorada
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        const nextIndex = (currentSubjectIndex + 1) % subjectsData.length;
        setCurrentSubjectIndex(nextIndex);
        setActiveTab(subjectsData[nextIndex].tabs[0]?.id || 'logica');
        setCurrentLessonIndex(0);
        setIsAnimating(false);
      }, 600); // Duração da animação de slide
    }, 10000); // Muda a cada 10 segundos (mais tempo para ler)

    return () => clearInterval(interval);
  }, [currentSubjectIndex]);

  const currentSubject: SubjectData = subjectsData[currentSubjectIndex];
  const subjectData = currentSubject;

  const [experts, setExperts] = useState(subjectData.experts);


  // Carregar especialistas do Firebase ao mudar de matéria
  useEffect(() => {
    const loadExperts = async () => {
      try {
        const firebaseExperts = await ExpertsService.getExpertsBySubject(currentSubject.id);
        if (firebaseExperts.length > 0) {
          // Converter para o formato esperado pelo ExpertCard
          const formattedExperts = firebaseExperts.map((expert: Expert) => ({
            id: expert.id,
            name: expert.name,
            title: expert.credentials?.[0] || expert.specialties?.[0] || 'Especialista',
            expertise: expert.specialties || [],
            bio: expert.bio || '',
          }));
          setExperts(formattedExperts);
        } else {
          // Usar especialistas padrão da matéria atual
          setExperts(currentSubject.experts);
        }
      } catch (error) {
        console.error('Erro ao carregar especialistas:', error);
        // Manter os dados padrão em caso de erro
        setExperts(currentSubject.experts);
      }
    };

    loadExperts();
  }, [currentSubject.id]);

  const handleContentSave = (content: string) => {
    // Salvar no Firebase
    console.log('Salvando conteúdo:', content);
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < subjectData.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white pt-16">
      {/* Seção Hero */}
      <section className={`
        relative py-20 px-4 sm:px-6 lg:px-8
        transition-all duration-[700ms] ease-in-out
        ${isAnimating 
          ? 'opacity-0 translate-x-12 scale-95' 
          : 'opacity-100 translate-x-0 scale-100'
        }
      `}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Lado Esquerdo - Título e Conteúdo */}
            <div className="space-y-8">
              <div>
                <p className="text-yellow-400 text-sm uppercase tracking-wider mb-2 font-serif animate-fade-in">
                  {subjectData.subtitle}
                </p>
                <h1 className={`text-6xl font-serif font-bold text-white mb-6 transition-all duration-500 ${isAnimating ? 'scale-95' : 'scale-100'}`}>
                  {subjectData.title}
                </h1>
              </div>

              {/* Bloco de Conteúdo Editável */}
              <EditableContentBlock
                title="Eudaimonia"
                content={subjectData.heroContent}
                onSave={handleContentSave}
                isEditable={!!currentUser}
                maxLength={500}
              />

              {/* Botão Especialistas */}
              <Link 
                to="/experts"
                className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
              >
                Especialistas
              </Link>
            </div>

            {/* Lado Direito - Busto Central e Lições */}
            <div>
              <LessonCarousel
                lessons={subjectData.lessons}
                currentIndex={currentLessonIndex}
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
                subjectColor={currentSubject.color}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Filosófica Central */}
      <section className={`
        py-20 px-4 sm:px-6 lg:px-8 
        transition-all duration-[600ms] ease-in-out
        ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
        <PhilosophicalTimeline 
          subjectId={currentSubject.id}
        />
      </section>

      {/* Seção Práticas Gerais */}
      <section className={`
        py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50 
        transition-all duration-[600ms] ease-in-out
        ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-serif font-bold text-white mb-12 text-center">
            Práticas Gerais
          </h2>

          {/* Abas */}
          <SubjectTabs
            tabs={subjectData.tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Conteúdo da Aba Ativa */}
          <div className="mt-12 grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <EditableContentBlock
                title={subjectData.tabContent[activeTab as keyof typeof subjectData.tabContent]?.title}
                content={subjectData.tabContent[activeTab as keyof typeof subjectData.tabContent]?.content || ''}
                onSave={handleContentSave}
                isEditable={!!currentUser}
              />
              
              <EditableContentBlock
                title={subjectData.tabContent[activeTab as keyof typeof subjectData.tabContent]?.lessonTitle}
                content={subjectData.tabContent[activeTab as keyof typeof subjectData.tabContent]?.lessonContent || ''}
                onSave={handleContentSave}
                isEditable={!!currentUser}
              />
            </div>

            <div className="flex items-center justify-center">
              <StatueBust size="large" variant="gold" />
            </div>
          </div>

          {/* Navegação entre Tópicos */}
          <div className="flex items-center justify-center space-x-4 mt-12">
            <button className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <ChevronLeft className="h-6 w-6 text-yellow-400" />
            </button>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  className={`w-3 h-3 rounded-full transition-all ${
                    num === 1 ? 'bg-yellow-400 w-8' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <button className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <ChevronRight className="h-6 w-6 text-yellow-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Seção "Why we need philosophy" */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Estátua Grande */}
            <div className="flex justify-center">
              <StatueBust size="large" variant="gold" />
            </div>

            {/* Conteúdo */}
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-bold text-white">
                Por que precisamos de filosofia?
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                A filosofia nos ajuda a pensar criticamente sobre questões fundamentais da existência, 
                da moralidade, do conhecimento e da realidade. Ela desenvolve nossa capacidade de raciocínio 
                e nos prepara para enfrentar os desafios da vida com sabedoria e clareza.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Assistir Vídeo</span>
                </button>
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2 border border-gray-700">
                  <Send className="h-5 w-5" />
                  <span>Enviar</span>
                </button>
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2 border border-gray-700">
                  <Compass className="h-5 w-5" />
                  <span>Explorar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Especialistas */}
      <section 
        className={`
        py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50 
        transition-all duration-[600ms] ease-in-out
        ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-white mb-12 text-center">
            Nossos Especialistas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        </div>
      </section>

      {/* Indicador de Matérias */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-gray-900/90 backdrop-blur-md rounded-lg p-4 border border-yellow-500/30">
          <p className="text-xs text-gray-400 mb-2 text-center">Matérias</p>
          <div className="flex space-x-2">
            {subjectsData.map((subject, index) => (
              <button
                key={subject.id}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentSubjectIndex(index);
                    setActiveTab(subject.tabs[0]?.id || 'logica');
                    setCurrentLessonIndex(0);
                    setIsAnimating(false);
                  }, 300);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSubjectIndex
                    ? 'bg-yellow-400 w-8 scale-110'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Ver ${subject.title}`}
              />
            ))}
          </div>
          <p className="text-xs text-yellow-400 mt-2 text-center font-serif">
            {currentSubjectIndex + 1} / {subjectsData.length}
          </p>
        </div>
      </div>

      {/* CSS Customizado */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Materials;
