import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Heart, 
  Eye, 
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Target,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    engagement: number;
    retention: number;
    growth: number;
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionTime: number;
    topPages: Array<{ page: string; views: number; growth: number }>;
  };
  engagement: {
    postsCreated: number;
    commentsCount: number;
    likesCount: number;
    sharesCount: number;
    avgEngagement: number;
    topContent: Array<{ title: string; engagement: number; type: string }>;
  };
  demographics: {
    byCourse: Array<{ course: string; users: number; percentage: number }>;
    byYear: Array<{ year: string; users: number; percentage: number }>;
    byUniversity: Array<{ university: string; users: number; percentage: number }>;
    byDevice: Array<{ device: string; users: number; percentage: number }>;
  };
  realTime: {
    onlineUsers: number;
    activeSessions: number;
    currentActivity: Array<{ user: string; action: string; time: string }>;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'traffic' | 'engagement' | 'demographics'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados simulados - em produção viriam do Firebase Analytics
        const mockData: AnalyticsData = {
          overview: {
            totalUsers: 0,
            activeUsers: 0,
            newUsers: 0,
            engagement: 0,
            retention: 0,
            growth: 0
          },
          traffic: {
            pageViews: 0,
            uniqueVisitors: 0,
            bounceRate: 0,
            avgSessionTime: 0,
            topPages: []
          },
          engagement: {
            postsCreated: 0,
            commentsCount: 0,
            likesCount: 0,
            sharesCount: 0,
            avgEngagement: 0,
            topContent: []
          },
          demographics: {
            byCourse: [],
            byYear: [],
            byUniversity: [],
            byDevice: []
          },
          realTime: {
            onlineUsers: 0,
            activeSessions: 0,
            currentActivity: []
          }
        };

        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();

    // Auto refresh a cada 30 segundos
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadAnalytics, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    // Implementar exportação de dados
    console.log(`Exportando dados em formato ${format}`);
    
    // Simular download
    const filename = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    const link = document.createElement('a');
    link.href = '#'; // URL do arquivo gerado
    link.download = filename;
    link.click();
    
    // Feedback visual
    alert(`Exportando dados em formato ${format.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Erro ao carregar analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Não foi possível carregar os dados de analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Avançado</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights detalhados sobre o comportamento dos usuários
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600 dark:text-gray-400">
              Auto refresh
            </label>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.overview.totalUsers)}
              </p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(analyticsData.overview.growth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(analyticsData.overview.growth)}`}>
                  {Math.abs(analyticsData.overview.growth)}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Ativos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.overview.activeUsers)}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Online agora</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engajamento</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analyticsData.overview.engagement}%
              </p>
              <div className="flex items-center mt-2">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Taxa média</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Retenção</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analyticsData.overview.retention}%
              </p>
              <div className="flex items-center mt-2">
                <Target className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">7 dias</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Métricas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'traffic', label: 'Tráfego', icon: Globe },
              { id: 'engagement', label: 'Engajamento', icon: Heart },
              { id: 'demographics', label: 'Demografia', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedMetric === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedMetric === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Crescimento de Usuários
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Novos usuários</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.overview.newUsers)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de crescimento</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {analyticsData.overview.growth}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Atividade em Tempo Real
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Usuários online</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {analyticsData.realTime.onlineUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sessões ativas</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {analyticsData.realTime.activeSessions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'traffic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Métricas de Tráfego
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Visualizações</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.traffic.pageViews)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Visitantes únicos</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.traffic.uniqueVisitors)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de rejeição</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {analyticsData.traffic.bounceRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Tempo médio</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatTime(analyticsData.traffic.avgSessionTime)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Dispositivos
                </h3>
                <div className="space-y-3">
                  {analyticsData.demographics.byDevice.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {device.device === 'Mobile' ? (
                          <Smartphone className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Monitor className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-gray-600 dark:text-gray-400">{device.device}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {device.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'engagement' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Métricas de Engajamento
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Posts criados</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.engagement.postsCreated)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Comentários</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.engagement.commentsCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Curtidas</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.engagement.likesCount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Compartilhamentos</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.engagement.sharesCount)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Engajamento Médio
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {analyticsData.engagement.avgEngagement}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Taxa média de engajamento por post
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'demographics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Por Curso
                </h3>
                <div className="space-y-3">
                  {analyticsData.demographics.byCourse.map((course, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{course.course}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {course.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Por Ano
                </h3>
                <div className="space-y-3">
                  {analyticsData.demographics.byYear.map((year, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{year.year}º ano</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {year.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => exportData('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
          
          <button 
            onClick={() => exportData('pdf')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última atualização: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
