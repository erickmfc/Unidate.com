import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import UniDateLogo from '../../UI/UniDateLogo';
import { 
  LayoutDashboard,
  Users,
  Flag,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingReports] = useState(12); // Simulado
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

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e métricas'
    },
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Users,
      description: 'Gerenciar membros'
    },
    {
      name: 'Moderação',
      href: '/admin/moderation',
      icon: Flag,
      description: 'Fila de denúncias',
      badge: pendingReports > 0 ? pendingReports : undefined
    },
    {
      name: 'Eventos',
      href: '/admin/events',
      icon: Calendar,
      description: 'Batalha de Cursos'
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
      description: 'Sistema e equipe'
    }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center space-x-3">
            <UniDateLogo size="sm" showText={false} />
            <div>
              <h1 className="text-white font-bold text-lg">Backstage</h1>
              <p className="text-gray-400 text-xs">UniDate Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {adminSession?.user.displayName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {adminSession?.user.displayName || 'Administrador'}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {adminSession?.user.role === 'super-admin' ? 'Super Admin' : 'Moderador'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => isActive(item.href))?.name || 'Backstage UniDate'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notificações */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                {pendingReports > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingReports}
                  </span>
                )}
              </button>

              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/admin/moderation"
                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{pendingReports} Denúncias</span>
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
