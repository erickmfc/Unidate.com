import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import { 
  MessageSquare, 
  Send, 
  Heart, 
  MessageCircle, 
  Clock
} from 'lucide-react';

interface AnonymousPost {
  id: string;
  content: string;
  category: 'academic' | 'personal' | 'social' | 'general';
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked?: boolean;
}

const AnonymousWallPage: React.FC = () => {
  const [newPost, setNewPost] = useState({
    content: '',
    category: 'general' as const
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewPost, setShowNewPost] = useState(false);

  const [posts, setPosts] = useState<AnonymousPost[]>([]);

  const categories = [
    { value: 'all', label: 'Todos', icon: '📝' },
    { value: 'academic', label: 'Acadêmico', icon: '📚' },
    { value: 'personal', label: 'Pessoal', icon: '💭' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'general', label: 'Geral', icon: '💬' }
  ];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setPosts([]);
      } catch (error) {
        console.error('Erro ao carregar posts anônimos:', error);
      }
    };

    loadPosts();
  }, []);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.content.trim()) {
      const post: AnonymousPost = {
        id: Date.now().toString(),
        content: newPost.content,
        category: newPost.category,
        likes: 0,
        comments: 0,
        createdAt: new Date(),
        isLiked: false
      };
      setPosts([post, ...posts]);
      setNewPost({ content: '', category: 'general' });
      setShowNewPost(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MessageSquare className="w-8 h-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-gray-800">Mural de Desabafos</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Um espaço seguro e anônimo para compartilhar seus pensamentos, frustrações e conquistas.
            Aqui você pode desabafar sem julgamentos.
          </p>
        </div>

        {}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors mx-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Novo Desabafo</span>
          </button>
        </div>

        {}
        {showNewPost && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Compartilhe seu desabafo</h3>
            
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">Geral</option>
                  <option value="academic">Acadêmico</option>
                  <option value="personal">Pessoal</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu desabafo
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Compartilhe o que está sentindo..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">?</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">Anônimo</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(post.category)}`}>
                        {categories.find(c => c.value === post.category)?.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum desabafo encontrado</h3>
            <p className="text-gray-600">Tente mudar o filtro ou seja o primeiro a compartilhar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnonymousWallPage;
