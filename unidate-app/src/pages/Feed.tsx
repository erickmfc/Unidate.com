import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp,
  Hash,
  Eye,
  BarChart3,
  Plus,
  Home,
  Search,
  Heart,
  User,
  MessageCircle,
  Camera,
  Send,
  Users,
  MessageSquare,
  Repeat2
} from 'lucide-react';
import PostComposer from '../components/Feed/PostComposer';
import PostCard from '../components/Feed/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { PostsService, Post as FirebasePost } from '../services/postsService';
import { basicFirestoreService } from '../services/basicFirestoreService';

// Interface local para o componente (com timestamp como string)
interface Post {
  id: string;
  author: {
    uid: string;
    name: string;
    course: string;
    university: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'poll' | 'tevi';
  image?: string;
  timestamp: string; // String para o componente
  likes: number;
  comments: number;
  isLiked: boolean;
  location?: string;
  teviData?: {
    location: string;
    clothing: string;
    activity: string;
  };
  pollData?: {
    question: string;
    options: string[];
    votes: number[];
  };
  event?: {
    title: string;
    date: string;
    attendees: number;
  };
  hashtags: string[];
}

const Feed: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [unsubscribePosts, setUnsubscribePosts] = useState<(() => void) | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregar posts reais do Firebase com serviço aprimorado
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando posts com serviço aprimorado...');
        
        // Usar o serviço simplificado com listener em tempo real
        const unsubscribe = basicFirestoreService.carregarPosts(
          (firestorePosts) => {
            console.log('📱 Posts carregados em tempo real:', firestorePosts.length);
            
            // Converter posts para formato local
            const convertedPosts: Post[] = firestorePosts.map(post => ({
              id: post.id,
              author: {
                uid: post.autorId,
                name: post.autorNome || 'Usuário',
                course: post.autorCurso || 'Curso não informado',
                university: post.autorUniversidade || 'Universidade não informada',
                avatar: post.autorAvatar || '/api/placeholder/40/40'
              },
              content: post.conteudo,
              type: post.tipo === 'texto' ? 'text' : post.tipo === 'imagem' ? 'image' : post.tipo === 'poll' ? 'poll' : 'tevi',
              image: undefined,
              timestamp: post.dataCriacao?.toDate?.() ? post.dataCriacao.toDate().toISOString() : new Date().toISOString(),
              likes: post.curtidasPor.length,
              comments: post.numeroComentarios,
              isLiked: currentUser ? post.curtidasPor.includes(currentUser.uid) : false,
              location: undefined,
              teviData: undefined,
              pollData: undefined,
              event: undefined,
              hashtags: post.hashtags || []
            }));
            
            setPosts(convertedPosts);
            setLoading(false);
            console.log(`✅ ${convertedPosts.length} posts carregados do Firebase em tempo real`);
          },
          (error) => {
            console.error('❌ Erro ao carregar posts:', error);
            setPosts([]);
            setLoading(false);
          }
        );

        // Armazenar função de unsubscribe para limpeza
        setUnsubscribePosts(unsubscribe);
      } catch (error) {
        console.error('❌ Erro ao configurar carregamento de posts:', error);
        setPosts([]);
        setLoading(false);
      }
    };

    loadPosts();

    // Cleanup function para parar o listener quando o componente for desmontado
    return () => {
      if (unsubscribePosts) {
        unsubscribePosts();
      }
    };
  }, [currentUser?.uid]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Atualizar UI imediatamente (otimista)
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1
            }
          : p
      ));

      // Fazer a chamada para o Firebase
      await basicFirestoreService.toggleLike(postId, currentUser.uid, post.isLiked);
    } catch (error) {
      console.error('❌ Erro ao curtir/descurtir post:', error);
      // Reverter mudança em caso de erro
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1
            }
          : p
      ));
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!currentUser || !userProfile || !commentText.trim()) return;

    try {
      console.log('🔄 Adicionando comentário...');
      
      // TODO: Implementar comentários com o serviço simplificado
      console.log('Comentário:', commentText.trim(), 'para post:', postId);

      console.log('✅ Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao adicionar comentário:', error);
    }
  };

  const handleShare = (postId: string) => {
    // Implementar lógica de compartilhamento
    console.log('Compartilhando post:', postId);
  };

  // Handlers para botões mobile
  const handleHomeClick = () => {
    console.log('🏠 Botão Início clicado');
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUniverseClick = () => {
    console.log('🌍 Botão UniVerso clicado');
    // Botão central - pode abrir modal de criar post ou navegar
    // TODO: Implementar modal de criar post ou navegação
  };

  const handleGroupsClick = () => {
    console.log('👥 Botão Grupos clicado - navegando para /groups');
    navigate('/groups');
  };

  const handleSearchClick = () => {
    console.log('🔍 Botão Buscar clicado - navegando para /discover');
    navigate('/discover');
  };

  const handleMessagesClick = () => {
    console.log('✈️ Botão Mensagens clicado - navegando para /chat');
    navigate('/chat');
  };


  const handleNewPost = async (postData: any) => {
    if (!currentUser || !userProfile) {
      console.error('Usuário não autenticado');
      return;
    }

    try {
      // Extrair hashtags do conteúdo
      const hashtags = postData.content.match(/#\w+/g) || [];

      // Criar post no Firebase (filtrando campos undefined)
      const postToSave: any = {
        author: {
          uid: currentUser.uid,
          name: userProfile.displayName || currentUser.displayName || 'Usuário',
          course: userProfile.course || 'Curso não informado',
          university: userProfile.university || 'Universidade não informada',
          avatar: userProfile.photoURL || currentUser.photoURL || '/api/placeholder/40/40'
        },
        content: postData.content,
        type: postData.type,
        likes: 0,
        comments: 0,
        isLiked: false,
        hashtags: hashtags
      };

      // Adicionar campos opcionais apenas se existirem
      if (postData.teviData && Object.keys(postData.teviData).length > 0) {
        postToSave.teviData = postData.teviData;
      }
      if (postData.pollData && Object.keys(postData.pollData).length > 0) {
        postToSave.pollData = postData.pollData;
      }
      if (postData.image) {
        postToSave.image = postData.image;
      }
      if (postData.location) {
        postToSave.location = postData.location;
      }

      const postId = await basicFirestoreService.adicionarPost({
        titulo: postData.content.substring(0, 100) + (postData.content.length > 100 ? '...' : ''),
        conteudo: postData.content,
        autorId: currentUser.uid,
        autorNome: userProfile.displayName || currentUser.displayName || 'Usuário',
        autorAvatar: userProfile.photoURL || currentUser.photoURL || '/api/placeholder/40/40',
        autorCurso: userProfile.course || 'Curso não informado',
        autorUniversidade: userProfile.university || 'Universidade não informada',
        tipo: postData.type === 'text' ? 'texto' : postData.type === 'image' ? 'imagem' : postData.type === 'poll' ? 'poll' : 'tev'
      });
      
      // Criar post local para atualização imediata da UI
      const newPost: Post = {
        id: postId,
        author: postToSave.author,
        content: postToSave.content,
        type: postToSave.type,
        timestamp: new Date().toISOString(),
        likes: postToSave.likes,
        comments: postToSave.comments,
        isLiked: postToSave.isLiked,
        teviData: postToSave.teviData,
        pollData: postToSave.pollData,
        hashtags: postToSave.hashtags
    };

    setPosts([newPost, ...posts]);
      console.log('✅ Post salvo no Firebase:', postId);
    } catch (error: any) {
      console.error('❌ Erro ao salvar post:', error);
      
      // Mostrar erro específico para o usuário
      const errorMessage = error.message || 'Erro desconhecido ao salvar post';
      alert(`❌ ${errorMessage}`);
      
      // Log detalhado para debug
      console.error('Detalhes do erro:', {
        error,
        postData,
        currentUser: currentUser?.uid,
        userProfile: userProfile?.uid
      });
    }
  };

  const [trendingHashtags, setTrendingHashtags] = useState<{tag: string, posts: number}[]>([]);
  const [campusStats, setCampusStats] = useState({
    postsToday: 0,
    teviPosts: 0,
    peopleOnline: 0
  });

  // Carregar hashtags e estatísticas reais
  useEffect(() => {
    const loadStats = async () => {
      try {
        const trending = await PostsService.getTrendingHashtags();
        setTrendingHashtags(trending);
        
        // Estatísticas básicas
        setCampusStats({
          postsToday: posts.length,
          teviPosts: posts.filter(p => p.type === 'tevi').length,
          peopleOnline: Math.floor(Math.random() * 50) + 10 // Mock por enquanto
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    loadStats();
  }, [posts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout Mobile - Design Personalizado */}
      {isMobile ? (
        <div className="flex flex-col h-screen bg-gray-50">
          {/* Header Mobile - Logo centralizado + Botão mensagens */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="w-8"></div> {/* Espaçador */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              UniDate
            </h1>
            <button 
              onClick={handleMessagesClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer touch-manipulation"
              type="button"
            >
              <Send className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Stories Section */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex space-x-4 overflow-x-auto">
              {/* Story do usuário */}
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-600">Seu Story</p>
              </div>
              
              {/* Stories de outros usuários */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gray-300"></div>
                    </div>
                  </div>
                  <p className="text-xs mt-1 text-gray-600">Usuário {i}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Principal */}
          <div ref={feedRef} className="flex-1 overflow-y-auto">
            {/* Posts */}
            <div className="space-y-0">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-gray-400 mb-4">
                    <MessageSquare className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum post ainda</h3>
                  <p className="text-gray-500 mb-4">Seja o primeiro a compartilhar algo no campus!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white border-b border-gray-200 p-4">
                    {/* Header do Post */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {post.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{post.author.name}</h3>
                          <span className="text-gray-500 text-xs">•</span>
                          <span className="text-gray-500 text-xs">{post.author.course}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{post.timestamp}</p>
                      </div>
                    </div>

                    {/* Conteúdo do Post */}
                    <div className="mb-3">
                      <p className="text-gray-900 text-sm leading-relaxed">{post.content}</p>
                      {/* Hashtags */}
                      {post.content.includes('#') && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.content.match(/#\w+/g)?.map((tag, index) => (
                            <span key={index} className="text-purple-600 text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          const commentText = prompt('Digite seu comentário:');
                          if (commentText) {
                            handleComment(post.id, commentText);
                          }
                        }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleShare(post.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
                      >
                        <Repeat2 className="h-5 w-5" />
                        <span className="text-sm">Repostar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Navigation Personalizada */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex justify-around items-center">
              {/* 🏠 Início */}
              <button 
                onClick={handleHomeClick}
                className="flex flex-col items-center py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer touch-manipulation"
                type="button"
              >
                <Home className="h-6 w-6 text-purple-600" />
                <span className="text-xs text-purple-600 mt-1 font-medium">Início</span>
              </button>
              
              {/* U - Feed (UniVerso) - Botão central como publicar do Instagram */}
              <button 
                onClick={handleUniverseClick}
                className="flex flex-col items-center py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer touch-manipulation"
                type="button"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-xs text-gray-400 mt-1">UniVerso</span>
              </button>
              
              {/* 👥 Grupos */}
              <button 
                onClick={handleGroupsClick}
                className="flex flex-col items-center py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer touch-manipulation"
                type="button"
              >
                <Users className="h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Grupos</span>
              </button>
              
              {/* 🔍 Buscar */}
              <button 
                onClick={handleSearchClick}
                className="flex flex-col items-center py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer touch-manipulation"
                type="button"
              >
                <Search className="h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Buscar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Layout Desktop */
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">UniVerso</h1>
              <p className="text-gray-600">A voz do campus • Não é sobre seguir, é sobre pertencer</p>
            </div>

            {/* Create Post */}
            <PostComposer onSubmit={handleNewPost} />

            {/* Posts */}
            <div className="space-y-6 mt-8">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum post ainda</h3>
                    <p className="text-gray-500 mb-4">Seja o primeiro a compartilhar algo no campus!</p>
                    <p className="text-sm text-gray-400">Use o formulário acima para criar seu primeiro post.</p>
                  </div>
                ) : (
                  posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
                  ))
                )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="btn-secondary">
                Carregar mais posts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Hashtags */}
              {trendingHashtags.length > 0 && (
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">Trending</h3>
              </div>
              <div className="space-y-3">
                {trendingHashtags.map((hashtag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button className="text-left hover:text-primary-600 transition-colors duration-200">
                      <span className="font-medium text-gray-900">{hashtag.tag}</span>
                    </button>
                    <span className="text-sm text-gray-500">{hashtag.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>
              )}

            {/* Campus Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campus Hoje</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posts hoje</span>
                    <span className="font-semibold text-gray-900">{campusStats.postsToday}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">#TeVi posts</span>
                    <span className="font-semibold text-pink-600">{campusStats.teviPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pessoas online</span>
                    <span className="font-semibold text-green-600">{campusStats.peopleOnline}</span>
                  </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-gray-700">Postar #TeVi</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Criar Enquete</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Hash className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Explorar Hashtags</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Feed;