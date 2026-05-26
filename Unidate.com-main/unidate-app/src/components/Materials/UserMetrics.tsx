import React, { useEffect, useState } from 'react';
import { BookOpen, Download, Star, Eye } from 'lucide-react';
import { UserMetricsService } from '../../services/userMetricsService';
import { UserMetrics as UserMetricsType } from '../../types/metrics';

interface UserMetricsProps {
  userId: string;
  showBadges?: boolean;
  showDetails?: boolean;
}

const UserMetrics: React.FC<UserMetricsProps> = ({ userId, showBadges = false, showDetails = false }) => {
  const [metrics, setMetrics] = useState<UserMetricsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await UserMetricsService.getUserMetrics(userId);
        setMetrics(data);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Nenhuma métrica disponível</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-gray-700">Materiais Compartilhados</span>
          </div>
          <span className="text-lg font-bold text-indigo-600">{metrics.materialsShared}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Download className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Total de Downloads</span>
          </div>
          <span className="text-lg font-bold text-green-600">{metrics.totalDownloads}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-700">Avaliação Média</span>
          </div>
          <span className="text-lg font-bold text-yellow-600">{metrics.averageRating.toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700">Visualizações</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{metrics.totalViews}</span>
        </div>
      </div>

      {showBadges && metrics.badges && metrics.badges.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Badges ({metrics.badges.length})</h4>
          <div className="flex flex-wrap gap-2">
            {metrics.badges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                title={badge.description}
              >
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Última atualização: {metrics.lastUpdated.toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserMetrics;
