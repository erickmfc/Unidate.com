import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Send,
  Plus
} from 'lucide-react';
import { GroupPostsService, GroupPost } from '../../services/groupPostsService';
import { useAuth } from '../../contexts/AuthContext';
import { useUniDateToast } from '../UI/Toast';

interface GroupFeedProps {
  groupId: string;
  isMember: boolean;
}

const GroupFeed: React.FC<GroupFeedProps> = ({ groupId, isMember }) => {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showComposer, setShowComposer] = useState(false);

  const handleProfileClick = (userId: string) => {
    console.log('🔍 Navegando para perfil do usuário:', userId);
    if (!userId) {
      console.error('❌ userId está vazio!');
      return;
    }
    navigate(`/profile/${userId}`);
  };

  const loadPosts = useCallback(async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      const groupPosts = await GroupPostsService.getGroupPosts(groupId, 20);
      setPosts(groupPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      showError('Erro ao carregar posts do grupo');
    } finally {
      setLoading(false);
    }
  }, [groupId, showError]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!currentUser || !newPost.trim()) return;

    try {
      await GroupPostsService.createPost(groupId, {
        author: {
          uid: currentUser.uid,
          name: userProfile?.displayName || currentUser.displayName || 'Usuário',
          avatar: userProfile?.photoURL || currentUser.photoURL || undefined,
          course: userProfile?.course
        },
        content: newPost,
        type: 'text'
      });

      setNewPost('');
      setShowComposer(false);
      showSuccess('Post criado com sucesso!');
      await loadPosts();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      showError('Erro ao criar post');
    }
  };

  const handleToggleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUser) return;

    try {
      await GroupPostsService.toggleLike(postId, currentUser.uid, !isLiked);
      await loadPosts();
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Composer */}
      {isMember && (
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3),0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-purple-500/20">
          {!showComposer ? (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-800/30 rounded-2xl hover:bg-purple-800/40 transition-all duration-200 shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] border border-purple-500/20"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className="text-purple-200">O que você está pensando?</span>
            </button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Compartilhe algo com o grupo..."
                className="w-full px-4 py-3 bg-purple-800/30 rounded-2xl text-white placeholder-purple-300 border border-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)]"
                rows={4}
              />
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowComposer(false);
                    setNewPost('');
                  }}
                  className="px-4 py-2 text-purple-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-[0_4px_15px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Publicar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl p-12 text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border border-purple-500/20">
            <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-purple-200 mb-2">Nenhum post ainda</h3>
            <p className="text-purple-300/70">
              {isMember 
                ? 'Seja o primeiro a compartilhar algo com o grupo!'
                : 'Faça parte do grupo para ver os posts.'
              }
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false;
            
            return (
              <div
                key={post.id}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3),0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200"
              >
                {/* Post Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <button
                    onClick={() => handleProfileClick(post.author.uid)}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-105 transition-transform cursor-pointer"
                  >
                    {post.author.avatar ? (
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleProfileClick(post.author.uid)}
                      className="text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white">{post.author.name}</h4>
                        {post.author.course && (
                          <span className="text-purple-300 text-sm">• {post.author.course}</span>
                        )}
                      </div>
                    </button>
                    <p className="text-purple-300/70 text-sm">{formatDate(post.createdAt)}</p>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-purple-800/30 transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-purple-300" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.image && (
                    <div className="mt-4 rounded-2xl overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="Post image"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  {post.pollData && (
                    <div className="mt-4 space-y-2">
                      <p className="font-semibold text-white mb-3">{post.pollData.question}</p>
                      {post.pollData.options.map((option, index) => {
                        const votes = Object.values(post.pollData!.votes || {}).filter(v => v === index).length;
                        const totalVotes = Object.keys(post.pollData!.votes || {}).length;
                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                        
                        return (
                          <div key={index} className="relative">
                            <div className="bg-purple-800/30 rounded-xl p-3 border border-purple-500/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-purple-200">{option}</span>
                                <span className="text-purple-300 text-sm">{percentage.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-800/30 text-purple-300 rounded-full text-sm border border-purple-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-4 border-t border-purple-500/20">
                  <button
                    onClick={() => handleToggleLike(post.id, isLiked)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isLiked
                        ? 'bg-purple-800/40 text-pink-400'
                        : 'hover:bg-purple-800/30 text-purple-300'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-purple-800/30 text-purple-300 transition-all duration-200">
                    <MessageSquare className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-purple-800/30 text-purple-300 transition-all duration-200">
                    <Share2 className="h-5 w-5" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GroupFeed;

