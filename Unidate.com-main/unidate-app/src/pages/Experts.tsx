import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  Star, 
  Play, 
  BookOpen,
  Brain,
  Sparkles,
  ChevronRight,
  Menu,
  Home,
  Grid,
  Film,
  Video,
  Heart,
  Share2,
  Eye,
  Edit,
  Quote,
  Clock,
  User,
  Settings,
  LogOut,
  BarChart3,
  Award,
  ChevronDown,
  Newspaper,
  Users
} from 'lucide-react';
import { GeminiService, PhilosophicalThought } from '../services/geminiService';
import { PresentationService } from '../services/presentationService';
import { ResearchPresentation } from '../types/presentation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ProgressBar from '../components/UI/ProgressBar';
import ImageWithFallback from '../components/Presentation/ImageWithFallback';

const Experts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile, logoutUser } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [presentation, setPresentation] = useState<ResearchPresentation | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Iniciando...');

  useEffect(() => {
    const theme = searchParams.get('theme');
    if (theme) {
      loadExpertContent(theme);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const userDropdownItems = [
    { name: 'Meu Perfil', href: '/dashboard', icon: User },
    { name: 'Minhas Métricas', href: '/my-analytics', icon: BarChart3 },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Minhas Conquistas', href: '/achievements', icon: Award },
  ];

  const loadExpertContent = async (theme: string) => {
    try {
      setIsSearching(true);
      setIsGenerating(true);
      setProgress(0);
      setProgressMessage('Analisando tema...');
      
      const updateProgress = (newProgress: number, message: string) => {
        setProgress(newProgress);
        setProgressMessage(message);
      };
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 10) {
            return prev + 1;
          }
          return prev;
        });
      }, 100);
      
      const newPresentation = await PresentationService.getOrGeneratePresentation(
        theme, 
        currentUser?.uid,
        updateProgress
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Concluído!');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPresentation(newPresentation);
      setSearchParams({ theme: theme.toLowerCase().replace(/\s+/g, '-') });
      
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      setProgress(0);
      setProgressMessage('Erro ao gerar apresentação');
    } finally {
      setIsSearching(false);
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('Iniciando...');
      }, 1000);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    await loadExpertContent(searchQuery);
  };

  const handleClosePresentation = () => {
    setPresentation(null);
    setSearchQuery('');
    setSearchParams({});
  };

  if (!presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white pt-16">
        {}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {}
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-gray-900" />
                  </div>
                  <span className="text-xl font-bold text-white font-serif">UniDate</span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                  <Link to="/discover" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>Descoberta</span>
                  </Link>
                  <Link to="/feed" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                    <Newspaper className="h-4 w-4" />
                    <span>UniVerso</span>
                  </Link>
                  <Link to="/materials" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Práticas</span>
                  </Link>
                  <Link to="/materials" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Teoria</span>
                  </Link>
                  <Link to="/experts" className="text-yellow-400 font-semibold transition-colors flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Especialistas</span>
                  </Link>
                </nav>
                {}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>

              {}
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <div className="relative user-menu-container" ref={menuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-gray-900 font-semibold text-sm">
                        {userProfile?.displayName?.[0] || currentUser.email?.[0] || 'U'}
                      </div>
                      <span className="hidden md:block text-gray-300 font-medium">
                        {userProfile?.displayName || 'Usuário'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-lg py-2 z-50">
                        {userDropdownItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.name}</span>
                          </Link>
                        ))}
                        <hr className="my-2 border-gray-700" />
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-900/30 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sair</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <nav className="px-4 py-4 space-y-2">
              <Link
                to="/discover"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
              >
                <Heart className="h-4 w-4" />
                <span>Descoberta</span>
              </Link>
              <Link
                to="/feed"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
              >
                <Newspaper className="h-4 w-4" />
                <span>UniVerso</span>
              </Link>
              <Link
                to="/materials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Práticas</span>
              </Link>
              <Link
                to="/materials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Teoria</span>
              </Link>
              <Link
                to="/experts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-yellow-400 font-semibold hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Especialistas</span>
              </Link>
            </nav>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-gray-900" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Especialistas
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore qualquer tema através de pensamentos filosóficos e conteúdo inteligente gerado por IA
            </p>
          </div>

          {}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
            >
              <Search className="h-5 w-5" />
              <span>Buscar Tema</span>
            </button>
          </div>

          {}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {['Filosofia Estoica', 'Cálculo Diferencial', 'Física Quântica', 'Ética e Virtude', 'Matemática Avançada', 'Biologia Molecular'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => loadExpertContent(suggestion)}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-700 hover:border-yellow-500/50 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center group-hover:from-yellow-500/30 group-hover:to-yellow-600/30 transition-colors border border-yellow-500/30">
                    <BookOpen className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-white">{suggestion}</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Explore este tema com conteúdo gerado por IA
                </p>
              </button>
            ))}
          </div>

          {}
          {showSearchModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-white">Buscar Tema</h2>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-300" />
                  </button>
                </div>
                
                <form onSubmit={handleSearch}>
                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquise qualquer tema... (ex: Filosofia Estoica, Cálculo, Física Quântica)"
                      className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 rounded-lg transition-colors disabled:opacity-50 font-semibold"
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <p className="text-gray-300 text-sm mb-3 font-medium">Sugestões populares:</p>
                  {['Filosofia Estoica', 'Cálculo Diferencial', 'Física Quântica', 'Ética e Virtude'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        loadExpertContent(suggestion);
                      }}
                      className="block w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 hover:text-yellow-400 rounded-lg transition-colors text-gray-300 font-medium border border-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white pt-16">
      {}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white font-serif">UniDate</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/discover" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>Descoberta</span>
                </Link>
                <Link to="/feed" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                  <Newspaper className="h-4 w-4" />
                  <span>UniVerso</span>
                </Link>
                <Link to="/materials" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Práticas</span>
                </Link>
                <Link to="/materials" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Teoria</span>
                </Link>
                <Link to="/experts" className="text-yellow-400 font-semibold transition-colors flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Especialistas</span>
                </Link>
              </nav>
              {}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="relative user-menu-container" ref={menuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-gray-900 font-semibold text-sm">
                        {userProfile?.displayName?.[0] || currentUser.email?.[0] || 'U'}
                      </div>
                      <span className="hidden md:block text-gray-300 font-medium">
                        {userProfile?.displayName || 'Usuário'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                  {}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      {userDropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.name}</span>
                        </Link>
                      ))}
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <nav className="px-4 py-4 space-y-2">
            <Link
              to="/discover"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>Descoberta</span>
            </Link>
            <Link
              to="/feed"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
            >
              <Newspaper className="h-4 w-4" />
              <span>UniVerso</span>
            </Link>
            <Link
              to="/materials"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Práticas</span>
            </Link>
            <Link
              to="/materials"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 rounded-lg transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Teoria</span>
            </Link>
            <Link
              to="/experts"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-yellow-400 font-semibold hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Especialistas</span>
            </Link>
          </nav>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClosePresentation}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-serif font-bold text-white">{presentation.title}</h1>
                <p className="text-gray-300 mt-1">{presentation.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-lg transition-all ${
                  isFavorite 
                    ? 'bg-red-900/50 text-red-400 border border-red-700' 
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 rounded-lg transition-all">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {}
        {presentation.sections.map((section, index) => (
          <div key={section.id} className="mb-8">
            {section.type === 'hero' && (
              <div className="bg-gradient-to-br from-yellow-600/90 via-yellow-500/90 to-yellow-600/90 rounded-2xl shadow-xl p-12 text-gray-900 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-gray-800 uppercase tracking-wider text-sm mb-4 font-medium font-serif">
                    {presentation.subtitle}
                  </p>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">{section.title}</h2>
                  <div className="space-y-4 text-gray-900 text-lg">
                    {section.content.paragraphs.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                  {section.content.quotes && section.content.quotes.length > 0 && (
                    <div className="mt-8 bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-900/30">
                      <Quote className="h-6 w-6 mb-3 opacity-80 text-gray-900" />
                      <p className="text-xl italic text-gray-900">"{section.content.quotes[0]}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(section.type === 'context' || section.type === 'methodology' || section.type === 'analysis' || section.type === 'results') && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-md border border-gray-700 p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={section.visualElements[0]?.position === 'right' ? 'order-2' : ''}>
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                      <ImageWithFallback
                        src={section.visualElements[0]?.imageUrl || ''}
                        alt={section.title}
                        className="w-full h-full object-cover"
                        fallbackSources={section.visualElements[0]?.fallbackSources || [
                          `https://picsum.photos/seed/${encodeURIComponent(presentation.theme)}${index}/1200/800`,
                          `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=80`
                        ]}
                        prompt={section.visualElements[0]?.imagePrompt}
                        theme={presentation.theme}
                      />
                    </div>
                  </div>
                  <div className={section.visualElements[0]?.position === 'right' ? 'order-1' : ''}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-yellow-400 text-sm font-medium mb-2">
                        <span>Seção {section.order}</span>
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-white">{section.title}</h3>
                      {section.subtitle && (
                        <p className="text-gray-300 text-lg">{section.subtitle}</p>
                      )}
                      <div className="space-y-3 text-gray-300">
                        {section.content.paragraphs.map((para, idx) => (
                          <p key={idx} className="leading-relaxed">{para}</p>
                        ))}
                      </div>
                      {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                        <div className="mt-6 space-y-2">
                          {section.content.keyPoints.map((point, idx) => (
                            <div key={idx} className="flex items-start space-x-3">
                              <Sparkles className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-300">{point}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section.type === 'discussion' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-md border border-gray-700 p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm font-medium mb-2">
                      <span>Seção {section.order}</span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-gray-300 text-lg">{section.subtitle}</p>
                    )}
                    <div className="space-y-3 text-gray-300">
                      {section.content.paragraphs.map((para, idx) => (
                        <p key={idx} className="leading-relaxed">{para}</p>
                      ))}
                    </div>
                    {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {section.content.keyPoints.map((point, idx) => (
                          <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-gray-300 text-sm">{point}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {section.hasImage && section.visualElements[0] && (
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                        <ImageWithFallback
                          src={section.visualElements[0].imageUrl || ''}
                          alt={section.title}
                          className="w-full h-full object-cover"
                          fallbackSources={section.visualElements[0]?.fallbackSources || [
                            `https://picsum.photos/seed/${encodeURIComponent(presentation.theme)}${index}/1200/800`,
                            `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=80`
                          ]}
                          prompt={section.visualElements[0]?.imagePrompt}
                          theme={presentation.theme}
                        />
                      </div>
                      {section.visualElements[0].caption && (
                        <p className="text-gray-400 text-sm mt-3 text-center italic">
                          {section.visualElements[0].caption}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {section.type === 'examples' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-md border border-gray-700 p-8">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-yellow-400 text-sm font-medium mb-2">
                      <span>Seção {section.order}</span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-gray-300 text-lg">{section.subtitle}</p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-gray-300">
                      {section.content.paragraphs.slice(0, Math.ceil(section.content.paragraphs.length / 2)).map((para, idx) => (
                        <p key={idx} className="leading-relaxed">{para}</p>
                      ))}
                    </div>
                    <div className="space-y-3 text-gray-300">
                      {section.content.paragraphs.slice(Math.ceil(section.content.paragraphs.length / 2)).map((para, idx) => (
                        <p key={idx} className="leading-relaxed">{para}</p>
                      ))}
                    </div>
                  </div>

                  {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      {section.content.keyPoints.map((point, idx) => (
                        <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <p className="text-yellow-400 text-sm font-medium">Exemplo {idx + 1}</p>
                          </div>
                          <p className="text-gray-300 text-sm">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {section.layout === 'card' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-md border border-gray-700 p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {section.hasImage && section.visualElements[0] && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                      <ImageWithFallback
                        src={section.visualElements[0].imageUrl || ''}
                        alt={section.title}
                        className="w-full h-full object-cover"
                        fallbackSources={section.visualElements[0]?.fallbackSources || [
                          `https://picsum.photos/seed/${encodeURIComponent(presentation.theme)}${index}/1200/800`,
                          `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=80`
                        ]}
                        prompt={section.visualElements[0]?.imagePrompt}
                        theme={presentation.theme}
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm font-medium mb-2">
                      <span>Seção {section.order}</span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-gray-300 text-lg">{section.subtitle}</p>
                    )}
                    <div className="space-y-3 text-gray-300">
                      {section.content.paragraphs.map((para, idx) => (
                        <p key={idx} className="leading-relaxed">{para}</p>
                      ))}
                    </div>
                    {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                      <div className="mt-6 space-y-2">
                        {section.content.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <Sparkles className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-300">{point}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {section.type === 'conclusion' && (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl shadow-lg border border-yellow-500/30 p-12">
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <p className="text-yellow-400 uppercase tracking-wider text-sm font-medium font-serif">
                      Conclusão
                    </p>
                    <h3 className="text-4xl font-serif font-bold text-white">{section.title}</h3>
                  </div>
                  
                  <div className="space-y-4 text-gray-300 text-lg max-w-3xl mx-auto">
                    {section.content.paragraphs.map((para, idx) => (
                      <p key={idx} className="leading-relaxed">{para}</p>
                    ))}
                  </div>

                  {section.content.philosophicalThought && (
                    <div className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-md border border-yellow-500/30">
                      <Brain className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
                      <Quote className="h-6 w-6 text-yellow-400/70 mx-auto mb-4" />
                      <p className="text-2xl font-serif italic text-white leading-relaxed">
                        "{section.content.philosophicalThought}"
                      </p>
                      <p className="text-yellow-400 text-sm mt-4 font-medium">
                        — Pensamento filosófico sobre {presentation.theme}
                      </p>
                    </div>
                  )}

                  {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4 mt-8">
                      {section.content.keyPoints.map((point, idx) => (
                        <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                          <p className="text-gray-300 font-medium">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <ProgressBar 
              progress={progress} 
              message={progressMessage}
              showIcon={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Experts;
