import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings,
  User,
  MessageSquare,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { AIBotProfilesService, BotProfile } from '../../../services/aiBotProfilesService';
import { multiBotScheduler } from '../../../services/multiBotScheduler';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import BotProfileModal from './BotProfileModal';

const BotProfilesManager: React.FC = () => {
  const { success, error } = useToast();
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState<BotProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BotProfile | null>(null);
  const [schedulesStatus, setSchedulesStatus] = useState<Map<string, { isActive: boolean; lastPostTime: Date | null }>>(new Map());

  useEffect(() => {
    loadProfiles();
    loadSchedulesStatus();

    const interval = setInterval(() => {
      loadSchedulesStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const loadedProfiles = await AIBotProfilesService.getProfiles();
      setProfiles(loadedProfiles);
      
    } catch (err) {
      console.error('Erro ao carregar perfis:', err);
      error('Erro ao carregar perfis', 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulesStatus = () => {
    const status = multiBotScheduler.getSchedulesStatus();
    const statusMap = new Map();
    status.forEach(s => {
      statusMap.set(s.profileId, { isActive: s.isActive, lastPostTime: s.lastPostTime });
    });
    setSchedulesStatus(statusMap);
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowModal(true);
  };

  const handleEditProfile = (profile: BotProfile) => {
    setEditingProfile(profile);
    setShowModal(true);
  };

  const handleSaveProfile = async (profileData: Partial<BotProfile>) => {
    try {
      const userId = currentUser?.uid || 'system';
      
      if (editingProfile) {
        await AIBotProfilesService.updateProfile(editingProfile.id, profileData);
        success('Perfil atualizado com sucesso!');
        
        const updatedProfile = { ...editingProfile, ...profileData } as BotProfile;
        await multiBotScheduler.updateProfileSchedule(updatedProfile, userId);
      } else {
        const avatar = AIBotProfilesService.generateAvatar(
          profileData.name || 'Bot',
          profileData.course || 'Curso'
        );
        
        const newProfile: Omit<BotProfile, 'id' | 'postsCount' | 'lastPostTime' | 'createdAt' | 'updatedAt'> = {
          name: profileData.name || 'Bot',
          handle: profileData.handle || `@${profileData.name?.toLowerCase().replace(/\s+/g, '') || 'bot'}`,
          course: profileData.course || 'Curso',
          university: profileData.university || 'Universidade',
          period: profileData.period || 1,
          avatar: profileData.avatar || avatar,
          bio: profileData.bio || '',
          writingStyle: profileData.writingStyle || 'casual e descontraído',
          personality: profileData.personality || 'descontraído',
          interests: profileData.interests || ['estudos', 'universidade'],
          postingFrequency: profileData.postingFrequency || {
            enabled: false,
            intervalMinutes: 60
          },
          status: profileData.status || 'draft'
        };

        const profileId = await AIBotProfilesService.createProfile(newProfile);
        success('Perfil criado com sucesso!');
        
        if (newProfile.status === 'active' && newProfile.postingFrequency.enabled) {
          const fullProfile = { 
            ...newProfile, 
            id: profileId, 
            postsCount: 0, 
            lastPostTime: null, 
            createdAt: new Date(), 
            updatedAt: new Date() 
          } as BotProfile;
          await multiBotScheduler.startProfileSchedule(fullProfile, userId);
        }
      }
      
      setShowModal(false);
      setEditingProfile(null);
      loadProfiles();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      error('Erro ao salvar perfil', 'Tente novamente.');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este perfil?')) return;

    try {
      multiBotScheduler.stopProfileSchedule(profileId);
      await AIBotProfilesService.deleteProfile(profileId);
      success('Perfil deletado com sucesso!');
      loadProfiles();
    } catch (err) {
      console.error('Erro ao deletar perfil:', err);
      error('Erro ao deletar perfil', 'Tente novamente.');
    }
  };

  const handleToggleStatus = async (profile: BotProfile) => {
    try {
      const newStatus = profile.status === 'active' ? 'paused' : 'active';
      await AIBotProfilesService.updateProfile(profile.id, { status: newStatus });
      
      const userId = currentUser?.uid || 'system';
      
      if (newStatus === 'active' && profile.postingFrequency.enabled) {
        await multiBotScheduler.startProfileSchedule({ ...profile, status: newStatus }, userId);
      } else {
        await multiBotScheduler.stopProfileSchedule(profile.id, userId);
      }
      
      success(`Perfil ${newStatus === 'active' ? 'ativado' : 'pausado'}!`);
      loadProfiles();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      error('Erro ao alterar status', 'Tente novamente.');
    }
  };

  const handleCreatePostNow = async (profile: BotProfile) => {
    try {
      await AIBotProfilesService.createPostForProfile(profile);
      success(`Post criado para ${profile.name}!`);
      loadProfiles();
    } catch (err) {
      console.error('Erro ao criar post:', err);
      error('Erro ao criar post', 'Tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-500 mt-2">Carregando perfis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfis de Bot</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie múltiplos perfis de IA com estilos únicos</p>
        </div>
        <button
          onClick={handleCreateProfile}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Perfil</span>
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Perfis</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profiles.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Perfis Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profiles.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profiles.reduce((sum, p) => sum + p.postsCount, 0)}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts Hoje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profiles.filter(p => {
                  const lastPost = p.lastPostTime;
                  if (!lastPost) return false;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return lastPost >= today;
                }).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Perfis Cadastrados</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {profiles.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum perfil cadastrado</p>
              <button
                onClick={handleCreateProfile}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Criar Primeiro Perfil
              </button>
            </div>
          ) : (
            profiles.map((profile) => {
              const scheduleStatus = schedulesStatus.get(profile.id);
              const isScheduled = scheduleStatus?.isActive || false;

              return (
                <div key={profile.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {}
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = AIBotProfilesService.generateAvatar(profile.name, profile.course);
                        }}
                      />

                      {}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{profile.handle}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(profile.status)}`}>
                            {profile.status === 'active' ? 'Ativo' : profile.status === 'paused' ? 'Pausado' : 'Rascunho'}
                          </span>
                          {isScheduled && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                              Agendado
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {profile.course} - {profile.period}° período • {profile.university}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">{profile.bio}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">
                            {profile.personality}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                            {profile.writingStyle}
                          </span>
                          {profile.interests.slice(0, 3).map((interest, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {interest}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{profile.postsCount} posts</span>
                          </div>
                          {profile.postingFrequency.enabled && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>A cada {profile.postingFrequency.intervalMinutes} min</span>
                            </div>
                          )}
                          {scheduleStatus?.lastPostTime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Último: {scheduleStatus.lastPostTime.toLocaleString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleCreatePostNow(profile)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Criar post agora"
                      >
                        <Zap className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(profile)}
                        className={`p-2 rounded-lg transition-colors ${
                          profile.status === 'active'
                            ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900'
                            : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900'
                        }`}
                        title={profile.status === 'active' ? 'Pausar' : 'Ativar'}
                      >
                        {profile.status === 'active' ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditProfile(profile)}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {}
      <BotProfileModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveProfile}
        profile={editingProfile}
      />
    </div>
  );
};

export default BotProfilesManager;
