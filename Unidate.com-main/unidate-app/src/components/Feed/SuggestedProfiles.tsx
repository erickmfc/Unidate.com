import React, { useState, useEffect } from 'react';
import { UserPlus, Users, GraduationCap, X } from 'lucide-react';
import { UserProfileService, UserProfile } from '../../services/userProfileService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import UserAvatar from '../UI/UserAvatar';

interface SuggestedProfilesProps {
  maxProfiles?: number;
}

const SuggestedProfiles: React.FC<SuggestedProfilesProps> = ({ maxProfiles = 5 }) => {
  const { currentUser, userProfile } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [suggestedProfiles, setSuggestedProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentUser?.uid && userProfile) {
      loadSuggestedProfiles();
    }
  }, [currentUser?.uid, userProfile?.university, userProfile?.course]);

  const loadSuggestedProfiles = async () => {
    if (!currentUser?.uid || !userProfile) return;

    try {
      setLoading(true);
      
      // Buscar usuários reais do Firebase
      const allUsers = await UserProfileService.getAllUsers(200);
      
      console.log('📊 Total de usuários encontrados:', allUsers.length);
      console.log('👤 Perfil do usuário atual:', {
        university: userProfile.university,
        course: userProfile.course
      });
      
      // Filtrar: remover o próprio usuário
      const otherUsers = allUsers.filter(user => user.uid !== currentUser.uid);
      console.log('👥 Usuários após remover próprio:', otherUsers.length);
      
      // Verificar friendships em lote (mais eficiente)
      const usersWithFriendshipStatus = await Promise.all(
        otherUsers.map(async (user) => {
          const isAlreadyColleague = await UserProfileService.checkFriendship(
            currentUser.uid,
            user.uid
          );
          return { user, isAlreadyColleague };
        })
      );

      // Filtrar apenas os que não são colegas
      const notColleagues = usersWithFriendshipStatus
        .filter(({ isAlreadyColleague }) => !isAlreadyColleague)
        .map(({ user }) => user);
      
      console.log('✅ Usuários que não são colegas:', notColleagues.length);

      // Ordenar por relevância com pontuação mais detalhada
      const sorted = notColleagues
        .map(user => {
          let score = 0;
          
          // Priorizar mesma universidade (peso alto)
          if (user.university && userProfile.university && 
              user.university.toLowerCase() === userProfile.university.toLowerCase()) {
            score += 20;
          }
          
          // Priorizar mesmo curso (peso médio)
          if (user.course && userProfile.course && 
              user.course.toLowerCase() === userProfile.course.toLowerCase()) {
            score += 15;
          }
          
          // Priorizar usuários com perfil completo (tem avatar, bio, etc.)
          if (user.avatar) score += 3;
          if (user.bio && user.bio.length > 10) score += 2;
          
          // Priorizar usuários ativos (com posts)
          if (user.postsCount && user.postsCount > 0) score += user.postsCount;
          
          return { user, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(({ user }) => user);

      // Limitar quantidade e garantir que temos dados válidos
      const finalProfiles = sorted
        .filter(user => user.name && user.name !== 'Usuário')
        .slice(0, maxProfiles);
      
      console.log('🎯 Perfis sugeridos finais:', finalProfiles.length);
      setSuggestedProfiles(finalProfiles);
    } catch (err) {
      console.error('❌ Erro ao carregar perfis sugeridos:', err);
      setSuggestedProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsColleague = async (userId: string, userName: string) => {
    if (!currentUser?.uid) {
      error('Erro', 'Você precisa estar logado para adicionar colegas.');
      return;
    }

    if (currentUser.uid === userId) {
      error('Erro', 'Você não pode adicionar a si mesmo como colega.');
      return;
    }

    try {
      setAddingIds(prev => new Set(prev).add(userId));
      
      console.log('🔄 [SUGGESTED] Adicionando colega:', { currentUserId: currentUser.uid, targetUserId: userId });
      
      await UserProfileService.addFriend(currentUser.uid, userId);
      
      console.log('✅ [SUGGESTED] Colega adicionado com sucesso');
      success(`${userName} foi adicionado(a) como colega!`);
      
      // Remover da lista de sugeridos
      setSuggestedProfiles(prev => prev.filter(p => p.uid !== userId));
      
      // Recarregar lista
      await loadSuggestedProfiles();
    } catch (err: any) {
      console.error('❌ [SUGGESTED] Erro ao adicionar colega:', err);
      console.error('❌ [SUGGESTED] Detalhes do erro:', err.message);
      
      // Mostrar mensagem de erro mais específica
      const errorMessage = err.message || 'Tente novamente.';
      error('Erro ao adicionar colega', errorMessage);
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-gray-900">Colegas Sugeridos</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (suggestedProfiles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-gray-900">Colegas Sugeridos</h3>
        </div>
        <div className="text-center py-6">
          <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Nenhum perfil sugerido no momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-gray-900">Colegas Sugeridos</h3>
      </div>
      
      <div className="space-y-4">
        {suggestedProfiles.map((profile) => (
          <div
            key={profile.uid}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            {/* Avatar */}
            <button
              onClick={() => handleViewProfile(profile.uid)}
              className="flex-shrink-0"
            >
              <UserAvatar
                photoURL={profile.avatar}
                displayName={profile.name}
                size="md"
                showGraduationCap={true}
              />
            </button>

            {/* Informações */}
            <div className="flex-1 min-w-0">
              <button
                onClick={() => handleViewProfile(profile.uid)}
                className="block w-full text-left"
              >
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors">
                    {profile.name}
                  </h4>
                  {profile.university && userProfile?.university && 
                   profile.university.toLowerCase() === userProfile.university.toLowerCase() && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Mesma Universidade
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {profile.course || 'Curso não informado'}
                  {profile.course && userProfile?.course && 
                   profile.course.toLowerCase() === userProfile.course.toLowerCase() && (
                    <span className="ml-2 text-xs text-indigo-600 font-medium">• Mesmo curso</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.university || 'Universidade não informada'}
                </p>
                {profile.postsCount > 0 && (
                  <p className="text-xs text-indigo-500 mt-1 font-medium">
                    {profile.postsCount} {profile.postsCount === 1 ? 'post' : 'posts'}
                  </p>
                )}
              </button>

              {/* Botão Adicionar como Colega */}
              <button
                onClick={() => handleAddAsColleague(profile.uid, profile.name)}
                disabled={addingIds.has(profile.uid)}
                className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingIds.has(profile.uid) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adicionando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Adicionar como Colega</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Link para ver mais */}
      <button
        onClick={() => navigate('/discover')}
        className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
      >
        Ver mais perfis →
      </button>
    </div>
  );
};

export default SuggestedProfiles;

