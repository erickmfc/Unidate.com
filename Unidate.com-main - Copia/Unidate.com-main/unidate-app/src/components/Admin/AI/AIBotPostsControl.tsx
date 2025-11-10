import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  Clock, 
  Settings, 
  MessageSquare,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
  RefreshCw,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  History
} from 'lucide-react';
import { botScheduler } from '../../../services/botSchedulerService';
import { AIBotService } from '../../../services/aiBotService';
import { PostsService, Post } from '../../../services/postsService';
import { useUniDateToast } from '../../UI/Toast';
import { Timestamp } from 'firebase/firestore';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { botPersistenceService } from '../../../services/botPersistenceService';

interface BotPost {
  id: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  status: 'success' | 'error';
}

const AIBotPostsControl: React.FC = () => {
  const { showSuccess, showError, showInfo } = useUniDateToast();
  const { adminSession } = useAdminAuth();
  const [isActive, setIsActive] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [lastPostTime, setLastPostTime] = useState<Date | null>(null);
  const [nextPostTime, setNextPostTime] = useState<Date | null>(null);
  const [recentPosts, setRecentPosts] = useState<BotPost[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    postsToday: 0,
    postsThisWeek: 0,
    averageLikes: 0,
    averageComments: 0
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [testPostContent, setTestPostContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('N/A');
  const [loading, setLoading] = useState(true);

  // ETAPA 1: Carregar configuração do Firestore ao montar
  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        setLoading(true);
        console.log('🔄 [AIBotPostsControl] Carregando configuração inicial...');
        
        // Carregar configuração do Firestore
        const config = await botPersistenceService.loadScheduleConfig();
        const botProfileId = 'unidate-ai-bot';
        
        if (config && config.isActive) {
          const botProfile = config.profiles.find(p => p.profileId === botProfileId);
          
          if (botProfile) {
            console.log('✅ [AIBotPostsControl] Configuração encontrada:', botProfile);
            
            // Restaurar estados com valores salvos
            setIsActive(true);
            setIntervalMinutes(botProfile.intervalMinutes);
            setLastPostTime(botProfile.lastPostTime);
            
            // Calcular próximo post baseado em lastPostTime ou nextPostTime
            if (botProfile.nextPostTime) {
              setNextPostTime(botProfile.nextPostTime);
            } else if (botProfile.lastPostTime) {
              const next = new Date(botProfile.lastPostTime.getTime() + botProfile.intervalMinutes * 60 * 1000);
              setNextPostTime(next);
            } else {
              // Se não há lastPostTime, próximo post será em intervalMinutes
              const next = new Date(Date.now() + botProfile.intervalMinutes * 60 * 1000);
              setNextPostTime(next);
            }
            
            // Garantir que o bot está rodando
            if (!botScheduler.getScheduleStatus().isActive) {
              console.log('🔄 [AIBotPostsControl] Reiniciando bot...');
              await botScheduler.startSchedule(botProfile.intervalMinutes, 'system');
            }
          }
        } else {
          console.log('ℹ️ [AIBotPostsControl] Nenhuma configuração ativa encontrada');
        }
        
        // Carregar status atual do bot
        loadBotStatus();
        
        // Carregar dados
        await Promise.all([
          loadRecentPosts(),
          loadStats()
        ]);
        
      } catch (error) {
        console.error('❌ [AIBotPostsControl] Erro ao carregar configuração inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialConfig();
  }, []);

  // ETAPA 5: Observador do Firestore para mudanças em tempo real
  useEffect(() => {
    console.log('🔄 [AIBotPostsControl] Configurando observador do Firestore...');
    
    const unsubscribe = botPersistenceService.watchScheduleConfig((config) => {
      if (config) {
        console.log('📡 [AIBotPostsControl] Configuração atualizada:', config);
        const botProfileId = 'unidate-ai-bot';
        const botProfile = config.profiles.find(p => p.profileId === botProfileId);
        
        if (botProfile) {
          // Atualizar estados quando houver mudanças
          setIsActive(config.isActive && botProfile.intervalMinutes > 0);
          setIntervalMinutes(botProfile.intervalMinutes);
          setLastPostTime(botProfile.lastPostTime);
          
          if (botProfile.nextPostTime) {
            setNextPostTime(botProfile.nextPostTime);
          } else if (botProfile.lastPostTime) {
            const next = new Date(botProfile.lastPostTime.getTime() + botProfile.intervalMinutes * 60 * 1000);
            setNextPostTime(next);
          }
        } else if (!config.isActive) {
          setIsActive(false);
          setNextPostTime(null);
        }
      } else {
        console.log('ℹ️ [AIBotPostsControl] Nenhuma configuração encontrada');
        setIsActive(false);
        setNextPostTime(null);
      }
    });

    return () => {
      console.log('🔄 [AIBotPostsControl] Removendo observador do Firestore');
      unsubscribe();
    };
  }, []);

  // Atualizar status a cada 5 segundos (backup)
  useEffect(() => {
    const statusInterval = setInterval(() => {
      loadBotStatus();
      updateNextPostTime();
    }, 5000);

    return () => clearInterval(statusInterval);
  }, [isActive, lastPostTime, intervalMinutes]);

  // ETAPA 4: Contador regressivo em tempo real (atualiza a cada segundo)
  useEffect(() => {
    const updateCountdown = () => {
      if (nextPostTime) {
        const now = new Date();
        const diff = nextPostTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeUntilNext('Agora');
          // Se passou do horário, recalcular baseado no intervalo
          if (isActive && lastPostTime) {
            const newNext = new Date(lastPostTime.getTime() + intervalMinutes * 60 * 1000);
            setNextPostTime(newNext);
          }
        } else {
          setTimeUntilNext(formatTimeUntil(nextPostTime));
        }
      } else {
        setTimeUntilNext('N/A');
      }
    };

    // Atualizar imediatamente
    updateCountdown();

    // Atualizar a cada segundo
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => clearInterval(countdownInterval);
  }, [nextPostTime, isActive, lastPostTime, intervalMinutes]);

  const loadBotStatus = () => {
    const status = botScheduler.getScheduleStatus();
    setIsActive(status.isActive);
    setIntervalMinutes(status.intervalMinutes);
    setLastPostTime(status.lastPostTime);
    updateNextPostTime();
  };

  const updateNextPostTime = () => {
    if (isActive && lastPostTime) {
      const next = new Date(lastPostTime.getTime() + intervalMinutes * 60 * 1000);
      setNextPostTime(next);
    } else if (isActive && !lastPostTime) {
      // Se está ativo mas não há lastPostTime, próximo será em intervalMinutes
      const next = new Date(Date.now() + intervalMinutes * 60 * 1000);
      setNextPostTime(next);
    } else {
      setNextPostTime(null);
    }
  };

  const loadRecentPosts = async () => {
    try {
      // Buscar posts do bot
      const botProfile = AIBotService.getBotProfile();
      const allPosts = await PostsService.getPosts(50);
      
      const botPosts = allPosts
        .filter(post => post.author.uid === botProfile.uid)
        .slice(0, 10)
        .map(post => {
          // Converter timestamp do Firestore para Date
          let timestamp: Date;
          if (post.timestamp instanceof Timestamp) {
            timestamp = post.timestamp.toDate();
          } else if (post.timestamp && typeof post.timestamp === 'object' && 'toDate' in post.timestamp) {
            timestamp = (post.timestamp as any).toDate();
          } else {
            // Fallback para data atual se não conseguir converter
            timestamp = new Date();
          }

          return {
            id: post.id,
            content: post.content,
            timestamp,
            likes: post.likes || 0,
            comments: post.comments || 0,
            status: 'success' as const
          };
        });

      setRecentPosts(botPosts);
    } catch (err) {
      console.error('Erro ao carregar posts recentes:', err);
    }
  };

  // ETAPA 4 (continuação): Carregar estatísticas periodicamente
  useEffect(() => {
    // Carregar estatísticas a cada 30 segundos
    const statsInterval = setInterval(() => {
      loadStats();
      loadRecentPosts();
    }, 30000);

    return () => clearInterval(statsInterval);
  }, []);

  const loadStats = async () => {
    try {
      const botProfile = AIBotService.getBotProfile();
      const allPosts = await PostsService.getPosts(1000);
      
      const botPosts = allPosts.filter(post => post.author.uid === botProfile.uid);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const postsToday = botPosts.filter(post => {
        let postDate: Date;
        try {
          if (post.timestamp instanceof Timestamp) {
            postDate = post.timestamp.toDate();
          } else if (post.timestamp && typeof post.timestamp === 'object' && 'toDate' in post.timestamp) {
            postDate = (post.timestamp as any).toDate();
          } else {
            return false;
          }
          return postDate >= today;
        } catch {
          return false;
        }
      });

      const postsThisWeek = botPosts.filter(post => {
        let postDate: Date;
        try {
          if (post.timestamp instanceof Timestamp) {
            postDate = post.timestamp.toDate();
          } else if (post.timestamp && typeof post.timestamp === 'object' && 'toDate' in post.timestamp) {
            postDate = (post.timestamp as any).toDate();
          } else {
            return false;
          }
          return postDate >= weekAgo;
        } catch {
          return false;
        }
      });

      const totalLikes = botPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalComments = botPosts.reduce((sum, post) => sum + (post.comments || 0), 0);

      setStats({
        totalPosts: botPosts.length,
        postsToday: postsToday.length,
        postsThisWeek: postsThisWeek.length,
        averageLikes: botPosts.length > 0 ? Math.round(totalLikes / botPosts.length) : 0,
        averageComments: botPosts.length > 0 ? Math.round(totalComments / botPosts.length) : 0
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleStart = async () => {
    if (intervalMinutes < 1) {
      showError('O intervalo deve ser de pelo menos 1 minuto');
      return;
    }

    const userId = adminSession?.user?.uid || 'system';
    await botScheduler.startSchedule(intervalMinutes, userId);
    setIsActive(true);
    updateNextPostTime();
    showSuccess(`Bot iniciado! Posts a cada ${intervalMinutes} minutos`);
    loadBotStatus();
  };

  const handleStop = async () => {
    const userId = adminSession?.user?.uid || 'system';
    await botScheduler.stopSchedule(userId);
    setIsActive(false);
    setNextPostTime(null);
    showSuccess('Bot parado');
    loadBotStatus();
  };

  const handleIntervalChange = async (value: number) => {
    if (value < 1) {
      showError('O intervalo deve ser de pelo menos 1 minuto');
      return;
    }
    
    setIntervalMinutes(value);
    if (isActive) {
      const userId = adminSession?.user?.uid || 'system';
      await botScheduler.updateInterval(value, userId);
      updateNextPostTime();
      showSuccess(`Intervalo atualizado para ${value} minutos`);
    }
  };

  const handleCreatePostNow = async () => {
    setIsCreatingPost(true);
    try {
      console.log('🔄 [AIBotPostsControl] Iniciando criação de post...');
      
      // Validação: verificar se há conteúdo para publicar
      const contentToPublish = previewContent || testPostContent;
      if (!contentToPublish || contentToPublish.trim().length === 0) {
        showError('Nenhum conteúdo para publicar. Gere um post primeiro.');
        setIsCreatingPost(false);
        return;
      }
      
      // AUTENTICAR ADMIN ANTES DE CRIAR POST
      // Garantir que o admin está autenticado no Firebase Auth
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../../../firebase/config');
      
      if (auth && !auth.currentUser) {
        try {
          const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@unidate.com';
          const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          console.log('✅ [AIBotPostsControl] Admin autenticado para criar post');
        } catch (authError) {
          console.warn('⚠️ [AIBotPostsControl] Erro ao autenticar admin:', authError);
          // Continuar mesmo assim - pode funcionar se as regras permitirem
        }
      }
      
      // Se estiver usando preview, usar o conteúdo do preview
      let postId: string;
      if (previewContent) {
        // Criar post com conteúdo do preview
        const { PostsService } = await import('../../../services/postsService');
        const botProfile = AIBotService.getBotProfile();
        postId = await PostsService.createPost({
          author: {
            uid: botProfile.uid,
            name: botProfile.name,
            avatar: botProfile.avatar,
            course: botProfile.course,
            university: botProfile.university
          },
          content: previewContent,
          type: 'text' as const,
          likes: 0,
          comments: 0,
          isLiked: false,
          hashtags: (previewContent.match(/#\w+/g) || []).map(tag => tag.substring(1))
        });
      } else {
        // Usar método padrão
        postId = await AIBotService.createAIPost();
      }
      
      // Validação: verificar se o post foi criado
      if (!postId || postId.trim().length === 0) {
        throw new Error('Post não foi criado: postId vazio ou inválido');
      }
      
      console.log('✅ [AIBotPostsControl] Post criado:', postId);
      showSuccess('Post criado com sucesso!');
      
      // Atualizar timestamps
      const now = new Date();
      setLastPostTime(now);
      const nextTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
      setNextPostTime(nextTime);
      
      // Limpar preview e teste
      setPreviewContent('');
      setTestPostContent('');
      setShowPreview(false);
      
      // Aguardar um pouco antes de recarregar para garantir que o post foi salvo
      setTimeout(() => {
        loadRecentPosts();
        loadStats();
        loadBotStatus();
      }, 1000);
    } catch (err: any) {
      console.error('❌ [AIBotPostsControl] Erro ao criar post:', err);
      const errorMessage = err?.message || 'Erro desconhecido ao criar post';
      showError(`Erro ao criar post: ${errorMessage}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleTestGeneration = async () => {
    setIsCreatingPost(true);
    try {
      const content = await AIBotService.generateAIPost();
      setTestPostContent(content);
      setPreviewContent(content);
      setShowPreview(true);
      showInfo('Post de teste gerado! Revise o preview antes de publicar.');
    } catch (err) {
      console.error('Erro ao gerar teste:', err);
      showError('Erro ao gerar post de teste.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handlePublishPreview = async () => {
    if (!previewContent && !testPostContent) {
      showError('Nenhum conteúdo para publicar.');
      return;
    }
    await handleCreatePostNow();
  };

  const handleRegeneratePreview = async () => {
    await handleTestGeneration();
  };

  const formatTimeUntil = (date: Date | null): string => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Agora';
    
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Mostrar loading durante carregamento inicial
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configuração do bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bot de Posts Automáticos</h2>
              <p className="text-sm text-gray-500">Gerencie posts automáticos no estilo Twitter</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-2 rounded-lg font-medium ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        {/* Controles Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Status e Controle */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status do Bot
              </label>
              {!isActive ? (
                <button
                  onClick={handleStart}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>Iniciar Bot</span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  <Pause className="h-5 w-5" />
                  <span>Parar Bot</span>
                </button>
              )}
            </div>

            {/* Criar Post Agora */}
            <button
              onClick={handleCreatePostNow}
              disabled={isCreatingPost}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingPost ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Criar Post Agora</span>
                </>
              )}
            </button>
          </div>

          {/* Intervalo */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo entre Posts (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={intervalMinutes}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="mt-2 text-sm text-gray-500">
                {intervalMinutes < 60
                  ? `${intervalMinutes} minuto${intervalMinutes > 1 ? 's' : ''}`
                  : intervalMinutes < 1440
                  ? `${Math.floor(intervalMinutes / 60)} hora${Math.floor(intervalMinutes / 60) > 1 ? 's' : ''}`
                  : `${Math.floor(intervalMinutes / 1440)} dia${Math.floor(intervalMinutes / 1440) > 1 ? 's' : ''}`
                }
              </div>
            </div>
          </div>

          {/* Próximo Post */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próximo Post
              </label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {timeUntilNext}
                  </span>
                </div>
                {nextPostTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {nextPostTime.toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
              {lastPostTime && (
                <p className="text-xs text-gray-500 mt-2">
                  Último post: {lastPostTime.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview e Teste de Geração */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preview e Teste de Geração</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTestGeneration}
                disabled={isCreatingPost}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {isCreatingPost ? 'Gerando...' : 'Gerar Post de Teste'}
              </button>
              {showPreview && previewContent && (
                <>
                  <button
                    onClick={handleRegeneratePreview}
                    disabled={isCreatingPost}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                  >
                    Regenerar
                  </button>
                  <button
                    onClick={handlePublishPreview}
                    disabled={isCreatingPost}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Publicar Post
                  </button>
                </>
              )}
            </div>
            
            {showPreview && previewContent && (
              <div className="bg-white rounded-lg border-2 border-purple-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">Preview do Post</h4>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewContent('');
                      setTestPostContent('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-gray-900">UniDate AI</span>
                        <span className="text-gray-500 text-sm">@unidateai</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{previewContent}</p>
                      {(previewContent.match(/#\w+/g) || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(previewContent.match(/#\w+/g) || []).map((tag, idx) => (
                            <span key={idx} className="text-xs text-purple-600 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end space-x-2 text-xs text-gray-500">
                  <span>Revise o conteúdo antes de publicar</span>
                </div>
              </div>
            )}
            
            {testPostContent && !showPreview && (
              <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{testPostContent}</p>
                <button
                  onClick={() => {
                    setTestPostContent('');
                    setPreviewContent('');
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Posts Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.postsToday}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900">{stats.postsThisWeek}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média de Likes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageLikes}</p>
            </div>
            <Activity className="h-8 w-8 text-pink-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média de Comentários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageComments}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Posts Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Posts Recentes</h3>
            <button
              onClick={() => {
                loadRecentPosts();
                loadStats();
              }}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentPosts.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum post ainda</p>
            </div>
          ) : (
            recentPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.timestamp.toLocaleString('pt-BR')}</span>
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {post.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-2">Como funciona:</p>
            <ul className="space-y-1 text-xs">
              <li>• O bot gera posts automáticos usando IA (Gemini API)</li>
              <li>• Posts são no estilo Twitter, sobre vida universitária</li>
              <li>• O intervalo define com que frequência os posts são criados</li>
              <li>• Posts aparecem no feed como posts normais</li>
              <li>• Você pode criar posts manualmente a qualquer momento</li>
              <li>• Use "Teste de Geração" para ver como ficará um post antes de publicar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBotPostsControl;

