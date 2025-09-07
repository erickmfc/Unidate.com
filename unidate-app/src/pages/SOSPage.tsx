import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PostLoginNavbar from '../components/Navigation/PostLoginNavbar';
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Send,
  Search,
  ThumbsUp,
  Reply
} from 'lucide-react';

interface HelpPost {
  id: string;
  title: string;
  description: string;
  subject: string;
  author: {
    name: string;
    course: string;
    photoURL?: string;
  };
  createdAt: Date;
  replies: number;
  likes: number;
  isResolved: boolean;
  tags: string[];
}

const SOSPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'ask' | 'help' | 'my-posts'>('ask');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Mock data - em produção viria do Firebase
  const [helpPosts] = useState<HelpPost[]>([
    {
      id: '1',
      title: 'Preciso de ajuda com Cálculo 2',
      description: 'Estou com dificuldade na integração por partes. Alguém pode me explicar?',
      subject: 'Cálculo 2',
      author: {
        name: 'João Silva',
        course: 'Engenharia',
        photoURL: undefined
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      replies: 3,
      likes: 5,
      isResolved: false,
      tags: ['matemática', 'cálculo', 'integração']
    },
    {
      id: '2',
      title: 'Dúvida sobre Física 1',
      description: 'Não entendi o conceito de momento linear. Pode alguém me ajudar?',
      subject: 'Física 1',
      author: {
        name: 'Maria Santos',
        course: 'Física',
        photoURL: undefined
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      replies: 2,
      likes: 3,
      isResolved: true,
      tags: ['física', 'momento', 'mecânica']
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    subject: '',
    tags: ''
  });

  const subjects = [
    'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia',
    'Português', 'Inglês', 'Filosofia', 'Sociologia', 'Economia', 'Direito',
    'Medicina', 'Engenharia', 'Computação', 'Psicologia', 'Outro'
  ];

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você enviaria para o Firebase
    console.log('Novo post:', newPost);
    setNewPost({ title: '', description: '', subject: '', tags: '' });
  };

  const filteredPosts = helpPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || post.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PostLoginNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <HelpCircle className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">SOS UniDate</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Precisa de ajuda com alguma matéria? Aqui você pode pedir ajuda e oferecer seu conhecimento para outros estudantes.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('ask')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'ask'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pedir Ajuda
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'help'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ajudar Outros
            </button>
            <button
              onClick={() => setActiveTab('my-posts')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'my-posts'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Meus Posts
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'ask' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedir Ajuda</h2>
              
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da sua dúvida
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Dúvida sobre integração por partes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria
                  </label>
                  <select
                    value={newPost.subject}
                    onChange={(e) => setNewPost({ ...newPost, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma matéria</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição detalhada
                  </label>
                  <textarea
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Descreva sua dúvida em detalhes..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (opcional)
                  </label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: matemática, cálculo, integração"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Pedido de Ajuda</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Buscar por título ou descrição..."
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todas as matérias</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {post.author.photoURL ? (
                          <img 
                            src={post.author.photoURL} 
                            alt="Foto" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {post.author.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{post.author.name}</h3>
                        <p className="text-sm text-gray-500">{post.author.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.isResolved && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Resolvido
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h4>
                  <p className="text-gray-600 mb-4">{post.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.replies} respostas</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </div>
                    </div>
                    <button className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                      <Reply className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-posts' && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Seus Posts</h3>
            <p className="text-gray-600">Aqui você verá todos os posts que você criou</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSPage;
