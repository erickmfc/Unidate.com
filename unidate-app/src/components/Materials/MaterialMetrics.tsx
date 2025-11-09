import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Eye, 
  Star, 
  Share2, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { EducationalMaterial, MaterialRating } from '../../types/materials';
import { MaterialMetrics as MaterialMetricsType } from '../../types/metrics';

interface MaterialMetricsProps {
  material: EducationalMaterial;
  className?: string;
  showDetails?: boolean;
  showTrends?: boolean;
}

const MaterialMetrics: React.FC<MaterialMetricsProps> = ({
  material,
  className = '',
  showDetails = true,
  showTrends = false
}) => {
  const [metrics, setMetrics] = useState<MaterialMetricsType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateMetrics();
  }, [material]);

  const calculateMetrics = () => {
    const materialMetrics: MaterialMetricsType = {
      materialId: material.id,
      downloads: material.totalDownloads,
      averageRating: material.averageRating,
      totalRatings: material.totalRatings,
      views: material.views,
      shares: 0, // Seria calculado baseado em compartilhamentos reais
      comments: material.ratings.filter(r => r.comment && r.comment.trim().length > 0).length,
      lastUpdated: new Date(),
    };

    setMetrics(materialMetrics);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (downloads: number): { level: string; color: string; icon: React.ReactNode } => {
    if (downloads >= 1000) {
      return {
        level: 'Viral',
        color: 'text-red-600 bg-red-100',
        icon: <TrendingUp className="h-4 w-4" />
      };
    } else if (downloads >= 500) {
      return {
        level: 'Popular',
        color: 'text-orange-600 bg-orange-100',
        icon: <TrendingUp className="h-4 w-4" />
      };
    } else if (downloads >= 100) {
      return {
        level: 'Em Alta',
        color: 'text-yellow-600 bg-yellow-100',
        icon: <TrendingUp className="h-4 w-4" />
      };
    } else if (downloads >= 10) {
      return {
        level: 'Crescendo',
        color: 'text-blue-600 bg-blue-100',
        icon: <Activity className="h-4 w-4" />
      };
    } else {
      return {
        level: 'Novo',
        color: 'text-gray-600 bg-gray-100',
        icon: <Calendar className="h-4 w-4" />
      };
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (!metrics) {
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

  const performance = getPerformanceLevel(metrics.downloads);

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Métricas do Material</h3>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${performance.color}`}>
          {performance.icon}
          <span>{performance.level}</span>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Downloads */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="h-5 w-5" />
            <span className="text-sm font-medium">Downloads</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.downloads)}</div>
          <div className="text-xs opacity-90">Total de downloads</div>
        </div>

        {/* Visualizações */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">Visualizações</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.views)}</div>
          <div className="text-xs opacity-90">Pessoas que viram</div>
        </div>

        {/* Avaliação */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-5 w-5" />
            <span className="text-sm font-medium">Avaliação</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-xs opacity-90">
            {metrics.totalRatings} avaliação{metrics.totalRatings !== 1 ? 'ões' : ''}
          </div>
        </div>

        {/* Comentários */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comentários</span>
          </div>
          <div className="text-2xl font-bold">{metrics.comments}</div>
          <div className="text-xs opacity-90">Reviews escritos</div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Detalhes da Avaliação */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Detalhes da Avaliação</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(metrics.averageRating)}
                  </div>
                  <span className={`text-lg font-semibold ${getRatingColor(metrics.averageRating)}`}>
                    {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'Sem avaliação'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {metrics.totalRatings} avaliação{metrics.totalRatings !== 1 ? 'ões' : ''}
                </span>
              </div>

              {/* Distribuição de avaliações */}
              {metrics.totalRatings > 0 && (
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    // Simular distribuição (em produção, viria do backend)
                    const count = Math.floor(Math.random() * metrics.totalRatings);
                    const percentage = metrics.totalRatings > 0 ? (count / metrics.totalRatings) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-2">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas de Engajamento */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Engajamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.downloads > 0 ? ((metrics.downloads / metrics.views) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Download</div>
                <div className="text-xs text-gray-500">Downloads / Visualizações</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.totalRatings > 0 ? ((metrics.totalRatings / metrics.views) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Avaliação</div>
                <div className="text-xs text-gray-500">Avaliações / Visualizações</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metrics.comments > 0 ? ((metrics.comments / metrics.totalRatings) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Comentários</div>
                <div className="text-xs text-gray-500">Comentários / Avaliações</div>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Indicadores de Performance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Popularidade</div>
                    <div className="text-xs text-gray-600">Baseado em downloads</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{performance.level}</div>
                  <div className="text-xs text-gray-600">{formatNumber(metrics.downloads)} downloads</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Qualidade</div>
                    <div className="text-xs text-gray-600">Baseado em avaliações</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getRatingColor(metrics.averageRating)}`}>
                    {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {metrics.totalRatings} avaliação{metrics.totalRatings !== 1 ? 'ões' : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Alcance</div>
                    <div className="text-xs text-gray-600">Baseado em visualizações</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(metrics.views)}
                  </div>
                  <div className="text-xs text-gray-600">visualizações</div>
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

export default MaterialMetrics;
