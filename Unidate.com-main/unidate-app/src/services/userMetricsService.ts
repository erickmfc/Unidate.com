import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  UserMetrics, 
  Badge, 
  BadgeDefinition, 
  BADGE_DEFINITIONS,
  UserAnalytics,
  TimeSeriesData
} from '../types/metrics';
import { EducationalMaterial } from '../types/materials';
import { MaterialsService } from './materialsService';

const USER_METRICS_COLLECTION = 'userMetrics';
const USER_BADGES_COLLECTION = 'userBadges';

export class UserMetricsService {
  static async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(db, USER_METRICS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId: docSnap.id,
          materialsShared: data.materialsShared || 0,
          totalDownloads: data.totalDownloads || 0,
          averageRating: data.averageRating || 0,
          totalViews: data.totalViews || 0,
          badges: data.badges || [],
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as UserMetrics;
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter métricas do usuário:', error);
      throw new Error('Falha ao obter métricas do usuário');
    }
  }

  static async calculateUserMetrics(userId: string): Promise<UserMetrics> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const userMaterials = await MaterialsService.getMaterialsByUser(userId);
      
      const materialsShared = userMaterials.length;
      const totalDownloads = userMaterials.reduce((sum, material) => sum + material.totalDownloads, 0);
      const totalViews = userMaterials.reduce((sum, material) => sum + material.views, 0);
      
      const materialsWithRatings = userMaterials.filter(m => m.averageRating > 0);
      const averageRating = materialsWithRatings.length > 0 
        ? materialsWithRatings.reduce((sum, material) => sum + material.averageRating, 0) / materialsWithRatings.length
        : 0;

      const badges = await this.checkAndGrantBadges(userId, {
        materialsShared,
        totalDownloads,
        averageRating,
        totalViews
      });

      const metrics: UserMetrics = {
        userId,
        materialsShared,
        totalDownloads,
        averageRating: Math.round(averageRating * 10) / 10,
        totalViews,
        badges,
        lastUpdated: new Date(),
      };

      await this.saveUserMetrics(metrics);

      return metrics;
    } catch (error) {
      console.error('Erro ao calcular métricas do usuário:', error);
      throw new Error('Falha ao calcular métricas do usuário');
    }
  }

  static async saveUserMetrics(metrics: UserMetrics): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(db, USER_METRICS_COLLECTION, metrics.userId);
      await setDoc(docRef, {
        ...metrics,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao salvar métricas do usuário:', error);
      throw new Error('Falha ao salvar métricas do usuário');
    }
  }

  static async checkAndGrantBadges(
    userId: string, 
    currentMetrics: {
      materialsShared: number;
      totalDownloads: number;
      averageRating: number;
      totalViews: number;
    }
  ): Promise<Badge[]> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const existingBadges = await this.getUserBadges(userId);
      const existingBadgeIds = existingBadges.map(badge => badge.id);

      const newBadges: Badge[] = [];

      for (const badgeDef of BADGE_DEFINITIONS) {
        if (existingBadgeIds.includes(badgeDef.id)) {
          continue; // Badge já concedido
        }

        if (this.checkBadgeCondition(badgeDef.condition, currentMetrics)) {
          const newBadge: Badge = {
            id: badgeDef.id,
            name: badgeDef.name,
            description: badgeDef.description,
            icon: badgeDef.icon,
            color: badgeDef.color,
            category: badgeDef.category,
            earnedAt: new Date(),
          };

          newBadges.push(newBadge);
        }
      }

      if (newBadges.length > 0) {
        await this.saveUserBadges(userId, [...existingBadges, ...newBadges]);
      }

      return [...existingBadges, ...newBadges];
    } catch (error) {
      console.error('Erro ao verificar badges:', error);
      return [];
    }
  }

  private static checkBadgeCondition(
    condition: any, 
    metrics: {
      materialsShared: number;
      totalDownloads: number;
      averageRating: number;
      totalViews: number;
    }
  ): boolean {
    let value: number;

    switch (condition.type) {
      case 'materials':
        value = metrics.materialsShared;
        break;
      case 'downloads':
        value = metrics.totalDownloads;
        break;
      case 'average_rating':
        value = metrics.averageRating;
        break;
      case 'views':
        value = metrics.totalViews;
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'gte':
        return value >= condition.value;
      case 'lte':
        return value <= condition.value;
      case 'eq':
        return value === condition.value;
      default:
        return false;
    }
  }

  static async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(db, USER_BADGES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return (data.badges || []).map((badge: any) => ({
          ...badge,
          earnedAt: badge.earnedAt?.toDate() || new Date(),
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro ao obter badges do usuário:', error);
      return [];
    }
  }

  static async saveUserBadges(userId: string, badges: Badge[]): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(db, USER_BADGES_COLLECTION, userId);
      await setDoc(docRef, {
        userId,
        badges,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao salvar badges do usuário:', error);
      throw new Error('Falha ao salvar badges do usuário');
    }
  }

  static async getUserAnalytics(
    userId: string, 
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<UserAnalytics> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const userMaterials = await MaterialsService.getMaterialsByUser(userId);
      
      const endDate = new Date();
      const startDate = this.getStartDateForPeriod(period, endDate);

      const periodMaterials = userMaterials.filter(material => 
        material.createdAt >= startDate
      );

      const metrics = {
        materialsShared: periodMaterials.length,
        downloadsReceived: periodMaterials.reduce((sum, material) => sum + material.totalDownloads, 0),
        viewsReceived: periodMaterials.reduce((sum, material) => sum + material.views, 0),
        sharesReceived: periodMaterials.reduce((sum, material) => sum + (material.totalDownloads || 0), 0), // Aproximação
        averageRating: periodMaterials.length > 0 
          ? periodMaterials.reduce((sum, material) => sum + material.averageRating, 0) / periodMaterials.length
          : 0,
        newBadges: 0,
      };

      const topMaterials = userMaterials
        .sort((a, b) => b.totalDownloads - a.totalDownloads)
        .slice(0, 5)
        .map(material => ({
          materialId: material.id,
          title: material.title,
          downloads: material.totalDownloads,
          views: material.views,
          rating: material.averageRating,
        }));

      const trends = this.generateTrendData(period, startDate, endDate, userMaterials);

      return {
        userId,
        period,
        metrics,
        trends,
        topMaterials,
      };
    } catch (error) {
      console.error('Erro ao obter analytics do usuário:', error);
      throw new Error('Falha ao obter analytics do usuário');
    }
  }

  private static getStartDateForPeriod(
    period: 'day' | 'week' | 'month' | 'year', 
    endDate: Date
  ): Date {
    const startDate = new Date(endDate);
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return startDate;
  }

  private static generateTrendData(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date,
    materials: EducationalMaterial[]
  ): {
    downloads: TimeSeriesData[];
    views: TimeSeriesData[];
    ratings: TimeSeriesData[];
  } {
    const downloads: TimeSeriesData[] = [];
    const views: TimeSeriesData[] = [];
    const ratings: TimeSeriesData[] = [];

    const interval = this.getIntervalForPeriod(period);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setTime(nextDate.getTime() + interval);

      const periodMaterials = materials.filter(material => 
        material.createdAt >= currentDate && material.createdAt < nextDate
      );

      downloads.push({
        date: new Date(currentDate),
        value: periodMaterials.reduce((sum, material) => sum + material.totalDownloads, 0),
      });

      views.push({
        date: new Date(currentDate),
        value: periodMaterials.reduce((sum, material) => sum + material.views, 0),
      });

      ratings.push({
        date: new Date(currentDate),
        value: periodMaterials.length > 0 
          ? periodMaterials.reduce((sum, material) => sum + material.averageRating, 0) / periodMaterials.length
          : 0,
      });

      currentDate.setTime(currentDate.getTime() + interval);
    }

    return { downloads, views, ratings };
  }

  private static getIntervalForPeriod(period: 'day' | 'week' | 'month' | 'year'): number {
    switch (period) {
      case 'day':
        return 24 * 60 * 60 * 1000; // 1 dia
      case 'week':
        return 7 * 24 * 60 * 60 * 1000; // 1 semana
      case 'month':
        return 30 * 24 * 60 * 60 * 1000; // 30 dias
      case 'year':
        return 365 * 24 * 60 * 60 * 1000; // 1 ano
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  static async updateMetricsOnMaterialChange(userId: string): Promise<void> {
    try {
      await this.calculateUserMetrics(userId);
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  }

  static async getUserRankings(limit: number = 10): Promise<{
    byDownloads: UserMetrics[];
    byMaterials: UserMetrics[];
    byRating: UserMetrics[];
  }> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const q = query(collection(db, USER_METRICS_COLLECTION));
      const snapshot = await getDocs(q);
      
      const allMetrics: UserMetrics[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allMetrics.push({
          userId: doc.id,
          materialsShared: data.materialsShared || 0,
          totalDownloads: data.totalDownloads || 0,
          averageRating: data.averageRating || 0,
          totalViews: data.totalViews || 0,
          badges: data.badges || [],
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        });
      });

      return {
        byDownloads: allMetrics
          .sort((a, b) => b.totalDownloads - a.totalDownloads)
          .slice(0, limit),
        byMaterials: allMetrics
          .sort((a, b) => b.materialsShared - a.materialsShared)
          .slice(0, limit),
        byRating: allMetrics
          .filter(m => m.averageRating > 0)
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, limit),
      };
    } catch (error) {
      console.error('Erro ao obter rankings:', error);
      throw new Error('Falha ao obter rankings');
    }
  }
}
