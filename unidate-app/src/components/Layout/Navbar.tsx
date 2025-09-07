import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../firebase/auth';
import { 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  User,
  Settings,
  LogOut,
  Heart,
  MessageCircle,
  Users,
  Newspaper,
  Calendar,
  MapPin,
  Award
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Menu para usuários não autenticados
  const publicNavLinks = [
    { name: 'Início', href: '/', icon: null },
    { name: 'Sobre', href: '/about', icon: null },
    { name: 'Recursos', href: '/features', icon: null },
  ];

  // Menu para usuários autenticados
  const authenticatedNavLinks = [
    { name: 'Descoberta', href: '/discover', icon: Heart },
    { name: 'UniVerso', href: '/feed', icon: Newspaper, isHighlighted: true },
    { name: 'Grupos', href: '/groups', icon: Users },
    { name: 'Bate-papo', href: '/chat', icon: MessageCircle },
    { name: 'Eventos', href: '/events', icon: Calendar, isNew: true },
    { name: 'Guia do Campus', href: '/campus-guide', icon: MapPin, isNew: true },
  ];

  // Menu suspenso do usuário
  const userDropdownItems = [
    { name: 'Meu Perfil', href: '/profile', icon: User },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Minhas Conquistas', href: '/achievements', icon: Award, isNew: true },
  ];


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
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
              authenticatedNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`font-medium transition-all duration-200 relative group flex items-center space-x-2 ${
                    link.isHighlighted 
                      ? 'text-pink-600 text-lg font-bold animate-pulse' 
                      : 'text-gray-600 hover:text-indigo-500'
                  }`}
                >
                  {link.icon && <link.icon className={`h-4 w-4 ${link.isHighlighted ? 'text-pink-500' : ''}`} />}
                  <span className="relative">
                    {link.name}
                    {link.isNew && (
                      <span className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">
                        NOVO
                      </span>
                    )}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))
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
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {userProfile?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {userProfile?.displayName || 'Usuário'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
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
                        {item.isNew && (
                          <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                            NOVO
                          </span>
                        )}
                      </Link>
                    ))}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Menu de navegação"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-white border-t border-gray-200 py-4" role="menu">
            <div className="space-y-2">
              {isAuthenticated ? (
                // Menu para usuários autenticados
                <>
                  <div className="px-4 py-2 flex items-center space-x-3 border-b border-gray-200 pb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {userProfile?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {userProfile?.displayName || 'Usuário'}
                    </span>
                  </div>
                  
                  {authenticatedNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        link.isHighlighted 
                          ? 'text-pink-600 font-bold text-lg' 
                          : 'text-gray-600 hover:text-indigo-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.icon && <link.icon className={`h-4 w-4 ${link.isHighlighted ? 'text-pink-500' : ''}`} />}
                      <span className="relative">
                        {link.name}
                        {link.isNew && (
                          <span className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                            NOVO
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                  
                  <hr className="my-4 border-gray-200" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left rounded-lg transition-colors duration-200"
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
                      className="block px-4 py-2 text-gray-600 hover:text-indigo-500 hover:bg-gray-50 rounded-lg transition-colors duration-200"
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
