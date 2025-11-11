import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniDateToast } from '../UI/Toast';
import { Comment, CommentsService } from '../../services/commentsService';

interface PostCommentsProps {
  postId: string;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
}

const PostComments: React.FC<PostCommentsProps> = ({
  postId,
  comments: initialComments,
  isOpen,
  onClose,
  onAddComment,
  onLikeComment
}) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [unsubscribeComments, setUnsubscribeComments] = useState<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar com initialComments quando mudarem
  useEffect(() => {
    if (initialComments.length > 0 && !loading) {
      setComments(prev => {
        // Mesclar comentários existentes com novos, evitando duplicatas
        const existingIds = new Set(prev.map(c => c.id));
        const newComments = initialComments.filter(c => !existingIds.has(c.id));
        return [...prev, ...newComments];
      });
    }
  }, [initialComments.length]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      console.log('🔄 [POSTCOMMENTS] Carregando todos os comentários para post:', postId);
      
      // Não limpar comentários existentes enquanto carrega
      // Manter os comentários iniciais visíveis
      
      const unsubscribe = CommentsService.loadPostComments(
        postId,
        (loadedComments) => {
          console.log('📱 [POSTCOMMENTS] Todos os comentários carregados:', loadedComments.length);
          setComments(loadedComments);
          setLoading(false);
        },
        (error) => {
          console.error('❌ [POSTCOMMENTS] Erro ao carregar comentários:', error);
          setLoading(false);
          // Manter comentários existentes em caso de erro
        }
      );
      
      setUnsubscribeComments(() => unsubscribe);

      return () => {
        unsubscribe();
      };
    } else if (!isOpen) {
      // Limpar listener quando fechar
      if (unsubscribeComments) {
        console.log('🔄 [POSTCOMMENTS] Fechando comentários, parando listener...');
        unsubscribeComments();
        setUnsubscribeComments(null);
      }
    }
  }, [isOpen, postId]); // Removido unsubscribeComments das dependências para evitar loops

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser || sending) return;

    const commentContent = newComment.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - adicionar comentário localmente imediatamente
    const optimisticComment: Comment = {
      id: tempId,
      postId,
      userId: currentUser.uid,
      userName: currentUser.displayName || 'Você',
      userAvatar: currentUser.photoURL || '/api/placeholder/40/40',
      content: commentContent,
      timestamp: new Date() as any, // Timestamp temporário
      likes: 0,
      likedBy: [],
      edited: false
    };

    // Adicionar comentário otimisticamente
    setComments(prev => [...prev, optimisticComment]);
    setNewComment('');
    setSending(true);

    try {
      console.log('🔄 [POSTCOMMENTS] Enviando comentário...', { postId, content: commentContent });
      await onAddComment(postId, commentContent);
      console.log('✅ [POSTCOMMENTS] Comentário enviado com sucesso');
      
      // Aguardar um pouco para o listener atualizar
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Remover comentário temporário (o listener já deve ter atualizado com o real)
      setComments(prev => prev.filter(c => c.id !== tempId));
      
      showSuccess('Comentário adicionado! 💬');
    } catch (error: any) {
      console.error('❌ [POSTCOMMENTS] Erro ao adicionar comentário:', error);
      console.error('❌ [POSTCOMMENTS] Detalhes:', error.message);
      
      // Reverter optimistic update em caso de erro
      setComments(prev => prev.filter(c => c.id !== tempId));
      setNewComment(commentContent); // Restaurar texto do comentário
      
      const errorMessage = error.message || 'Ops! Não conseguimos adicionar seu comentário. Tente novamente.';
      showError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    let date: Date;
    
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Carregando comentários...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="px-4 py-2 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {comment.userName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>

                  <div className="flex items-center space-x-4 mt-1 ml-3">
                    <button
                      onClick={() => onLikeComment(comment.id)}
                      className={`flex items-center space-x-1 text-xs transition-colors ${
                        comment.likedBy?.includes(currentUser?.uid || '')
                          ? 'text-red-500'
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${comment.likedBy?.includes(currentUser?.uid || '') ? 'fill-current' : ''}`} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {currentUser?.displayName?.charAt(0) || 'U'}
            </span>
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 pr-12"
              disabled={sending}
              />
            </div>

          <button
            type="submit"
            disabled={!newComment.trim() || sending}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostComments;
