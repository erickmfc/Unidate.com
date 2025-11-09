import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  Flag,
  Settings,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  BarChart3,
  TrendingUp,
  FileText,
  Bot
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SimpleAdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Verificar se há preferência salva, senão usar modo escuro por padrão
    const saved = localStorage.getItem('admin-dark-mode');
    return saved ? JSON.parse(saved) : true;
  });
  const { adminSession, logoutAdmin } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('admin-dark-mode', JSON.stringify(newDarkMode));
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'analytics', name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { id: 'ai-control', name: 'Controle de IA', href: '/admin/ai-control', icon: Bot },
    { id: 'notifications', name: 'Notificações', href: '/admin/notifications', icon: Bell },
    { id: 'reports', name: 'Relatórios', href: '/admin/reports', icon: FileText },
    { id: 'users', name: 'Usuários', href: '/admin/users', icon: Users },
    { id: 'content', name: 'Conteúdo', href: '/admin/content', icon: MessageSquare },
    { id: 'moderation', name: 'Moderação', href: '/admin/moderation', icon: Flag },
    { id: 'features', name: 'Funcionalidades', href: '/admin/features', icon: Settings }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
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
              <LayoutDashboard className="h-5 w-5 text-white" />
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? darkMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700'
                      : darkMode
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
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
              onClick={toggleDarkMode}
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
      <div className="lg:pl-64">
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
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sistema Operacional
                </span>
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

export default SimpleAdminLayout;
