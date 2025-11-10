import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AchievementsService, ALL_ACHIEVEMENTS } from '../services/achievementsService';
import { AchievementProgress, AchievementStats } from '../types/achievements';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Search,
  CheckCircle,
  Lock,
  BookOpen,
  TrendingUp,
  Flame,
  Eye
} from 'lucide-react';

const Achievements: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadAchievements = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userAchievements = await AchievementsService.getUserAchievements(currentUser.uid);
        const userStats = await AchievementsService.getAchievementStats(currentUser.uid);
        
        setAchievements(userAchievements);
        setStats(userStats);
      } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [currentUser]);

  const categories = [
    { id: 'all', name: 'Todas', icon: Award },
    { id: 'sharing', name: 'sharing', icon: BookOpen },
    { id: 'quality', name: 'quality', icon: Star },
    { id: 'popularity', name: 'popularity', icon: Flame },
    { id: 'engagement', name: 'engagement', icon: Eye },
    { id: 'milestone', name: 'milestone', icon: Trophy }
  ];

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || Award;
  };

  const getCategoryName = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.name || category;
  };

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

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.achievement.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      achievement.achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unlockedCount = stats?.unlocked || 0;
  const totalCount = stats?.total || 0;

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
                <p className="text-2xl font-bold text-gray-900">{unlockedCount}/{totalCount}</p>
              </div>
            </div>
          </div>

          {stats && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">📚 sharing</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byCategory.sharing.unlocked}/{stats.byCategory.sharing.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">⭐ quality</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byCategory.quality.unlocked}/{stats.byCategory.quality.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">🔥 popularity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byCategory.popularity.unlocked}/{stats.byCategory.popularity.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">📈 engagement</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byCategory.engagement.unlocked}/{stats.byCategory.engagement.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">🏆 milestone</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byCategory.milestone.unlocked}/{stats.byCategory.milestone.total}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search and Category Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conquistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando conquistas...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievementProgress) => {
              const achievement = achievementProgress.achievement;
              return (
                <div 
                  key={achievement.id} 
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                    achievementProgress.isUnlocked 
                      ? 'hover:shadow-lg' 
                      : 'opacity-60'
                  }`}
                >
                  {/* Achievement Header */}
                  <div className={`h-32 bg-gradient-to-br ${getRarityColor(achievement.rarity)} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">{achievement.icon}</span>
                    </div>
                    <div className="absolute top-4 right-4">
                      {achievementProgress.isUnlocked ? (
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
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
                        {getCategoryName(achievement.category)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

                    {/* Progress Bar */}
                    {!achievementProgress.isUnlocked && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progresso</span>
                          <span>
                            {achievementProgress.achievement.type === 'average' 
                              ? achievementProgress.progress.toFixed(2)
                              : Math.floor(achievementProgress.progress)
                            }/{achievementProgress.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${achievementProgress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Unlocked Date */}
                    {achievementProgress.isUnlocked && achievementProgress.unlockedAt && (
                      <div className="text-sm text-green-600 font-medium">
                        Desbloqueado em {achievementProgress.unlockedAt.toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
