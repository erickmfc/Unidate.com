import React, { useEffect, useState } from 'react';
import { TrendingUp, Download, Eye, Star, BookOpen } from 'lucide-react';
import { UserMetricsService } from '../../services/userMetricsService';
import { UserAnalytics as UserAnalyticsType } from '../../types/metrics';

interface AnalyticsDashboardProps {
  userId: string;
  isAdmin?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId, isAdmin = false }) => {
  const [analytics, setAnalytics] = useState<UserAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await UserMetricsService.getUserAnalytics(userId, period);
        setAnalytics(data);
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [userId, period]);

  const periods: { value: 'day' | 'week' | 'month' | 'year'; label: string }[] = [
    { value: 'day', label: '24h' },
    { value: 'week', label: '7d' },
    { value: 'month', label: '30d' },
    { value: 'year', label: '1a' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Nenhum dado de analytics disponível</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'Analytics do Usuário' : 'Meus Analytics'}
          </h3>
        </div>
        <div className="flex space-x-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p.value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700">Materiais</span>
          </div>
          <span className="text-xl font-bold text-blue-900">{analytics.metrics.materialsShared}</span>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Download className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700">Downloads</span>
          </div>
          <span className="text-xl font-bold text-green-900">{analytics.metrics.downloadsReceived}</span>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-700">Avaliações</span>
          </div>
          <span className="text-xl font-bold text-yellow-900">{analytics.metrics.averageRating.toFixed(1)}</span>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Eye className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700">Visualizações</span>
          </div>
          <span className="text-xl font-bold text-purple-900">{analytics.metrics.viewsReceived}</span>
        </div>
      </div>

      {analytics.trends && analytics.trends.downloads && analytics.trends.downloads.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Evolução de Downloads</h4>
          <div className="space-y-2">
            {analytics.trends.downloads.map((point: { label?: string; value: number }, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{point.label || `Ponto ${idx + 1}`}</span>
                <span className="text-xs text-blue-600 font-medium">{point.value} downloads</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.topMaterials && analytics.topMaterials.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Materiais</h4>
          <div className="space-y-2">
            {analytics.topMaterials.map((material: { title: string; downloads: number }, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate mr-2">{material.title}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{material.downloads} downloads</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
