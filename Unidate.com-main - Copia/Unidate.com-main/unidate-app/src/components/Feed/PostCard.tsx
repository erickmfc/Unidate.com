import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Eye,
  MapPin,
  Clock,
  User,
  Trash2,
  User as UserIcon
} from 'lucide-react';
import PostComments from './PostComments';
import InlineComments from './InlineComments';
import InlineConfirmation from '../UI/InlineConfirmation';
import { CommentsService, Comment } from '../../services/commentsService';
import { useAuth } from '../../contexts/AuthContext';

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
  type: 'text' | 'tevi' | 'poll' | 'image';
  timestamp: string;
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
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, commentText: string) => void;
  onShare: (postId: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare, onDelete, currentUserId }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [unsubscribeComments, setUnsubscribeComments] = useState<(() => void) | null>(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUserId && post.author.uid === currentUserId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!unsubscribeComments) {
      setLoadingComments(true);
      console.log('🔄 [POSTCARD] Carregando últimos comentários para post:', post.id);
      
      const unsubscribe = CommentsService.loadPostComments(
        post.id,
        (loadedComments) => {
          console.log('📱 [POSTCARD] Comentários carregados:', loadedComments.length);
          const lastTwoComments = loadedComments.slice(-2);
          setComments(lastTwoComments);
          setLoadingComments(false);
        },
        (error) => {
          console.error('❌ [POSTCARD] Erro ao carregar comentários:', error);
          setLoadingComments(false);
        },
        2
      );
      
      setUnsubscribeComments(() => unsubscribe);
    }

    return () => {
      if (unsubscribeComments) {
        unsubscribeComments();
      }
    };
  }, [post.id]);

  const handleProfileClick = () => {
    console.log('🔍 Navegando para perfil do usuário:', post.author.uid);
    if (!post.author.uid) {
      console.error('❌ post.author.uid está vazio!');
      return;
    }
    navigate(`/profile/${post.author.uid}`);
  };

  const handleDeletePost = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!currentUser || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🔄 [POSTCARD] Adicionando comentário...', { postId, content });
      
      await CommentsService.addComment(
        postId,
        currentUser.uid,
        userProfile.displayName || currentUser.displayName || 'Usuário',
        userProfile.photoURL || currentUser.photoURL || '/api/placeholder/40/40',
        content
      );
      
      console.log('✅ [POSTCARD] Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('❌ [POSTCARD] Erro ao adicionar comentário:', error);
      throw error;
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const isLiked = comment.likedBy.includes(currentUser.uid);
      
      await CommentsService.toggleCommentLike(commentId, currentUser.uid, isLiked);
      
      console.log('✅ [POSTCARD] Like do comentário atualizado');
    } catch (error) {
      console.error('❌ [POSTCARD] Erro ao curtir comentário:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return postTime.toLocaleDateString('pt-BR');
    }
  };

  const extractHashtags = (text: string) => {
    const hashtagRegex = /#\w+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return hashtags;
  };

  const renderContent = () => {
    const hashtags = extractHashtags(post.content);
    let content = post.content;

    hashtags.forEach(hashtag => {
      content = content.replace(hashtag, `<span class="text-primary-600 font-medium">${hashtag}</span>`);
    });

    return { __html: content };
  };

  return (
    <div className={`card ${post.type === 'tevi' ? 'border-l-4 border-l-pink-500 bg-gradient-to-r from-pink-50 to-white' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {post.author.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
              {post.author.name}
            </h3>
            <p className="text-sm text-gray-600">
              {post.author.course} • {post.author.university}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post.type === 'tevi' && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
              <Eye className="h-3 w-3" />
              <span>#TeVi</span>
            </div>
          )}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Ver Perfil</span>
                  </button>
                  
                  {isOwner && onDelete && (
                    <InlineConfirmation
                      onConfirm={handleDeletePost}
                      type="danger"
                      confirmText="Deletar"
                      size="sm"
                      className="w-full"
                    >
                      <div className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Deletar Post</span>
                      </div>
                    </InlineConfirmation>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div 
          className="text-gray-900 mb-3"
          dangerouslySetInnerHTML={renderContent()}
        />
        
        {post.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            <span>{post.location}</span>
          </div>
        )}

        {post.type === 'tevi' && post.teviData && (
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-4 w-4 text-pink-600" />
              <span className="font-medium text-pink-900">Detalhes do #TeVi</span>
            </div>
            <div className="space-y-1 text-sm text-pink-700">
              <p><strong>Local:</strong> {post.teviData.location}</p>
              <p><strong>Roupa:</strong> {post.teviData.clothing}</p>
              <p><strong>Fazendo:</strong> {post.teviData.activity}</p>
            </div>
          </div>
        )}

        {post.type === 'poll' && post.pollData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
            <h4 className="font-medium text-blue-900 mb-3">{post.pollData.question}</h4>
            <div className="space-y-2">
              {post.pollData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1 bg-white rounded-lg p-2 border border-blue-200">
                    <span className="text-sm text-blue-800">{option}</span>
                  </div>
                  <span className="text-xs text-blue-600">
                    {post.pollData?.votes[index] || 0} votos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center space-x-2 transition-colors duration-200 ${
              showComments 
                ? 'text-blue-500' 
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments}</span>
          </button>
          
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors duration-200"
          >
            <Share2 className="h-5 w-5" />
            <span>Divulgar</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatTime(post.timestamp)}</span>
        </div>
      </div>

      <InlineComments
        postId={post.id}
        comments={comments}
        loading={loadingComments}
        onShowAllComments={() => setShowComments(true)}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      {showComments && (
        <PostComments
          postId={post.id}
          comments={comments}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
        />
      )}

    </div>
  );
};

export default PostCard;