import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Eye,
  Star,
  Share2,
  Users,
  BookOpen,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AnalyticsData, UserAnalytics, TimeSeriesData } from '../../types/metrics';
import { UserMetricsService } from '../../services/userMetricsService';
import { MaterialsService } from '../../services/materialsService';

interface AnalyticsDashboardProps {
  userId?: string; // Se fornecido, mostra analytics do usuário
  className?: string;
  isAdmin?: boolean; // Se true, mostra analytics globais
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  className = '',
  isAdmin = false
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [userId, period, isAdmin]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAdmin) {
        // Carregar analytics globais
        const globalAnalytics = await loadGlobalAnalytics();
        setAnalytics(globalAnalytics);
      } else if (userId) {
        // Carregar analytics do usuário
        const userAnalytics = await UserMetricsService.getUserAnalytics(userId, period);
        setAnalytics(userAnalytics);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalAnalytics = async (): Promise<AnalyticsData> => {
    // Simular dados globais (em produção, viria de um serviço específico)
    const stats = await MaterialsService.getMaterialStats();
    
    return {
      period,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      endDate: new Date(),
      metrics: {
        totalMaterials: stats.totalMaterials,
        totalDownloads: stats.totalDownloads,
        totalViews: stats.totalViews,
        totalShares: Math.floor(stats.totalDownloads * 0.1), // Estimativa
        averageRating: stats.averageRating,
        newUsers: Math.floor(Math.random() * 100), // Simulado
        activeUsers: Math.floor(Math.random() * 500), // Simulado
      },
      trends: {
        materials: generateTrendData('materials'),
        downloads: generateTrendData('downloads'),
        views: generateTrendData('views'),
        shares: generateTrendData('shares'),
      }
    };
  };

  const generateTrendData = (type: string): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const days = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simular dados baseados no tipo
      let value = 0;
      switch (type) {
        case 'materials':
          value = Math.floor(Math.random() * 10) + 1;
          break;
        case 'downloads':
          value = Math.floor(Math.random() * 100) + 10;
          break;
        case 'views':
          value = Math.floor(Math.random() * 500) + 50;
          break;
        case 'shares':
          value = Math.floor(Math.random() * 20) + 1;
          break;
      }
      
      data.push({ date, value });
    }
    
    return data;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4" />;
  };

  const getTrendPercentage = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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

  if (error || !analytics) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
          <p>{error || 'Erro ao carregar analytics'}</p>
        </div>
      </div>
    );
  }

  const isUserAnalytics = 'userId' in analytics;
  const metrics = analytics.metrics;

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'Analytics Globais' : 'Meus Analytics'}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Filtro de Período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="day">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Materiais */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isUserAnalytics ? 'Compartilhados' : 'Total'}
            </span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(isUserAnalytics ? (analytics as UserAnalytics).metrics.materialsShared : (analytics as AnalyticsData).metrics.totalMaterials)}</div>
          <div className="text-xs opacity-90">
            {isUserAnalytics ? 'Materiais' : 'Materiais'}
          </div>
        </div>

        {/* Downloads */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isUserAnalytics ? 'Recebidos' : 'Total'}
            </span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(isUserAnalytics ? (analytics as UserAnalytics).metrics.downloadsReceived : (analytics as AnalyticsData).metrics.totalDownloads)}</div>
          <div className="text-xs opacity-90">Downloads</div>
        </div>

        {/* Visualizações */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isUserAnalytics ? 'Recebidas' : 'Total'}
            </span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(isUserAnalytics ? (analytics as UserAnalytics).metrics.viewsReceived : (analytics as AnalyticsData).metrics.totalViews)}</div>
          <div className="text-xs opacity-90">Visualizações</div>
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
          <div className="text-xs opacity-90">Média</div>
        </div>
      </div>

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Downloads */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Downloads</span>
          </h4>
          <div className="h-32 flex items-end space-x-1">
            {(analytics as AnalyticsData).trends.downloads.slice(-7).map((data: TimeSeriesData, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(data.value / Math.max(...(analytics as AnalyticsData).trends.downloads.map((d: TimeSeriesData) => d.value))) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-600 mt-1">
                  {data.date.toLocaleDateString('pt-BR', { day: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizações */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Visualizações</span>
          </h4>
          <div className="h-32 flex items-end space-x-1">
            {(analytics as AnalyticsData).trends.views.slice(-7).map((data: TimeSeriesData, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(data.value / Math.max(...(analytics as AnalyticsData).trends.views.map((d: TimeSeriesData) => d.value))) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-600 mt-1">
                  {data.date.toLocaleDateString('pt-BR', { day: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Materiais (apenas para usuário) */}
      {isUserAnalytics && 'topMaterials' in analytics && analytics.topMaterials.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Top Materiais</h4>
          <div className="space-y-2">
            {analytics.topMaterials.map((material, index) => (
              <div key={material.materialId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{material.title}</div>
                    <div className="text-xs text-gray-600">
                      {material.downloads} downloads • {material.views} visualizações
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">{material.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Adicionais (apenas para admin) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatNumber(isUserAnalytics ? 0 : (analytics as AnalyticsData).metrics.newUsers)}</div>
            <div className="text-sm text-gray-600">Novos Usuários</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatNumber(isUserAnalytics ? 0 : (analytics as AnalyticsData).metrics.activeUsers)}</div>
            <div className="text-sm text-gray-600">Usuários Ativos</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatNumber(isUserAnalytics ? (analytics as UserAnalytics).metrics.sharesReceived : (analytics as AnalyticsData).metrics.totalShares)}</div>
            <div className="text-sm text-gray-600">Compartilhamentos</div>
          </div>
        </div>
      )}

      {/* Período */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Período analisado</span>
          <span>
            {isUserAnalytics ? 'Período do usuário' : `${(analytics as AnalyticsData).startDate.toLocaleDateString('pt-BR')} - ${(analytics as AnalyticsData).endDate.toLocaleDateString('pt-BR')}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
