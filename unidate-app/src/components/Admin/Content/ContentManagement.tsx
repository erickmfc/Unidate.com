import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Flag, 
  MessageSquare, 
  Users, 
  Calendar,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Hash,
  Image,
  Video
} from 'lucide-react';

interface Post {
  id: string;
  author: string;
  authorId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'poll';
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  isReported: boolean;
  reportsCount: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  postsCount: number;
  createdAt: Date;
  isPrivate: boolean;
  isActive: boolean;
  owner: string;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: Date;
  isReported: boolean;
  reportsCount: number;
}

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'comments'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'reported' | 'anonymous'>('all');

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados - em produção viriam do Firebase
        setPosts([]);
        setGroups([]);
        setComments([]);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [activeTab, dateFilter, contentFilter]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && isToday(post.createdAt)) ||
      (dateFilter === 'week' && isThisWeek(post.createdAt)) ||
      (dateFilter === 'month' && isThisMonth(post.createdAt));
    
    const matchesContent = contentFilter === 'all' ||
      (contentFilter === 'reported' && post.isReported) ||
      (contentFilter === 'anonymous' && post.isAnonymous);
    
    return matchesSearch && matchesDate && matchesContent;
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  };

  const isThisMonth = (date: Date) => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= monthAgo;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Tem certeza que deseja arquivar este grupo?')) {
      setGroups(groups.map(group => 
        group.id === groupId ? { ...group, isActive: false } : group
      ));
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  const renderPostContent = (post: Post) => {
    switch (post.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <p className="text-gray-900">{post.content}</p>
            {post.imageUrl && (
              <div className="relative">
                <img 
                  src={post.imageUrl} 
                  alt="Post image" 
                  className="max-w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            <p className="text-gray-900">{post.content}</p>
            {post.videoUrl && (
              <div className="relative">
                <video 
                  src={post.videoUrl} 
                  controls 
                  className="max-w-full h-64 rounded-lg"
                />
              </div>
            )}
          </div>
        );
      case 'poll':
        return (
          <div className="space-y-2">
            <p className="text-gray-900">{post.content}</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">📊 Enquete</p>
            </div>
          </div>
        );
      default:
        return <p className="text-gray-900">{post.content}</p>;
    }
  };

  const renderPosts = () => (
    <div className="space-y-4">
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum post encontrado</h3>
          <p className="text-gray-500">Não há posts que correspondam aos filtros selecionados.</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.isAnonymous ? '?' : post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {post.isAnonymous ? 'Usuário Anônimo' : post.author}
                  </p>
                  <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {post.isReported && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <Flag className="h-4 w-4" />
                    <span className="text-sm font-medium">{post.reportsCount}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{post.comments}</span>
                </div>
                
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              {renderPostContent(post)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>👍 {post.likes}</span>
                <span>💬 {post.comments}</span>
                {post.type === 'image' && <Image className="h-4 w-4" />}
                {post.type === 'video' && <Video className="h-4 w-4" />}
                {post.type === 'poll' && <Hash className="h-4 w-4" />}
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo encontrado</h3>
          <p className="text-gray-500">Não há grupos que correspondam aos filtros selecionados.</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">Criado por {group.owner}</p>
                  <p className="text-sm text-gray-500">{formatTime(group.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {group.isPrivate && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Privado
                  </span>
                )}
                {!group.isActive && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Arquivado
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{group.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>👥 {group.membersCount} membros</span>
                <span>📝 {group.postsCount} posts</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderComments = () => (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum comentário encontrado</h3>
          <p className="text-gray-500">Não há comentários que correspondam aos filtros selecionados.</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {comment.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{comment.author}</p>
                  <p className="text-sm text-gray-500">{formatTime(comment.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {comment.isReported && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <Flag className="h-4 w-4" />
                    <span className="text-sm font-medium">{comment.reportsCount}</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-900 mb-3">{comment.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Post ID: {comment.postId}
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Conteúdo</h1>
          <p className="text-gray-600 mt-1">Visualize e modere todo o conteúdo da plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'feed', label: 'Feed UniVerso', icon: MessageSquare },
            { id: 'groups', label: 'Grupos', icon: Users },
            { id: 'comments', label: 'Comentários', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por conteúdo ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos os períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conteúdo</label>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todo conteúdo</option>
              <option value="reported">Apenas denunciados</option>
              <option value="anonymous">Apenas anônimos</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Filter className="h-4 w-4 inline mr-2" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'feed' && renderPosts()}
          {activeTab === 'groups' && renderGroups()}
          {activeTab === 'comments' && renderComments()}
        </>
      )}
    </div>
  );
};

export default ContentManagement;
