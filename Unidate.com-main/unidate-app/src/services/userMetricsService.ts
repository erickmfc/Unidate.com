import { Badge, UserMetrics, UserAnalytics } from '../types/metrics';

export class UserMetricsService {
  static async getUserBadges(userId: string): Promise<Badge[]> {
    const earnedAt = new Date();
    return [
      {
        id: 'first_share',
        name: 'Primeiro Passo',
        description: 'Compartilhou seu primeiro material',
        icon: '🎯',
        color: 'bg-blue-100 text-blue-800',
        category: 'sharing',
        earnedAt
      },
      {
        id: 'quality_star',
        name: 'Estrela da Qualidade',
        description: 'Média de avaliação acima de 4.0',
        icon: '⭐',
        color: 'bg-yellow-100 text-yellow-800',
        category: 'quality',
        earnedAt
      },
      {
        id: 'engagement_rookie',
        name: 'Conectado',
        description: 'Material com 50+ visualizações',
        icon: '👀',
        color: 'bg-blue-100 text-blue-800',
        category: 'engagement',
        earnedAt
      }
    ];
  }

  static async getUserMetrics(userId: string): Promise<UserMetrics> {
    const badges = await this.getUserBadges(userId);
    return {
      userId,
      materialsShared: 8,
      totalDownloads: 142,
      averageRating: 4.6,
      totalViews: 489,
      badges,
      lastUpdated: new Date()
    };
  }

  static async getUserAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<UserAnalytics> {
    const trendsCount = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12;
    
    const downloadsTrends = Array.from({ length: trendsCount }, (_, i) => ({
      date: new Date(Date.now() - (trendsCount - 1 - i) * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 10) + 1,
      label: period === 'day' ? `${i}h` : `Dia ${i + 1}`
    }));

    const viewsTrends = Array.from({ length: trendsCount }, (_, i) => ({
      date: new Date(Date.now() - (trendsCount - 1 - i) * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 30) + 5,
      label: period === 'day' ? `${i}h` : `Dia ${i + 1}`
    }));

    const ratingsTrends = Array.from({ length: trendsCount }, (_, i) => ({
      date: new Date(Date.now() - (trendsCount - 1 - i) * 24 * 60 * 60 * 1000),
      value: 4 + Math.random(),
      label: period === 'day' ? `${i}h` : `Dia ${i + 1}`
    }));

    return {
      userId,
      period,
      metrics: {
        materialsShared: 8,
        downloadsReceived: 142,
        viewsReceived: 489,
        sharesReceived: 23,
        averageRating: 4.6,
        newBadges: 2
      },
      trends: {
        downloads: downloadsTrends,
        views: viewsTrends,
        ratings: ratingsTrends
      },
      topMaterials: [
        {
          materialId: 'mat_1',
          title: 'Resumo de Cálculo 1 - Limites e Derivadas',
          downloads: 87,
          views: 245,
          rating: 4.8
        },
        {
          materialId: 'mat_2',
          title: 'Álgebra Linear para Engenharia',
          downloads: 42,
          views: 180,
          rating: 4.5
        },
        {
          materialId: 'mat_3',
          title: 'Algoritmos e Estruturas de Dados em C++',
          downloads: 13,
          views: 64,
          rating: 4.2
        }
      ]
    };
  }
}
