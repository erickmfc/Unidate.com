import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUniDateToast } from '../components/UI/Toast';
import { DashboardService, UserStats, RecentActivity } from '../services/dashboardService';
import { updateUserProfile } from '../firebase/auth';
import { 
  Heart, 
  Users, 
  Newspaper, 
  MessageCircle,
  Calendar,
  Bell,
  Search,
  Star,
  ThumbsUp,
  Building,
  BookOpen,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  GraduationCap,
  Upload
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
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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
  
  // Estados para edição de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    interests: userProfile?.interests || [],
    university: userProfile?.university || '',
    course: userProfile?.course || '',
    year: userProfile?.year || new Date().getFullYear(),
    photoURL: userProfile?.photoURL || ''
  });
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);

  // Atualizar formData quando userProfile mudar
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        interests: userProfile.interests || [],
        university: userProfile.university || '',
        course: userProfile.course || '',
        year: userProfile.year || new Date().getFullYear(),
        photoURL: userProfile.photoURL || ''
      });
    }
  }, [userProfile]);

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
      console.log('🔄 Carregando dados do dashboard...');

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

  // Handlers para edição de perfil
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest),
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          photoURL: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        displayName: formData.displayName,
        bio: formData.bio,
        interests: formData.interests,
        university: formData.university,
        course: formData.course,
        year: formData.year,
        photoURL: formData.photoURL
      });
      setIsEditing(false);
      // Recarregar dados do dashboard
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      bio: userProfile?.bio || '',
      interests: userProfile?.interests || [],
      university: userProfile?.university || '',
      course: userProfile?.course || '',
      year: userProfile?.year || new Date().getFullYear(),
      photoURL: userProfile?.photoURL || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Card Principal com Saudação e Status */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {greeting.greeting} 👋
              </h1>
              <p className="text-lg text-gray-600">
                {greeting.message}
              </p>
            </div>
            
            {/* Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Cards de Estatísticas */}
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

        {/* Layout Principal: Ações Rápidas (esquerda) e Atividade/Eventos (direita) */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Ações Rápidas e Perfil */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {QUICK_ACTIONS.map((action, index) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="bg-white p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group border border-gray-100"
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

            {/* Seção de Perfil com Edição Integrada */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                )}
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-start space-x-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center overflow-hidden">
                    {formData.photoURL ? (
                      <img 
                        src={formData.photoURL} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {formData.displayName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-primary-500 focus:outline-none w-full mb-4"
                      placeholder="Seu nome"
                    />
                  ) : (
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {formData.displayName || 'Usuário'}
                    </h3>
                  )}
                  
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Conte um pouco sobre você..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-none mb-4"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600 mb-4">
                      {formData.bio || 'Nenhuma biografia adicionada ainda.'}
                    </p>
                  )}
                  
                  {/* Interesses */}
                  <div className="mb-4">
                    {isEditing && (
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Adicionar interesse..."
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                        />
                        <button
                          onClick={handleAddInterest}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm"
                        >
                          Adicionar
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          <span>#{interest}</span>
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveInterest(interest)}
                              className="hover:text-primary-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {formData.interests.length === 0 && (
                        <p className="text-gray-500 italic text-sm">Nenhum interesse adicionado ainda.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Informações Acadêmicas */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">Universidade</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 text-sm"
                          placeholder="Sua universidade"
                        />
                      ) : (
                        <p className="text-gray-600">{formData.university || 'Não informado'}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">Curso</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="course"
                          value={formData.course}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 text-sm"
                          placeholder="Seu curso"
                        />
                      ) : (
                        <p className="text-gray-600">{formData.course || 'Não informado'}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Ano de Ingresso</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          min="2020"
                          max={new Date().getFullYear()}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 text-sm"
                        />
                      ) : (
                        <p className="text-gray-600">{formData.year || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Atividade Recente e Próximos Eventos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Atividade Recente</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`p-2 rounded-lg bg-gray-100`}>
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Nenhuma atividade recente</p>
                  <p className="text-sm text-gray-400">Comece a usar o UniDate!</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Nenhum evento próximo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
