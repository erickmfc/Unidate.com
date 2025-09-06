import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Users, 
  Newspaper, 
  MessageCircle,
  TrendingUp,
  Calendar,
  Bell,
  Search
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();

  const quickActions = [
    {
      title: 'Descobrir Pessoas',
      description: 'Encontre novos amigos e conexões',
      icon: Heart,
      href: '/discover',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'UniVerso',
      description: 'Veja o que está acontecendo no campus',
      icon: Newspaper,
      href: '/feed',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Grupos',
      description: 'Participe de comunidades de interesse',
      icon: Users,
      href: '/groups',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Chat',
      description: 'Converse com seus matches',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentActivity = [
    {
      type: 'match',
      message: 'Você tem um novo match com Maria Santos!',
      time: '2 horas atrás',
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      type: 'post',
      message: 'Ana Silva curtiu seu post no UniVerso',
      time: '4 horas atrás',
      icon: Newspaper,
      color: 'text-blue-500'
    },
    {
      type: 'group',
      message: 'Você foi adicionado ao grupo "Estudantes de Engenharia"',
      time: '1 dia atrás',
      icon: Users,
      color: 'text-green-500'
    },
    {
      type: 'message',
      message: 'Carlos enviou uma mensagem',
      time: '2 dias atrás',
      icon: MessageCircle,
      color: 'text-purple-500'
    }
  ];

  const stats = [
    { label: 'Matches', value: '12', change: '+3', positive: true },
    { label: 'Posts', value: '8', change: '+1', positive: true },
    { label: 'Grupos', value: '5', change: '0', positive: false },
    { label: 'Mensagens', value: '24', change: '+7', positive: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {userProfile?.displayName || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta ao UniDate. Aqui está um resumo da sua atividade.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.positive ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className={`${action.bgColor} p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Atividade Recente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="card">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Events */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Festa de Boas-vindas</p>
                    <p className="text-xs text-gray-500">Amanhã às 19:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Grupo de Estudos</p>
                    <p className="text-xs text-gray-500">Sexta às 14:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6" />
            <h3 className="text-xl font-bold">Dica do Dia</h3>
          </div>
          <p className="text-white/90 mb-4">
            Complete seu perfil para aumentar suas chances de match em 40%! 
            Adicione fotos, interesses e uma bio interessante.
          </p>
          <Link 
            to="/profile" 
            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <span>Completar Perfil</span>
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
