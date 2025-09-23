export interface MaterialMetrics {
  materialId: string;
  downloads: number;
  averageRating: number;
  totalRatings: number;
  views: number;
  shares: number;
  comments: number;
  lastUpdated: Date;
}

export interface UserMetrics {
  userId: string;
  materialsShared: number;
  totalDownloads: number;
  averageRating: number;
  totalViews: number;
  badges: Badge[];
  lastUpdated: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: BadgeCategory;
  earnedAt: Date;
  progress?: number;
  maxProgress?: number;
}

export type BadgeCategory = 
  | 'sharing' 
  | 'quality' 
  | 'popularity' 
  | 'engagement' 
  | 'milestone';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: BadgeCategory;
  condition: BadgeCondition;
  isHidden?: boolean;
}

export interface BadgeCondition {
  type: 'downloads' | 'ratings' | 'shares' | 'materials' | 'views' | 'average_rating';
  operator: 'gte' | 'lte' | 'eq';
  value: number;
  timeframe?: 'all_time' | 'month' | 'week';
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalMaterials: number;
    totalDownloads: number;
    totalViews: number;
    totalShares: number;
    averageRating: number;
    newUsers: number;
    activeUsers: number;
  };
  trends: {
    materials: TimeSeriesData[];
    downloads: TimeSeriesData[];
    views: TimeSeriesData[];
    shares: TimeSeriesData[];
  };
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface UserAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    materialsShared: number;
    downloadsReceived: number;
    viewsReceived: number;
    sharesReceived: number;
    averageRating: number;
    newBadges: number;
  };
  trends: {
    downloads: TimeSeriesData[];
    views: TimeSeriesData[];
    ratings: TimeSeriesData[];
  };
  topMaterials: {
    materialId: string;
    title: string;
    downloads: number;
    views: number;
    rating: number;
  }[];
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_share',
    name: 'Primeiro Passo',
    description: 'Compartilhou seu primeiro material',
    icon: '🎯',
    color: 'bg-blue-100 text-blue-800',
    category: 'sharing',
    condition: { type: 'materials', operator: 'gte', value: 1 }
  },
  {
    id: 'sharing_rookie',
    name: 'Iniciante Generoso',
    description: 'Compartilhou 5 materiais',
    icon: '📚',
    color: 'bg-green-100 text-green-800',
    category: 'sharing',
    condition: { type: 'materials', operator: 'gte', value: 5 }
  },
  {
    id: 'sharing_expert',
    name: 'Especialista em Compartilhar',
    description: 'Compartilhou 25 materiais',
    icon: '📖',
    color: 'bg-purple-100 text-purple-800',
    category: 'sharing',
    condition: { type: 'materials', operator: 'gte', value: 25 }
  },
  {
    id: 'sharing_master',
    name: 'Mestre do Conhecimento',
    description: 'Compartilhou 100 materiais',
    icon: '👑',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'sharing',
    condition: { type: 'materials', operator: 'gte', value: 100 }
  },

  {
    id: 'quality_star',
    name: 'Estrela da Qualidade',
    description: 'Média de avaliação acima de 4.0',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'quality',
    condition: { type: 'average_rating', operator: 'gte', value: 4.0 }
  },
  {
    id: 'quality_expert',
    name: 'Especialista em Qualidade',
    description: 'Média de avaliação acima de 4.5',
    icon: '🌟',
    color: 'bg-orange-100 text-orange-800',
    category: 'quality',
    condition: { type: 'average_rating', operator: 'gte', value: 4.5 }
  },
  {
    id: 'quality_master',
    name: 'Mestre da Excelência',
    description: 'Média de avaliação acima de 4.8',
    icon: '💎',
    color: 'bg-red-100 text-red-800',
    category: 'quality',
    condition: { type: 'average_rating', operator: 'gte', value: 4.8 }
  },

  {
    id: 'popular_rookie',
    name: 'Em Alta',
    description: 'Material com 100+ downloads',
    icon: '🔥',
    color: 'bg-red-100 text-red-800',
    category: 'popularity',
    condition: { type: 'downloads', operator: 'gte', value: 100 }
  },
  {
    id: 'popular_expert',
    name: 'Viral',
    description: 'Material com 500+ downloads',
    icon: '🚀',
    color: 'bg-orange-100 text-orange-800',
    category: 'popularity',
    condition: { type: 'downloads', operator: 'gte', value: 500 }
  },
  {
    id: 'popular_master',
    name: 'Lenda',
    description: 'Material com 1000+ downloads',
    icon: '🏆',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'popularity',
    condition: { type: 'downloads', operator: 'gte', value: 1000 }
  },

  {
    id: 'engagement_rookie',
    name: 'Conectado',
    description: 'Material com 50+ visualizações',
    icon: '👀',
    color: 'bg-blue-100 text-blue-800',
    category: 'engagement',
    condition: { type: 'views', operator: 'gte', value: 50 }
  },
  {
    id: 'engagement_expert',
    name: 'Influenciador',
    description: 'Material com 500+ visualizações',
    icon: '📈',
    color: 'bg-green-100 text-green-800',
    category: 'engagement',
    condition: { type: 'views', operator: 'gte', value: 500 }
  },
  {
    id: 'engagement_master',
    name: 'Celebridade',
    description: 'Material com 2000+ visualizações',
    icon: '🎭',
    color: 'bg-purple-100 text-purple-800',
    category: 'engagement',
    condition: { type: 'views', operator: 'gte', value: 2000 }
  },

  {
    id: 'milestone_100_downloads',
    name: 'Centenário',
    description: '100 downloads totais recebidos',
    icon: '💯',
    color: 'bg-indigo-100 text-indigo-800',
    category: 'milestone',
    condition: { type: 'downloads', operator: 'gte', value: 100 }
  },
  {
    id: 'milestone_1000_downloads',
    name: 'Milésimo',
    description: '1000 downloads totais recebidos',
    icon: '🎯',
    color: 'bg-pink-100 text-pink-800',
    category: 'milestone',
    condition: { type: 'downloads', operator: 'gte', value: 1000 }
  },
  {
    id: 'milestone_10000_downloads',
    name: 'Dez Mil',
    description: '10000 downloads totais recebidos',
    icon: '🎊',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'milestone',
    condition: { type: 'downloads', operator: 'gte', value: 10000 }
  }
];

export const BADGE_CATEGORY_COLORS: Record<BadgeCategory, string> = {
  sharing: 'bg-blue-100 text-blue-800',
  quality: 'bg-yellow-100 text-yellow-800',
  popularity: 'bg-red-100 text-red-800',
  engagement: 'bg-green-100 text-green-800',
  milestone: 'bg-purple-100 text-purple-800',
};

export const BADGE_CATEGORY_ICONS: Record<BadgeCategory, string> = {
  sharing: '📚',
  quality: '⭐',
  popularity: '🔥',
  engagement: '📈',
  milestone: '🏆',
};