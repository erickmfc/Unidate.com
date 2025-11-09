import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Download, 
  Star, 
  Eye, 
  Award, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Trophy,
  Target
} from 'lucide-react';
import { UserMetrics as UserMetricsType, Badge, BADGE_CATEGORY_COLORS, BADGE_CATEGORY_ICONS } from '../../types/metrics';
import { UserMetricsService } from '../../services/userMetricsService';

interface UserMetricsProps {
  userId: string;
  className?: string;
  showBadges?: boolean;
  showDetails?: boolean;
}

const UserMetrics: React.FC<UserMetricsProps> = ({
  userId,
  className = '',
  showBadges = true,
  showDetails = true
}) => {
  const [metrics, setMetrics] = useState<UserMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserMetrics();
  }, [userId]);

  const loadUserMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userMetrics = await UserMetricsService.getUserMetrics(userId);
      
      if (!userMetrics) {
        // Se não existem métricas, calcular
        const calculatedMetrics = await UserMetricsService.calculateUserMetrics(userId);
        setMetrics(calculatedMetrics);
      } else {
        setMetrics(userMetrics);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas do usuário:', error);
      setError('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getBadgeCategoryStats = () => {
    if (!metrics?.badges) return {};

    const stats: Record<string, number> = {};
    metrics.badges.forEach(badge => {
      stats[badge.category] = (stats[badge.category] || 0) + 1;
    });

    return stats;
  };

  const getRecentBadges = (limit: number = 3) => {
    if (!metrics?.badges) return [];
    
    return metrics.badges
      .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
      .slice(0, limit);
  };

  const getTopBadges = () => {
    if (!metrics?.badges) return [];
    
    // Ordenar badges por categoria e mostrar os mais importantes
    const categoryOrder = ['milestone', 'quality', 'popularity', 'engagement', 'sharing'];
    
    return metrics.badges.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    }).slice(0, 6);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <User className="h-8 w-8 mx-auto mb-2" />
          <p>{error || 'Erro ao carregar métricas'}</p>
        </div>
      </div>
    );
  }

  const badgeStats = getBadgeCategoryStats();
  const recentBadges = getRecentBadges();
  const topBadges = getTopBadges();

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-6 w-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Suas Métricas</h3>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Materiais Compartilhados */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Materiais</span>
          </div>
          <div className="text-2xl font-bold">{metrics.materialsShared}</div>
          <div className="text-xs opacity-90">Compartilhados</div>
        </div>

        {/* Downloads Recebidos */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="h-5 w-5" />
            <span className="text-sm font-medium">Downloads</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalDownloads)}</div>
          <div className="text-xs opacity-90">Recebidos</div>
        </div>

        {/* Avaliação Média */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-5 w-5" />
            <span className="text-sm font-medium">Avaliação</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-xs opacity-90">Média geral</div>
        </div>

        {/* Visualizações */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">Visualizações</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalViews)}</div>
          <div className="text-xs opacity-90">Total recebidas</div>
        </div>
      </div>

      {showBadges && (
        <>
          {/* Badges */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Conquistas</h4>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">
                  {metrics.badges.length} badge{metrics.badges.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Estatísticas de Badges por Categoria */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {Object.entries(badgeStats).map(([category, count]) => (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">
                    {BADGE_CATEGORY_ICONS[category as keyof typeof BADGE_CATEGORY_ICONS]}
                  </div>
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">{category}</div>
                </div>
              ))}
            </div>

            {/* Badges Recentes */}
            {recentBadges.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Conquistas Recentes</h5>
                <div className="flex flex-wrap gap-2">
                  {recentBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${badge.color}`}
                    >
                      <span className="text-lg">{badge.icon}</span>
                      <span>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Badges */}
            {topBadges.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Principais Conquistas</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                        <div className="text-xs text-gray-600">{badge.description}</div>
                        <div className="text-xs text-gray-500">
                          Conquistado em {badge.earnedAt.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE_CATEGORY_COLORS[badge.category]}`}>
                        {badge.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showDetails && (
        <>
          {/* Estatísticas Detalhadas */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Estatísticas Detalhadas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.materialsShared > 0 ? (metrics.totalDownloads / metrics.materialsShared).toFixed(1) : 0}
                </div>
                <div className="text-sm text-gray-600">Downloads por Material</div>
                <div className="text-xs text-gray-500">Média de engajamento</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.totalViews > 0 ? ((metrics.totalDownloads / metrics.totalViews) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Conversão</div>
                <div className="text-xs text-gray-500">Downloads / Visualizações</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.materialsShared > 0 ? (metrics.totalViews / metrics.materialsShared).toFixed(0) : 0}
                </div>
                <div className="text-sm text-gray-600">Visualizações por Material</div>
                <div className="text-xs text-gray-500">Média de alcance</div>
              </div>
            </div>
          </div>

          {/* Níveis de Conquista */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Progresso</h4>
            <div className="space-y-3">
              {/* Nível de Compartilhamento */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Compartilhador</div>
                    <div className="text-xs text-gray-600">Materiais compartilhados</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{metrics.materialsShared}</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((metrics.materialsShared / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Nível de Qualidade */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Qualidade</div>
                    <div className="text-xs text-gray-600">Avaliação média</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((metrics.averageRating / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Nível de Popularidade */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Popularidade</div>
                    <div className="text-xs text-gray-600">Downloads recebidos</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{formatNumber(metrics.totalDownloads)}</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((metrics.totalDownloads / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Última atualização */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Última atualização</span>
          <span>{metrics.lastUpdated.toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
};

export default UserMetrics;
