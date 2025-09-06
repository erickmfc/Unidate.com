import React, { useState } from 'react';
import { 
  TrendingUp,
  Hash,
  Eye,
  BarChart3
} from 'lucide-react';
import PostComposer from '../components/Feed/PostComposer';
import PostCard from '../components/Feed/PostCard';

interface Post {
  id: string;
  author: {
    name: string;
    course: string;
    university: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'poll' | 'tevi';
  image?: string;
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
  event?: {
    title: string;
    date: string;
    attendees: number;
  };
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Ana Silva',
        course: 'Engenharia de Software',
        university: 'USP',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Acabei de terminar meu projeto final! 🎉 6 meses de muito trabalho, mas valeu a pena. Quem mais está na reta final? #PROJETOFINAL #CALCULO1',
      type: 'text',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 24,
      comments: 8,
      isLiked: false,
      location: 'Biblioteca Central'
    },
    {
      id: '2',
      author: {
        name: 'Carlos Santos',
        course: 'Medicina',
        university: 'UNICAMP',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Eu te vi na biblioteca, você estava vestindo moletom azul e estudando anatomia. Se for você, me manda um oi! 👋',
      type: 'tevi',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      comments: 15,
      isLiked: true,
      teviData: {
        location: 'Biblioteca Central',
        clothing: 'moletom azul',
        activity: 'estudando anatomia'
      }
    },
    {
      id: '3',
      author: {
        name: 'Mariana Costa',
        course: 'Psicologia',
        university: 'UFRJ',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Que dia lindo no campus! 🌸 A primavera chegou e trouxe uma energia incrível. Alguém quer fazer um piquenique no jardim? #PRIMAVERA #PIQUENIQUE',
      type: 'text',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 18,
      comments: 5,
      isLiked: false,
      location: 'Jardim Central'
    },
    {
      id: '4',
      author: {
        name: 'Pedro Oliveira',
        course: 'Direito',
        university: 'UFMG',
        avatar: '/api/placeholder/40/40'
      },
      content: 'Qual é a melhor comida do bandejão?',
      type: 'poll',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      likes: 8,
      comments: 12,
      isLiked: false,
      pollData: {
        question: 'Qual é a melhor comida do bandejão?',
        options: ['Strogonoff', 'Feijoada', 'Lasanha', 'Salada'],
        votes: [15, 8, 12, 3]
      }
    }
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    // Implementar lógica de comentários
    console.log('Comentando no post:', postId);
  };

  const handleShare = (postId: string) => {
    // Implementar lógica de compartilhamento
    console.log('Compartilhando post:', postId);
  };

  const handleNewPost = (postData: any) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: 'Você',
        course: 'Seu Curso',
        university: 'Sua Universidade',
        avatar: '/api/placeholder/40/40'
      },
      content: postData.content,
      type: postData.type,
      timestamp: postData.timestamp,
      likes: 0,
      comments: 0,
      isLiked: false,
      teviData: postData.teviData,
      pollData: postData.pollData
    };

    setPosts([newPost, ...posts]);
  };

  const trendingHashtags = [
    { tag: '#CALCULO1', posts: 45 },
    { tag: '#FESTADODIREITO', posts: 32 },
    { tag: '#BIBLIOTECACHEIA', posts: 28 },
    { tag: '#BANDEJAO', posts: 24 },
    { tag: '#PROVAFINAL', posts: 19 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">UniVerso</h1>
              <p className="text-gray-600">A voz do campus • Não é sobre seguir, é sobre pertencer</p>
            </div>

            {/* Create Post */}
            <PostComposer onSubmit={handleNewPost} />

            {/* Posts */}
            <div className="space-y-6 mt-8">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="btn-secondary">
                Carregar mais posts
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Hashtags */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">Trending</h3>
              </div>
              <div className="space-y-3">
                {trendingHashtags.map((hashtag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button className="text-left hover:text-primary-600 transition-colors duration-200">
                      <span className="font-medium text-gray-900">{hashtag.tag}</span>
                    </button>
                    <span className="text-sm text-gray-500">{hashtag.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campus Hoje</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posts hoje</span>
                  <span className="font-semibold text-gray-900">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">#TeVi posts</span>
                  <span className="font-semibold text-pink-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pessoas online</span>
                  <span className="font-semibold text-green-600">342</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-gray-700">Postar #TeVi</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Criar Enquete</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Hash className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Explorar Hashtags</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
