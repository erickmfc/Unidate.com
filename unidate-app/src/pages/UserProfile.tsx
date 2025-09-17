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
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<RealUserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
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
      
      if (!profile) {
        console.log('❌ Usuário não encontrado');
        console.log('🔍 Executando debug para listar todos os usuários...');
        
        // Executar debug para ver o que está no Firebase
        await UserProfileService.debugListAllUsers();
        
        setUserProfile(null);
        return;
      }

      // Buscar posts do usuário
      const posts = await UserProfileService.getUserPosts(userId || '');
      
      setUserProfile(profile);
      setUserPosts(posts);
      
      console.log('✅ Perfil e posts carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar perfil do usuário:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // TODO: Implementar envio de mensagem
    console.log('Enviar mensagem para:', userProfile?.name);
  };

  const handleAddFriend = () => {
    // TODO: Implementar adição de colega universitário
    console.log('Adicionar colega universitário:', userProfile?.name);
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuário não encontrado</h2>
            <p className="text-gray-600 mb-4">O usuário que você está procurando não existe ou não tem perfil público.</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/feed')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mr-2"
              >
                Voltar ao Feed
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors mr-2"
              >
                Tentar Novamente
              </button>
              <button
                onClick={async () => {
                  console.log('🔍 Executando debug manual...');
                  await UserProfileService.debugListAllUsers();
                }}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Debug Firebase
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
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

          {/* Profile Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
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

              {/* Stats */}
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

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar Mensagem</span>
              </button>
              
              {!userProfile.isFriend && (
                <button
                  onClick={handleAddFriend}
                  className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Adicionar Colega</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Posts */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
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

            {/* Friends */}
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
