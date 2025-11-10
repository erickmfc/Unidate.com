import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  Flag,
  Settings,
  Calendar,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Home,
  UserCheck,
  FileText,
  Target,
  TrendingUp,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
  isExpanded?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: number;
  isNew?: boolean;
  isPro?: boolean;
}

const ModernAdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard', 'community']);
  const [pendingReports] = useState(0);
  const { adminSession, logoutAdmin } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Carregar preferência de modo escuro
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('admin-dark-mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Salvar preferência de modo escuro
  useEffect(() => {
    localStorage.setItem('admin-dark-mode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const menuSections: MenuSection[] = [
    {
      id: 'dashboard',
      title: 'Centro de Comando',
      icon: LayoutDashboard,
      items: [
        {
          id: 'overview',
          name: 'Visão Geral',
          href: '/admin/dashboard',
          icon: BarChart3,
          description: 'Métricas e KPIs em tempo real'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          href: '/admin/analytics',
          icon: TrendingUp,
          description: 'Relatórios e insights'
        },
        {
          id: 'notifications',
          name: 'Notificações',
          href: '/admin/notifications',
          icon: Bell,
          description: 'Central de alertas',
          badge: pendingReports
        },
        {
          id: 'reports',
          name: 'Relatórios',
          href: '/admin/reports',
          icon: FileText,
          description: 'Relatórios avançados'
        }
      ]
    },
    {
      id: 'community',
      title: 'Comunidade',
      icon: Users,
      items: [
        {
          id: 'users',
          name: 'Usuários',
          href: '/admin/users',
          icon: UserCheck,
          description: 'Gerenciar membros'
        },
        {
          id: 'content',
          name: 'Conteúdo',
          href: '/admin/content',
          icon: MessageSquare,
          description: 'Feed e grupos',
          badge: pendingReports
        },
        {
          id: 'moderation',
          name: 'Moderação',
          href: '/admin/moderation',
          icon: Flag,
          description: 'Fila de denúncias',
          badge: pendingReports
        },
        {
          id: 'verification',
          name: 'Verificação',
          href: '/admin/verification',
          icon: Shield,
          description: 'Perfis verificados',
          isNew: true
        }
      ]
    },
    {
      id: 'engagement',
      title: 'Engajamento',
      icon: Zap,
      items: [
        {
          id: 'features',
          name: 'Funcionalidades',
          href: '/admin/features',
          icon: Settings,
          description: 'Feature flags'
        },
        {
          id: 'events',
          name: 'Eventos',
          href: '/admin/events',
          icon: Calendar,
          description: 'Batalha de Cursos'
        },
        {
          id: 'campaigns',
          name: 'Campanhas',
          href: '/admin/campaigns',
          icon: Target,
          description: 'Marketing e promoções',
          isPro: true
        }
      ]
    },
    {
      id: 'system',
      title: 'Sistema',
      icon: Database,
      items: [
        {
          id: 'settings',
          name: 'Configurações',
          href: '/admin/settings',
          icon: Settings,
          description: 'Sistema e equipe'
        },
        {
          id: 'security',
          name: 'Segurança',
          href: '/admin/security',
          icon: Lock,
          description: 'Logs e auditoria'
        },
        {
          id: 'backup',
          name: 'Backup',
          href: '/admin/backup',
          icon: Database,
          description: 'Dados e restauração'
        }
      ]
    }
  ];

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const isActive = (href: string) => location.pathname === href;

  const getStatusColor = () => {
    if (pendingReports > 0) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (pendingReports > 0) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'
      }`}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-16 px-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                UniDate Admin
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Centro de Comando
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar funcionalidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              }`}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {filteredSections.map((section) => {
              const SectionIcon = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              
              return (
                <div key={section.id} className="space-y-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <SectionIcon className="h-5 w-5" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.href);
                        
                        return (
                          <Link
                            key={item.id}
                            to={item.href}
                            className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                              active
                                ? darkMode
                                  ? 'bg-purple-600 text-white shadow-lg'
                                  : 'bg-purple-100 text-purple-700 shadow-sm'
                                : darkMode
                                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <ItemIcon className="h-4 w-4" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{item.name}</span>
                                  {item.isNew && (
                                    <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                      NOVO
                                    </span>
                                  )}
                                  {item.isPro && (
                                    <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                      PRO
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs ${
                                  active 
                                    ? darkMode ? 'text-purple-200' : 'text-purple-600'
                                    : darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {item.badge && item.badge > 0 && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {adminSession?.user?.displayName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {adminSession?.user?.displayName || 'Admin UniDate'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Super Admin
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="text-sm">Modo {darkMode ? 'Claro' : 'Escuro'}</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Bar */}
        <header className={`sticky top-0 z-40 h-16 border-b transition-colors ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sistema {pendingReports > 0 ? 'Com Alertas' : 'Operacional'}
                </span>
                {getStatusIcon()}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <Bell className="h-5 w-5" />
              </button>
              
              <button className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <RefreshCw className="h-5 w-5" />
              </button>
              
              <div className={`w-px h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {adminSession?.user?.displayName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {adminSession?.user?.displayName || 'Admin UniDate'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Super Admin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ModernAdminLayout;
