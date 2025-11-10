import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, BarChart3 } from 'lucide-react';

interface TwitterStylePostProps {
  post: {
    id: string;
    author: {
      uid: string;
      name: string;
      handle?: string;
      avatar: string;
      course: string;
      university: string;
    };
    content: string;
    timestamp: string | Date;
    source?: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    isAIBot?: boolean;
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const TwitterStylePost: React.FC<TwitterStylePostProps> = ({
  post,
  onLike,
  onComment,
  onShare
}) => {
  const formatTime = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'agora';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      
      // Formato simples para datas mais antigas
      const months = Math.floor(days / 30);
      if (months < 12) return `${months}meses`;
      const years = Math.floor(months / 12);
      return `${years}anos`;
    } catch {
      return 'agora';
    }
  };

  const formatFullDate = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=8b5cf6&color=fff`}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          {/* Nome e Handle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 truncate">
                {post.author.name}
              </h3>
              {post.isAIBot && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  AI
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm truncate">
              {post.author.handle || `@${post.author.name.toLowerCase().replace(/\s+/g, '')}`}
            </p>
          </div>
        </div>
        {/* Menu */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Metadata */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <span>{formatFullDate(post.timestamp)}</span>
          {post.source && (
            <>
              <span>·</span>
              <span className="text-blue-500 hover:underline cursor-pointer">
                {post.source}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={() => onComment?.(post.id)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group"
        >
          <MessageCircle className="h-5 w-5 group-hover:bg-blue-50 rounded-full p-1 transition-colors" />
          <span className="text-sm">{post.comments || 0}</span>
        </button>
        <button
          onClick={() => onShare?.(post.id)}
          className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group"
        >
          <Share2 className="h-5 w-5 group-hover:bg-green-50 rounded-full p-1 transition-colors" />
        </button>
        <button
          onClick={() => onLike?.(post.id)}
          className={`flex items-center space-x-2 transition-colors group ${
            post.isLiked
              ? 'text-red-500'
              : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart
            className={`h-5 w-5 transition-all ${
              post.isLiked
                ? 'fill-current'
                : 'group-hover:bg-red-50 rounded-full p-1'
            }`}
          />
          <span className="text-sm">{post.likes || 0}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm text-gray-400">Ver atividade</span>
        </button>
      </div>
    </div>
  );
};

export default TwitterStylePost;

