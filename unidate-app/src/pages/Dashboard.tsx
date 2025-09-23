import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUniDateToast } from '../components/UI/Toast';
import { DashboardService, UserStats, RecentActivity } from '../services/dashboardService';
import { 
  Heart, 
  Users, 
  Newspaper, 
  MessageCircle,
  Calendar,
  Bell,
  Search,
  Star,
  ThumbsUp
} from 'lucide-react';

// Constantes movidas para fora do componente
const QUICK_ACTIONS = [
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
] as const;

const MOTIVATIONAL_MESSAGES = [
  'Pronto(a) para conectar com sua galera?',
  'Vamos fazer acontecer hoje!',
  'Sua comunidade te espera!',
  'Que tal descobrir algo novo?',
  'Hora de expandir sua rede!',
  'Vamos criar conexões incríveis!'
] as const;

// Componente para card de estatística
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = ({ label, value, icon: Icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`flex items-center space-x-1 text-sm ${color}`}>
        <Icon className="h-4 w-4" />
        <span>+{value}</span>
      </div>
    </div>
  </div>
);

// Componente para status card
const StatusCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  gradient: string;
}> = ({ icon: Icon, title, subtitle, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} text-white p-4 rounded-2xl`}>
    <div className="flex items-center space-x-2">
      <Icon className="h-5 w-5" />
      <span className="font-medium">{title}</span>
    </div>
    <p className="text-sm opacity-90 mt-1">{subtitle}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const { showWelcome } = useUniDateToast();
  
  const [stats, setStats] = useState<UserStats>({
    matches: 0,
    posts: 0,
    groups: 0,
    messages: 0,
    totalLikes: 0,
    profileCompletion: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoizar saudação para evitar recálculo desnecessário
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const userName = userProfile?.displayName || 'Usuário';
    
    const timeGreeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

    return {
      greeting: `${timeGreeting}, ${userName}!`,
      message: randomMessage
    };
  }, [userProfile?.displayName]);

  // Callback para carregar dados
  const loadDashboardData = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      console.log(' Carregando dados do dashboard...');

      const [userStats, activity, events] = await Promise.all([
        DashboardService.getUserStats(currentUser.uid),
        DashboardService.getRecentActivity(currentUser.uid),
        DashboardService.getUpcomingEvents(currentUser.uid)
      ]);

      setStats(userStats);
      setRecentActivity(activity);
      setUpcomingEvents(events);

      console.log('✅ Dados do dashboard carregados');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Mostrar saudação de boas-vindas
  useEffect(() => {
    if (userProfile?.displayName && !loading) {
      const hasShownWelcome = sessionStorage.getItem('dashboard-welcome-shown');
      if (!hasShownWelcome) {
        showWelcome(userProfile.displayName);
        sessionStorage.setItem('dashboard-welcome-shown', 'true');
      }
    }
  }, [userProfile?.displayName, loading, showWelcome]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {greeting.greeting} 👋
                </h1>
                <p className="text-lg text-gray-600">
                  {greeting.message}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <StatusCard
                icon={Users}
                title="Conectado"
                subtitle="Sua comunidade está ativa"
                gradient="from-green-500 to-emerald-500"
              />
              <StatusCard
                icon={Star}
                title={`Perfil ${stats.profileCompletion}%`}
                subtitle="Completude do perfil"
                gradient="from-blue-500 to-indigo-500"
              />
                  <StatusCard
                    icon={ThumbsUp}
                    title={`${stats.totalLikes} apoios`}
                    subtitle="Total recebido"
                    gradient="from-pink-500 to-purple-500"
                  />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Sintonias"
                value={stats.matches}
                icon={Heart}
                color="text-pink-600"
              />
          <StatCard
            label="Posts"
            value={stats.posts}
            icon={Newspaper}
            color="text-blue-600"
          />
          <StatCard
            label="Grupos"
            value={stats.groups}
            icon={Users}
            color="text-green-600"
          />
          <StatCard
            label="Mensagens"
            value={stats.messages}
            icon={MessageCircle}
            color="text-purple-600"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {QUICK_ACTIONS.map((action, index) => (
                <Link
                  key={action.href}
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

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Atividade Recente</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="card">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-8">
                  <p className="text-gray-500">Nenhuma atividade recente</p>
                  <p className="text-sm text-gray-400 mt-1">Comece a usar o UniDate!</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {event.date.toLocaleDateString('pt-BR')} às {event.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6" />
            <h3 className="text-xl font-bold">Dica do Dia</h3>
          </div>
          <p className="text-white/90 mb-4">
            {stats.profileCompletion < 100 
              ? `Complete seu perfil para aumentar suas chances de match em 40%! Seu perfil está ${stats.profileCompletion}% completo.`
              : 'Parabéns! Seu perfil está completo. Continue interagindo para aumentar sua visibilidade!'
            }
          </p>
          <Link 
            to="/profile" 
            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <span>{stats.profileCompletion < 100 ? 'Completar Perfil' : 'Ver Perfil'}</span>
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
