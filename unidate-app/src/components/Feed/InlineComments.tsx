import React, { useState, useRef } from 'react';
import { MessageCircle, Send, Heart, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniDateToast } from '../UI/Toast';
import { Comment } from '../../services/commentsService';
import { CommentsService } from '../../services/commentsService';

interface InlineCommentsProps {
  postId: string;
  comments: Comment[];
  onShowAllComments: () => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onLikeComment: (commentId: string) => void;
  loading?: boolean;
}

const InlineComments: React.FC<InlineCommentsProps> = ({
  postId,
  comments,
  onShowAllComments,
  onAddComment,
  onLikeComment,
  loading = false
}) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser || sending) return;

    setSending(true);
    try {
      await onAddComment(postId, newComment.trim());
      setNewComment('');
      setShowInput(false);
      showSuccess('Comentário adicionado! 💬');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      showError('Ops! Não conseguimos adicionar seu comentário. Tente novamente.');
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
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const isLiked = comment.likedBy.includes(currentUser.uid);
      await CommentsService.toggleCommentLike(commentId, currentUser.uid, isLiked);
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {/* Header dos Comentários */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {comments.length > 0 ? `${comments.length} comentário${comments.length > 1 ? 's' : ''}` : 'Comentários'}
          </span>
        </div>
        
        {comments.length > 0 && (
          <button
            onClick={onShowAllComments}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Lista de Comentários (máximo 2) */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          <span className="ml-2 text-sm text-gray-500">Carregando comentários...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4">
          <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.slice(-2).map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              {/* Avatar do Comentador */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {comment.userName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Conteúdo do Comentário */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl px-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-xs text-gray-900">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                </div>

                {/* Ações do Comentário */}
                <div className="flex items-center space-x-3 mt-1 ml-3">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
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

      {/* Input de Novo Comentário */}
      <div className="mt-3">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-600 transition-colors w-full"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Plus className="h-3 w-3 text-white" />
            </div>
            <span>Adicionar comentário...</span>
          </button>
        ) : (
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
            {/* Avatar do Usuário Atual */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {currentUser?.displayName?.charAt(0) || 'U'}
              </span>
            </div>

            {/* Input de Comentário */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 pr-10"
                disabled={sending}
                autoFocus
              />
            </div>

            {/* Botão de Enviar */}
            <button
              type="submit"
              disabled={!newComment.trim() || sending}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Send className="h-3 w-3" />
              )}
            </button>

            {/* Botão de Cancelar */}
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setNewComment('');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="text-sm">Cancelar</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InlineComments;
