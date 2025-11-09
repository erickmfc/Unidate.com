import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Send,
  Compass,
  Menu,
  X,
  Edit3,
  Save
} from 'lucide-react';
import StatueBust from '../components/Materials/StatueBust';
import EditableContentBlock from '../components/Materials/EditableContentBlock';
import SubjectTabs from '../components/Materials/SubjectTabs';
import LessonCarousel from '../components/Materials/LessonCarousel';
import ExpertCard from '../components/Materials/ExpertCard';
import { useAuth } from '../contexts/AuthContext';

const SubjectsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('logica');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dados de exemplo - substituir por dados reais do Firebase
  const subjectData = {
    title: 'Filosofia',
    subtitle: 'A busca pela sabedoria',
    heroContent: 'Eudaimonia é um conceito grego que significa "bem-estar" ou "florescimento humano". É o estado de viver bem e fazer bem, alcançando o potencial máximo como ser humano.',
    lessons: [
      { id: '1', title: 'Introdução à Lógica', expertName: 'Prof. Aristóteles' },
      { id: '2', title: 'Epistemologia Moderna', expertName: 'Prof. Descartes' },
      { id: '3', title: 'Ética e Moral', expertName: 'Prof. Kant' },
    ],
    tabs: [
      { id: 'logica', label: 'Lógica', icon: '🧠' },
      { id: 'epistemologia', label: 'Epistemologia', icon: '🔬' },
      { id: 'fisica', label: 'Física', icon: '⚛️' },
      { id: 'etica', label: 'Ética', icon: '⚖️' },
      { id: 'paixao', label: 'Paixão', icon: '❤️' },
      { id: 'amor-vida', label: 'Amor & Vida', icon: '💫' },
    ],
    tabContent: {
      logica: {
        title: 'Teoria da Lógica',
        content: 'A lógica é o estudo do raciocínio válido. Ela nos ajuda a distinguir entre argumentos válidos e inválidos, fornecendo ferramentas para pensar de forma clara e precisa.',
        lessonTitle: 'Lógica #1',
        lessonContent: 'Nesta primeira lição, exploraremos os fundamentos da lógica proposicional e como ela se aplica ao pensamento cotidiano.',
      },
      epistemologia: {
        title: 'Teoria do Conhecimento',
        content: 'A epistemologia investiga a natureza, origem e limites do conhecimento humano.',
        lessonTitle: 'Epistemologia #1',
        lessonContent: 'Como sabemos o que sabemos? Esta é a questão central da epistemologia.',
      },
      fisica: {
        title: 'Física e Filosofia',
        content: 'A relação entre física e filosofia explora questões fundamentais sobre a natureza da realidade.',
        lessonTitle: 'Física #1',
        lessonContent: 'Explorando os limites entre ciência e filosofia.',
      },
      etica: {
        title: 'Ética e Moralidade',
        content: 'A ética estuda o que é certo e errado, bom e mau, na conduta humana.',
        lessonTitle: 'Ética #1',
        lessonContent: 'Fundamentos da ética e sua aplicação prática.',
      },
      paixao: {
        title: 'Filosofia da Paixão',
        content: 'A paixão como força motriz do pensamento e da ação humana.',
        lessonTitle: 'Paixão #1',
        lessonContent: 'Entendendo o papel das emoções na filosofia.',
      },
      'amor-vida': {
        title: 'Amor e Vida',
        content: 'Explorando os significados filosóficos do amor e da existência.',
        lessonTitle: 'Amor & Vida #1',
        lessonContent: 'Filosofia do amor e sua relação com a vida plena.',
      },
    },
    experts: [
      {
        id: '1',
        name: 'Prof. Aristóteles',
        title: 'Filósofo Clássico',
        expertise: ['Lógica', 'Ética', 'Metafísica'],
        bio: 'Um dos maiores filósofos da antiguidade, fundador da lógica formal.',
      },
      {
        id: '2',
        name: 'Prof. Descartes',
        title: 'Filósofo Moderno',
        expertise: ['Epistemologia', 'Metafísica', 'Matemática'],
        bio: 'Pai da filosofia moderna e do racionalismo.',
      },
      {
        id: '3',
        name: 'Prof. Kant',
        title: 'Filósofo Iluminista',
        expertise: ['Ética', 'Epistemologia', 'Estética'],
        bio: 'Filósofo alemão que revolucionou a ética e a epistemologia.',
      },
    ],
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Navegação Superior */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-serif font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                UniDate
              </div>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">Sobre</Link>
              <Link to="/materials" className="text-yellow-400 font-semibold flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>Práticas</span>
              </Link>
              <Link to="/materials" className="text-gray-300 hover:text-yellow-400 transition-colors">Teoria</Link>
              <Link to="/materials" className="text-gray-300 hover:text-yellow-400 transition-colors">Especialistas</Link>
            </div>

            {/* Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-yellow-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-yellow-400">Home</Link>
              <Link to="/about" className="block text-gray-300 hover:text-yellow-400">Sobre</Link>
              <Link to="/materials" className="block text-yellow-400 font-semibold">Práticas</Link>
              <Link to="/materials" className="block text-gray-300 hover:text-yellow-400">Teoria</Link>
              <Link to="/materials" className="block text-gray-300 hover:text-yellow-400">Especialistas</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Seção Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Lado Esquerdo - Título e Conteúdo */}
            <div className="space-y-8">
              <div>
                <p className="text-yellow-400 text-sm uppercase tracking-wider mb-2 font-serif">
                  {subjectData.subtitle}
                </p>
                <h1 className="text-6xl font-serif font-bold text-white mb-6">
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
              <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Especialistas
              </button>
            </div>

            {/* Lado Direito - Busto Central e Lições */}
            <div>
              <LessonCarousel
                lessons={subjectData.lessons}
                currentIndex={currentLessonIndex}
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seção Práticas Gerais */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-white mb-12 text-center">
            Nossos Especialistas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {subjectData.experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-yellow-400 font-serif font-bold mb-4">UniDate</h3>
              <p className="text-gray-400 text-sm">
                Plataforma educacional para estudantes universitários.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
                <li><Link to="/about" className="hover:text-yellow-400">Sobre</Link></li>
                <li><Link to="/materials" className="hover:text-yellow-400">Materiais</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: contato@unidate.com</li>
                <li>Telefone: (00) 0000-0000</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                {/* Ícones de redes sociais podem ser adicionados aqui */}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Customizado */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SubjectsPage;

