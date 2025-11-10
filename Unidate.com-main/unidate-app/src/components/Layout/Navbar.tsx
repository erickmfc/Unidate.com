import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../UI/UserAvatar';
import { 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  User,
  Settings,
  Heart,
  MessageCircle,
  Users,
  Newspaper,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  BarChart3,
  LogOut,
  Home,
  LucideIcon
} from 'lucide-react';

// Tipo para links de navegação
interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon | null;
  isActive?: boolean;
  isHighlighted?: boolean;
  isNew?: boolean;
}

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());
  const { currentUser, userProfile, isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Carregar itens já clicados do localStorage
  useEffect(() => {
    if (currentUser?.uid) {
      const stored = localStorage.getItem(`navbar_clicked_${currentUser.uid}`);
      if (stored) {
        try {
          setClickedItems(new Set(JSON.parse(stored)));
        } catch (error) {
          console.error('Erro ao carregar itens clicados:', error);
        }
      }
    }
  }, [currentUser?.uid]);

  // Função para verificar se um item já foi clicado
  const hasBeenClicked = (href: string): boolean => {
    return clickedItems.has(href);
  };

  // Função para marcar um item como clicado
  const markAsClicked = (href: string) => {
    if (!currentUser?.uid) return;
    
    const newClickedItems = new Set(clickedItems);
    newClickedItems.add(href);
    setClickedItems(newClickedItems);
    
    // Salvar no localStorage
    localStorage.setItem(
      `navbar_clicked_${currentUser.uid}`,
      JSON.stringify(Array.from(newClickedItems))
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-menu-container')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);


  // Função para detectar se uma rota está ativa
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Menu para usuários não autenticados
  const publicNavLinks: NavLink[] = [
    { name: 'Início', href: '/', icon: null },
    { name: 'Sobre', href: '/about', icon: null },
    { name: 'Recursos', href: '/features', icon: null },
  ];

  // Verificar se está na página de materiais
  const isMaterialsPage = location.pathname === '/materials';

  // Menu para usuários autenticados - normal
  const authenticatedNavLinks: NavLink[] = [
    { name: 'Descoberta', href: '/discover', icon: Heart },
    { name: 'UniVerso', href: '/feed', icon: Newspaper, isHighlighted: true },
    { name: 'Materiais', href: '/materials', icon: BookOpen, isNew: true },
    { name: 'Grupos', href: '/groups', icon: Users },
    { name: 'Bate-papo', href: '/chat', icon: MessageCircle },
    { name: 'Eventos', href: '/events', icon: Calendar, isNew: true },
    { name: 'Guia do Campus', href: '/campus-guide', icon: MapPin, isNew: true },
  ];

  // Menu customizado para página de materiais
  const materialsNavLinks: NavLink[] = [
    { name: 'Descoberta', href: '/discover', icon: Heart },
    { name: 'UniVerso', href: '/feed', icon: Newspaper },
    { name: 'Práticas', href: '/materials', icon: BookOpen, isActive: true },
    { name: 'Teoria', href: '/materials', icon: BookOpen },
    { name: 'Especialistas', href: '/experts', icon: Users },
  ];

  // Usar menu de materiais se estiver na página de materiais
  const navLinks = isMaterialsPage ? materialsNavLinks : authenticatedNavLinks;

  // Menu suspenso do usuário
  const userDropdownItems = [
    { name: 'Meu Perfil', href: '/dashboard', icon: User },
    { name: 'Minhas Métricas', href: '/my-analytics', icon: BarChart3, isNew: true },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Minhas Conquistas', href: '/achievements', icon: Award, isNew: true },
  ];
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isMaterialsPage
        ? isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800' 
          : 'bg-gray-900/80 backdrop-blur-sm'
        : isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="group">
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              // Menu para usuários autenticados
              navLinks.map((link) => {
                const isActive = link.isActive || (link.href === '/materials' && isMaterialsPage);
                const showNewBadge = link.isNew && !isMaterialsPage && !hasBeenClicked(link.href);
                
                const handleClick = () => {
                  // Marcar como clicado se tiver badge NOVO
                  if (link.isNew && !hasBeenClicked(link.href)) {
                    markAsClicked(link.href);
                  }
                };
                
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handleClick}
                    className={`font-medium transition-all duration-200 relative group flex items-center space-x-2 ${
                      isMaterialsPage
                        ? isActive
                          ? 'text-yellow-400 font-semibold'
                          : 'text-gray-300 hover:text-yellow-400'
                        : link.isHighlighted 
                          ? 'text-pink-600 text-lg font-bold animate-pulse' 
                          : 'text-gray-600 hover:text-indigo-500'
                    }`}
                  >
                    {link.icon && (
                      <link.icon className={`h-4 w-4 ${
                        isMaterialsPage
                          ? isActive ? 'text-yellow-400' : 'text-gray-300'
                          : link.isHighlighted ? 'text-pink-500' : ''
                      }`} />
                    )}
                    <span className="relative">
                      {link.name}
                      {showNewBadge && (
                        <span className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">
                          NOVO
                        </span>
                      )}
                    </span>
                    {!isMaterialsPage && (
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                    )}
                  </Link>
                );
              })
            ) : (
              // Menu para usuários não autenticados
              publicNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-600 hover:text-indigo-500 font-medium transition-colors duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                {/* User Profile Button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Menu do usuário"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <UserAvatar
                    photoURL={userProfile?.photoURL || currentUser?.photoURL}
                    displayName={userProfile?.displayName}
                    email={currentUser?.email}
                    size="sm"
                    showGraduationCap={true}
                  />
                  <span className={isMaterialsPage ? 'text-gray-300 font-medium' : 'text-gray-700 font-medium'}>
                    {userProfile?.displayName || 'Usuário'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {userDropdownItems.map((item) => {
                      const showNewBadge = item.isNew && !hasBeenClicked(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            // Marcar como clicado se tiver badge NOVO
                            if (item.isNew && !hasBeenClicked(item.href)) {
                              markAsClicked(item.href);
                            }
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.name}</span>
                          {showNewBadge && (
                            <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                              NOVO
                            </span>
                          )}
                        </Link>
                      );
                    })}
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
              <>
                <Link
                  to="/login"
                  className="btn-ghost flex items-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Cadastrar</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              isMaterialsPage
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-100'
            }`}
            aria-label="Menu de navegação"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isMaterialsPage ? 'text-gray-300' : 'text-gray-600'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isMaterialsPage ? 'text-gray-300' : 'text-gray-600'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className={`md:hidden py-4 border-t ${
            isMaterialsPage 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`} role="menu">
            <div className="space-y-2">
              {isAuthenticated ? (
                // Menu para usuários autenticados
                <>
                  <div className={`px-4 py-2 flex items-center space-x-3 border-b pb-4 ${
                    isMaterialsPage ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <UserAvatar
                      photoURL={userProfile?.photoURL || currentUser?.photoURL}
                      displayName={userProfile?.displayName}
                      email={currentUser?.email}
                      size="sm"
                      showGraduationCap={true}
                    />
                    <span className={isMaterialsPage ? 'text-gray-300 font-medium' : 'text-gray-700 font-medium'}>
                      {userProfile?.displayName || 'Usuário'}
                    </span>
                  </div>
                  
                  {navLinks.map((link) => {
                    const isActive = link.isActive || (link.href === '/materials' && isMaterialsPage);
                    const showNewBadge = link.isNew && !isMaterialsPage && !hasBeenClicked(link.href);
                    
                    const handleClick = () => {
                      setIsMobileMenuOpen(false);
                      // Marcar como clicado se tiver badge NOVO
                      if (link.isNew && !hasBeenClicked(link.href)) {
                        markAsClicked(link.href);
                      }
                    };
                    
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={handleClick}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                          isMaterialsPage
                            ? isActive
                              ? 'bg-gray-800 text-yellow-400 shadow-md transform scale-105'
                              : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                            : isActive
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transform scale-105'
                              : link.isHighlighted 
                                ? 'text-pink-600 font-bold text-lg hover:bg-pink-50' 
                                : 'text-gray-600 hover:text-indigo-500 hover:bg-gray-50'
                        }`}
                      >
                        {link.icon && (
                          <link.icon className={`h-4 w-4 ${
                            isMaterialsPage
                              ? isActive ? 'text-yellow-400' : 'text-gray-300'
                              : isActive 
                                ? 'text-white' 
                                : link.isHighlighted 
                                  ? 'text-pink-500' 
                                  : 'text-gray-500'
                          }`} />
                        )}
                        <span className="relative">
                          {link.name}
                          {showNewBadge && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                              NOVO
                            </span>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                  
                  <hr className="my-4 border-gray-200" />
                  
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                // Menu para usuários não autenticados
                <>
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                        isMaterialsPage
                          ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                          : 'text-gray-600 hover:text-indigo-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <hr className="my-4 border-gray-200" />
                </>
              )}
              
              {!isAuthenticated && (
                <div className="space-y-2 px-4">
                  <Link
                    to="/login"
                    className="btn-ghost w-full flex items-center justify-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Cadastrar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
