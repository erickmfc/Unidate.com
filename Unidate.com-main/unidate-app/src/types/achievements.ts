export type AchievementCategory = 'sharing' | 'quality' | 'popularity' | 'engagement' | 'milestone';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string; // Emoji ou nome do ícone
  rarity: AchievementRarity;
  target: number; // Meta para desbloquear
  type: 'count' | 'average' | 'max' | 'total'; // Tipo de cálculo
  metric: 'materials_shared' | 'average_rating' | 'max_downloads' | 'max_views' | 'total_downloads';
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  lastUpdated: Date;
}

export interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  target: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  percentage: number;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
}

