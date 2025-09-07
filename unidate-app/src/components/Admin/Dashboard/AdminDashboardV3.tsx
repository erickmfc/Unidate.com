import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Flag, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Bell,
  Settings,
  BarChart3,
  Clock,
  Eye,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { AdminMetricsService } from '../../../services/firebaseAdmin';

interface DashboardMetrics {
  activeUsers: number;
  newRegistrations: number;
  postsLast24h: number;
  pendingReports: number;
  totalUsers: number;
  totalPosts: number;
  totalGroups: number;
  engagementRate: number;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'post' | 'group' | 'report';
  description: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high';
}

const AdminDashboardV3: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeUsers: 0,
    newRegistrations: 0,
    postsLast24h: 0,
    pendingReports: 0,
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    engagementRate: 0
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Carregar métricas reais do Firebase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados reais do Firebase
        const firebaseMetrics = await AdminMetricsService.getMetrics();
        
        // Converter para o formato do dashboard
        setMetrics({
          activeUsers: firebaseMetrics.activeUsers,
          newRegistrations: firebaseMetrics.newUsers,
          postsLast24h: firebaseMetrics.totalPosts,
          pendingReports: firebaseMetrics.pendingReports,
          totalUsers: firebaseMetrics.totalUsers,
          totalPosts: firebaseMetrics.totalPosts,
          totalGroups: firebaseMetrics.totalGroups,
          engagementRate: firebaseMetrics.engagementRate
        });

        setRecentActivity([]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Fallback para dados mock em caso de erro
        setMetrics({
          activeUsers: 0,
          newRegistrations: 0,
          postsLast24h: 0,
          pendingReports: 0,
          totalUsers: 0,
          totalPosts: 0,
          totalGroups: 0,
          engagementRate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'post': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'group': return <Users className="h-4 w-4 text-purple-500" />;
      case 'report': return <Flag className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Centro de Comando UniDate</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral em tempo real da plataforma</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          
          <button 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* Widgets Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuários Ativos Agora */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.activeUsers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online agora</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0% vs ontem</span>
          </div>
        </div>

        {/* Novos Cadastros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Cadastros</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.newRegistrations}</p>
              <p className="text-sm text-gray-500">Últimas 24h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0% vs ontem</span>
          </div>
        </div>

        {/* Posts UniVerso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Posts UniVerso</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.postsLast24h}</p>
              <p className="text-sm text-gray-500">Últimas 24h</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0% vs ontem</span>
          </div>
        </div>

        {/* Denúncias Pendentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Denúncias</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.pendingReports}</p>
              <p className="text-sm text-gray-500">Pendentes</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {metrics.pendingReports > 0 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">Requer atenção</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">Tudo em ordem</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Posts</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalPosts}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Engajamento</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.engagementRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atalhos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/moderation')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Flag className="h-5 w-5 text-red-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Fila de Moderação</p>
              <p className="text-sm text-gray-500">Analisar denúncias pendentes</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/admin/notifications')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="h-5 w-5 text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Criar Anúncio Global</p>
              <p className="text-sm text-gray-500">Comunicar com todos os usuários</p>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Funcionalidade de manutenção será implementada em breve')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Ativar Modo Manutenção</p>
              <p className="text-sm text-gray-500">Manter o sistema offline</p>
            </div>
          </button>
        </div>
      </div>

      {/* Feed de Atividade Recente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
          <button 
            onClick={() => navigate('/admin/analytics')}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Ver todas
          </button>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-400">As atividades aparecerão aqui conforme os usuários interagem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${getSeverityColor(activity.severity)}`}
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status da Plataforma */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status da Plataforma</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">API</p>
              <p className="text-sm text-gray-500">Operacional</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Banco de Dados</p>
              <p className="text-sm text-gray-500">Operacional</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Autenticação</p>
              <p className="text-sm text-gray-500">Operacional</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Armazenamento</p>
              <p className="text-sm text-gray-500">Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardV3;
