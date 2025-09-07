import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Eye,
  MapPin,
  Clock,
  User
} from 'lucide-react';

interface Post {
  id: string;
  author: {
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
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare }) => {
  // const [showComments, setShowComments] = useState(false);

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

    // Replace hashtags with styled spans
    hashtags.forEach(hashtag => {
      content = content.replace(hashtag, `<span class="text-primary-600 font-medium">${hashtag}</span>`);
    });

    return { __html: content };
  };

  return (
    <div className={`card ${post.type === 'tevi' ? 'border-l-4 border-l-pink-500 bg-gradient-to-r from-pink-50 to-white' : ''}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {post.author.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Post Content */}
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

      {/* Post Actions */}
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
            onClick={() => {
              const commentText = prompt('Digite seu comentário:');
              if (commentText) {
                onComment(post.id, commentText);
              }
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments}</span>
          </button>
          
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors duration-200"
          >
            <Share2 className="h-5 w-5" />
            <span>Compartilhar</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatTime(post.timestamp)}</span>
        </div>
      </div>

      {/* Comments Section */}
      {false && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-800">Que legal! Também vi essa pessoa na biblioteca hoje! 📚</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ana Silva • 2h atrás</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">V</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;

