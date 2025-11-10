import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Heart,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { UserProfileService, UserProfile as RealUserProfile, UserPost } from '../services/userProfileService';
import { ChatService } from '../services/chatService';
import { useUniDateToast } from '../components/UI/Toast';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  course: string;
  university: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  postsCount: number;
  friendsCount: number;
  isFriend: boolean;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile: currentUserProfile } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [userProfile, setUserProfile] = useState<RealUserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  useEffect(() => {
    console.log('🔄 UserProfile useEffect - userId:', userId);
    if (userId) {
      loadUserProfile();
    } else {
      console.error('❌ userId não encontrado na URL!');
      setLoading(false);
    }
  }, [userId]);

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Verificar se é o próprio perfil
      if (userId === currentUser?.uid) {
        setIsOwnProfile(true);
        navigate('/profile');
        return;
      }

      console.log('🔍 Carregando perfil real do usuário:', userId);

      // Buscar perfil real do usuário
      const profile = await UserProfileService.getUserProfile(userId || '');
      
      // O serviço agora sempre retorna um perfil (completo, básico ou mínimo)
      if (!profile) {
        console.error('❌ Erro crítico: getUserProfile retornou null mesmo após todas as tentativas');
        // Fallback final - criar perfil mínimo diretamente
        const minimalProfile: RealUserProfile = {
          uid: userId || '',
          name: 'Usuário',
          email: '',
          course: 'Curso não informado',
          university: 'Universidade não informada',
          bio: 'Usuário do UniDate',
          avatar: '',
          joinDate: new Date().toISOString().split('T')[0],
          postsCount: 0,
          friendsCount: 0,
          isFriend: false
        };
        setUserProfile(minimalProfile);
        setUserPosts([]);
        return;
      }

      // Buscar posts do usuário
      const posts = await UserProfileService.getUserPosts(userId || '');
      
      // Verificar se é amigo
      if (currentUser && profile) {
        const friendshipStatus = await UserProfileService.checkFriendship(currentUser.uid, userId || '');
        setIsFriend(friendshipStatus);
        // Atualizar perfil com status de amizade
        profile.isFriend = friendshipStatus;
      }
      
      // Garantir que sempre temos um perfil
      if (profile) {
        setUserProfile(profile);
        setUserPosts(posts);
        console.log('✅ Perfil e posts carregados com sucesso:', profile);
      } else {
        console.error('❌ Profile é null após getUserProfile, criando perfil mínimo');
        const fallbackProfile: RealUserProfile = {
          uid: userId || '',
          name: 'Usuário',
          email: '',
          course: 'Curso não informado',
          university: 'Universidade não informada',
          bio: 'Usuário do UniDate',
          avatar: '',
          joinDate: new Date().toISOString().split('T')[0],
          postsCount: 0,
          friendsCount: 0,
          isFriend: false
        };
        setUserProfile(fallbackProfile);
        setUserPosts([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil do usuário:', error);
      // Mesmo em caso de erro, criar perfil mínimo
      const errorProfile: RealUserProfile = {
        uid: userId || '',
        name: 'Usuário',
        email: '',
        course: 'Curso não informado',
        university: 'Universidade não informada',
        bio: 'Usuário do UniDate',
        avatar: '',
        joinDate: new Date().toISOString().split('T')[0],
        postsCount: 0,
        friendsCount: 0,
        isFriend: false
      };
      setUserProfile(errorProfile);
      setUserPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !userProfile) {
      showError('Erro ao enviar mensagem. Tente novamente.');
      return;
    }

    try {
      showSuccess('Criando conversa...');
      
      // Criar ou obter chat entre os dois usuários
      const chatId = await ChatService.getOrCreateChat(currentUser.uid, userProfile.uid);
      
      // Navegar para o chat
      navigate(`/chat`);
      // O chat será aberto automaticamente quando o componente detectar o chatId
      // Por enquanto, apenas navegar para a página de chat
      showSuccess('Conversa criada! 💬');
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      showError('Erro ao criar conversa. Tente novamente.');
    }
  };

  const handleAddFriend = async () => {
    if (!currentUser || !userProfile || isAddingFriend) {
      return;
    }

    try {
      setIsAddingFriend(true);
      
      await UserProfileService.addFriend(currentUser.uid, userProfile.uid);
      
      setIsFriend(true);
      if (userProfile) {
        setUserProfile({ ...userProfile, isFriend: true, friendsCount: userProfile.friendsCount + 1 });
      }
      
      showSuccess('Colega adicionado com sucesso! 👥');
    } catch (error) {
      console.error('Erro ao adicionar colega:', error);
      showError('Erro ao adicionar colega. Tente novamente.');
    } finally {
      setIsAddingFriend(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // O serviço sempre retorna um perfil (completo, básico ou mínimo)
  // Se por algum motivo userProfile ainda for null, criar um perfil mínimo e re-renderizar
  if (!userProfile) {
    console.error('⚠️ userProfile é null, criando perfil mínimo de emergência');
    const emergencyProfile: RealUserProfile = {
      uid: userId || '',
      name: 'Usuário',
      email: '',
      course: 'Curso não informado',
      university: 'Universidade não informada',
      bio: 'Usuário do UniDate',
      avatar: '',
      joinDate: new Date().toISOString().split('T')[0],
      postsCount: 0,
      friendsCount: 0,
      isFriend: false
    };
    setUserProfile(emergencyProfile);
    // Retornar loading para dar tempo do state atualizar
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/feed')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Perfil do Usuário</h1>
              <p className="text-gray-600">Conheça mais sobre {userProfile.name}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Erro ao carregar avatar:', userProfile.avatar);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{userProfile.name}</h2>
                {userProfile.name === 'Usuário' && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Perfil Básico
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <GraduationCap className="h-5 w-5" />
                <span>{userProfile.course}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <MapPin className="h-5 w-5" />
                <span>{userProfile.university}</span>
              </div>
              
              {userProfile.bio && (
                <p className="text-gray-700 mb-4">{userProfile.bio}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{userProfile.postsCount} posts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{userProfile.friendsCount} colegas universitários</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {new Date(userProfile.joinDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar Mensagem</span>
              </button>
              
              {!isFriend && !isOwnProfile && (
                <button
                  onClick={handleAddFriend}
                  disabled={isAddingFriend}
                  className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingFriend ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>Adicionar Colega</span>
                    </>
                  )}
                </button>
              )}
              {isFriend && (
                <div className="px-6 py-2 border border-green-600 text-green-600 rounded-lg bg-green-50 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Já são colegas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts Recentes</h3>
              {userPosts.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Este usuário ainda não fez nenhum post</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{post.titulo}</h4>
                        <span className="text-xs text-gray-500">
                          {post.dataCriacao ? new Date(post.dataCriacao.toDate()).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{post.conteudo}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.curtidasPor.length}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.numeroComentarios}</span>
                          </span>
                        </div>
                        {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Curso</p>
                  <p className="font-medium text-gray-900">{userProfile.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Universidade</p>
                  <p className="font-medium text-gray-900">{userProfile.university}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membro desde</p>
                  <p className="font-medium text-gray-900">
                    {new Date(userProfile.joinDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {userProfile.bio && (
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium text-gray-900">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colegas Universitários</h3>
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {userProfile.friendsCount > 0 
                    ? `${userProfile.friendsCount} colegas universitários` 
                    : 'Sistema de colegas em breve'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
