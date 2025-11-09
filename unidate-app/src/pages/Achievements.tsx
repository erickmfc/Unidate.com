import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Users, 
  User,
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  BookOpen,
  Zap,
  Crown,
  Medal,
  Badge,
  CheckCircle,
  Lock
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon: React.ComponentType<any>;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

const Achievements: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Complete seu perfil no UniDate',
      category: 'profile',
      points: 10,
      icon: User,
      isUnlocked: true,
      rarity: 'common',
      unlockedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Faça 10 conexões no UniDate',
      category: 'social',
      points: 50,
      icon: Users,
      isUnlocked: true,
      progress: 10,
      maxProgress: 10,
      rarity: 'rare',
      unlockedAt: '2024-02-01'
    },
    {
      id: '3',
      title: 'Coração Generoso',
      description: 'Dê 50 curtidas em perfis',
      category: 'social',
      points: 25,
      icon: Heart,
      isUnlocked: false,
      progress: 32,
      maxProgress: 50,
      rarity: 'common'
    },
    {
      id: '4',
      title: 'Conversador',
      description: 'Envie 100 mensagens',
      category: 'communication',
      points: 30,
      icon: MessageCircle,
      isUnlocked: false,
      progress: 67,
      maxProgress: 100,
      rarity: 'common'
    },
    {
      id: '5',
      title: 'Explorador do Campus',
      description: 'Visite 20 lugares no Guia do Campus',
      category: 'exploration',
      points: 40,
      icon: MapPin,
      isUnlocked: false,
      progress: 8,
      maxProgress: 20,
      rarity: 'rare'
    },
    {
      id: '6',
      title: 'Participante Ativo',
      description: 'Participe de 5 eventos',
      category: 'events',
      points: 75,
      icon: Calendar,
      isUnlocked: false,
      progress: 2,
      maxProgress: 5,
      rarity: 'epic'
    },
    {
      id: '7',
      title: 'Mestre do UniVerso',
      description: 'Crie 25 posts no UniVerso',
      category: 'content',
      points: 60,
      icon: BookOpen,
      isUnlocked: false,
      progress: 12,
      maxProgress: 25,
      rarity: 'rare'
    },
    {
      id: '8',
      title: 'Lenda do Campus',
      description: 'Alcance 1000 pontos totais',
      category: 'milestone',
      points: 200,
      icon: Crown,
      isUnlocked: false,
      progress: 186,
      maxProgress: 1000,
      rarity: 'legendary'
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'profile', name: 'Perfil' },
    { id: 'social', name: 'Social' },
    { id: 'communication', name: 'Comunicação' },
    { id: 'exploration', name: 'Exploração' },
    { id: 'events', name: 'Eventos' },
    { id: 'content', name: 'Conteúdo' },
    { id: 'milestone', name: 'Marcos' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Rara';
      case 'epic': return 'Épica';
      case 'legendary': return 'Lendária';
      default: return 'Comum';
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Conquistas</h1>
              <p className="text-gray-600">Suas badges e gamificação no UniDate</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conquistas Desbloqueadas</p>
                <p className="text-2xl font-bold text-gray-900">{unlockedCount}/{achievements.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pontos Totais</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                achievement.isUnlocked 
                  ? 'hover:shadow-lg' 
                  : 'opacity-60'
              }`}
            >
              {/* Achievement Header */}
              <div className={`h-32 bg-gradient-to-br ${getRarityColor(achievement.rarity)} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <achievement.icon className={`h-16 w-16 text-white ${
                    achievement.isUnlocked ? '' : 'opacity-50'
                  }`} />
                </div>
                <div className="absolute top-4 right-4">
                  {achievement.isUnlocked ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <Lock className="h-6 w-6 text-white opacity-50" />
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                    {getRarityName(achievement.rarity)}
                  </span>
                </div>
              </div>

              {/* Achievement Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{achievement.title}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-600">{achievement.points}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

                {/* Progress Bar */}
                {!achievement.isUnlocked && achievement.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progresso</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.maxProgress!) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Unlocked Date */}
                {achievement.isUnlocked && achievement.unlockedAt && (
                  <div className="text-sm text-green-600 font-medium">
                    Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma conquista encontrada</h3>
            <p className="text-gray-600">Tente selecionar uma categoria diferente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
