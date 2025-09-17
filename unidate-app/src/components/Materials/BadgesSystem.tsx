import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Lock, 
  CheckCircle,
  Calendar,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { 
  Badge, 
  BadgeDefinition, 
  BADGE_DEFINITIONS, 
  BADGE_CATEGORY_COLORS, 
  BADGE_CATEGORY_ICONS,
  BadgeCategory 
} from '../../types/metrics';
import { UserMetricsService } from '../../services/userMetricsService';

interface BadgesSystemProps {
  userId: string;
  className?: string;
  showAllBadges?: boolean;
  showProgress?: boolean;
}

const BadgesSystem: React.FC<BadgesSystemProps> = ({
  userId,
  className = '',
  showAllBadges = false,
  showProgress = true
}) => {
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUserBadges();
  }, [userId]);

  const loadUserBadges = async () => {
    try {
      setLoading(true);
      const badges = await UserMetricsService.getUserBadges(userId);
      setUserBadges(badges);
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserBadgeIds = (): string[] => {
    return userBadges.map(badge => badge.id);
  };

  const getFilteredBadges = (): BadgeDefinition[] => {
    let filtered = BADGE_DEFINITIONS;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === selectedCategory);
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.name.toLowerCase().includes(query) ||
        badge.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getBadgeProgress = (badgeDef: BadgeDefinition): { progress: number; maxProgress: number; current: number } => {
    // Em uma implementação real, isso viria do backend
    // Por enquanto, vamos simular baseado no tipo de badge
    const userBadge = userBadges.find(b => b.id === badgeDef.id);
    
    if (userBadge) {
      return { progress: 100, maxProgress: badgeDef.condition.value, current: badgeDef.condition.value };
    }

    // Simular progresso baseado no tipo
    let current = 0;
    switch (badgeDef.condition.type) {
      case 'materials':
        current = Math.floor(Math.random() * badgeDef.condition.value);
        break;
      case 'downloads':
        current = Math.floor(Math.random() * badgeDef.condition.value);
        break;
      case 'average_rating':
        current = Math.random() * badgeDef.condition.value;
        break;
      case 'views':
        current = Math.floor(Math.random() * badgeDef.condition.value);
        break;
      default:
        current = 0;
    }

    const progress = Math.min((current / badgeDef.condition.value) * 100, 100);
    return { progress, maxProgress: badgeDef.condition.value, current };
  };

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; earned: number }> = {};
    
    BADGE_DEFINITIONS.forEach(badge => {
      if (!stats[badge.category]) {
        stats[badge.category] = { total: 0, earned: 0 };
      }
      stats[badge.category].total++;
      
      if (userBadges.some(userBadge => userBadge.id === badge.id)) {
        stats[badge.category].earned++;
      }
    });

    return stats;
  };

  const getTotalProgress = () => {
    const earned = userBadges.length;
    const total = BADGE_DEFINITIONS.length;
    return { earned, total, percentage: (earned / total) * 100 };
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categoryStats = getCategoryStats();
  const totalProgress = getTotalProgress();
  const filteredBadges = getFilteredBadges();

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sistema de Conquistas</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">
            {totalProgress.earned}/{totalProgress.total}
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${totalProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Estatísticas por Categoria */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(categoryStats).map(([category, stats]) => {
          const percentage = (stats.earned / stats.total) * 100;
          return (
            <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">
                {BADGE_CATEGORY_ICONS[category as BadgeCategory]}
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">
                {stats.earned}/{stats.total}
              </div>
              <div className="text-xs text-gray-600 capitalize mb-2">{category}</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    BADGE_CATEGORY_COLORS[category as BadgeCategory].split(' ')[0]
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conquistas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {Object.keys(categoryStats).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as BadgeCategory)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badgeDef) => {
          const userBadge = userBadges.find(b => b.id === badgeDef.id);
          const isEarned = !!userBadge;
          const progress = getBadgeProgress(badgeDef);

          return (
            <div
              key={badgeDef.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                isEarned
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              {/* Badge Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className={`text-3xl ${isEarned ? '' : 'grayscale opacity-50'}`}>
                  {badgeDef.icon}
                </div>
                {isEarned ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Lock className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Badge Info */}
              <div className="mb-3">
                <h4 className={`font-semibold ${isEarned ? 'text-gray-900' : 'text-gray-600'}`}>
                  {badgeDef.name}
                </h4>
                <p className={`text-sm ${isEarned ? 'text-gray-700' : 'text-gray-500'}`}>
                  {badgeDef.description}
                </p>
              </div>

              {/* Category */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${BADGE_CATEGORY_COLORS[badgeDef.category]}`}>
                  {BADGE_CATEGORY_ICONS[badgeDef.category]} {badgeDef.category}
                </span>
              </div>

              {/* Progress */}
              {showProgress && !isEarned && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{progress.current}/{progress.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Earned Date */}
              {isEarned && userBadge && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Conquistado em {userBadge.earnedAt.toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              {/* Hidden Badge Indicator */}
              {badgeDef.isHidden && !isEarned && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conquista encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}

      {/* Achievement Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Target className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Dicas para Conquistar Badges
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Compartilhe materiais de qualidade regularmente</li>
              <li>• Mantenha uma boa média de avaliações</li>
              <li>• Crie conteúdo que gere engajamento</li>
              <li>• Seja consistente na contribuição</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesSystem;
