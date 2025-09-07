import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Flag, 
  MessageSquare, 
  Activity,
  AlertTriangle,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

interface DashboardMetrics {
  usersOnline: number;
  newRegistrations24h: number;
  pendingReports: number;
  posts24h: number;
  totalUsers: number;
  totalPosts: number;
  engagementRate: number;
  growthRate: number;
}

interface ActivityItem {
  id: string;
  type: 'user_banned' | 'user_suspended' | 'content_removed' | 'group_created' | 'event_created';
  description: string;
  timestamp: Date;
  user?: string;
  severity: 'low' | 'medium' | 'high';
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    usersOnline: 0,
    newRegistrations24h: 0,
    pendingReports: 0,
    posts24h: 0,
    totalUsers: 0,
    totalPosts: 0,
    engagementRate: 0,
    growthRate: 0
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados reais do admin
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // TODO: Implementar carregamento de dados reais do Firebase
        // Por enquanto, usar dados zerados para mostrar apenas informações reais
        setMetrics({
          usersOnline: 0,
          newRegistrations24h: 0,
          pendingReports: 0,
          posts24h: 0,
          totalUsers: 0,
          totalPosts: 0,
          engagementRate: 0,
          growthRate: 0
        });

        // TODO: Implementar carregamento de atividades reais do Firebase
        setRecentActivity([]);
        
      } catch (error) {
        console.error('Erro ao carregar dados do admin:', error);
      } finally {
        setLoading(false);
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_banned':
        return <Users className="h-4 w-4 text-red-500" />;
      case 'user_suspended':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'content_removed':
        return <Flag className="h-4 w-4 text-orange-500" />;
      case 'group_created':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'event_created':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da comunidade UniDate</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Atualizado há 2 minutos</span>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuários Online */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Online</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.usersOnline.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+5.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Novos Cadastros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Cadastros (24h)</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.newRegistrations24h}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Denúncias Pendentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Denúncias Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.pendingReports}</p>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">-8.1%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Posts (24h) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Posts UniVerso (24h)</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.posts24h}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+3.7%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Crescimento de Usuários</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Últimos 30 dias</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de crescimento</p>
              <p className="text-sm text-gray-400">+{metrics.growthRate}% este mês</p>
            </div>
          </div>
        </div>

        {/* Engagement by Course */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Engajamento por Curso</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Top 5 cursos</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { course: 'Engenharia de Software', posts: 1247, growth: '+15%' },
              { course: 'Medicina', posts: 1156, growth: '+8%' },
              { course: 'Direito', posts: 892, growth: '+12%' },
              { course: 'Administração', posts: 743, growth: '+5%' },
              { course: 'Psicologia', posts: 621, growth: '+18%' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.course}</p>
                    <p className="text-sm text-gray-500">{item.posts} posts</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">{item.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
          <Link
            to="/admin/activity"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Ver todas
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${getSeverityColor(activity.severity)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                  activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {activity.severity === 'high' ? 'Alto' :
                   activity.severity === 'medium' ? 'Médio' : 'Baixo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/moderation"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Moderação</h3>
              <p className="text-sm text-gray-600">{metrics.pendingReports} denúncias pendentes</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Usuários</h3>
              <p className="text-sm text-gray-600">{metrics.totalUsers.toLocaleString()} membros</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/events"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Eventos</h3>
              <p className="text-sm text-gray-600">Batalha de Cursos ativa</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
