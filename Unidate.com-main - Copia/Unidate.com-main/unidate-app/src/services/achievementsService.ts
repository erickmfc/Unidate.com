import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Achievement, UserAchievement, AchievementProgress, AchievementStats } from '../types/achievements';
import { MaterialsService } from './materialsService';
import { EducationalMaterial } from '../types/materials';

const ACHIEVEMENTS_COLLECTION = 'achievements';
const USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';

// Definição de todas as conquistas
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Sharing
  {
    id: 'first_share',
    title: 'Primeiro Passo',
    description: 'Compartilhou seu primeiro material',
    category: 'sharing',
    icon: '🎯',
    rarity: 'common',
    target: 1,
    type: 'count',
    metric: 'materials_shared'
  },
  {
    id: 'generous_beginner',
    title: 'Iniciante Generoso',
    description: 'Compartilhou 5 materiais',
    category: 'sharing',
    icon: '📚',
    rarity: 'common',
    target: 5,
    type: 'count',
    metric: 'materials_shared'
  },
  {
    id: 'sharing_expert',
    title: 'Especialista em Compartilhar',
    description: 'Compartilhou 25 materiais',
    category: 'sharing',
    icon: '📖',
    rarity: 'rare',
    target: 25,
    type: 'count',
    metric: 'materials_shared'
  },
  {
    id: 'knowledge_master',
    title: 'Mestre do Conhecimento',
    description: 'Compartilhou 100 materiais',
    category: 'sharing',
    icon: '👑',
    rarity: 'epic',
    target: 100,
    type: 'count',
    metric: 'materials_shared'
  },
  
  // Quality
  {
    id: 'quality_star',
    title: 'Estrela da Qualidade',
    description: 'Média de avaliação acima de 4.0',
    category: 'quality',
    icon: '⭐',
    rarity: 'common',
    target: 4.0,
    type: 'average',
    metric: 'average_rating'
  },
  {
    id: 'quality_expert',
    title: 'Especialista em Qualidade',
    description: 'Média de avaliação acima de 4.5',
    category: 'quality',
    icon: '🌟',
    rarity: 'rare',
    target: 4.5,
    type: 'average',
    metric: 'average_rating'
  },
  {
    id: 'excellence_master',
    title: 'Mestre da Excelência',
    description: 'Média de avaliação acima de 4.8',
    category: 'quality',
    icon: '💎',
    rarity: 'epic',
    target: 4.8,
    type: 'average',
    metric: 'average_rating'
  },
  
  // Popularity
  {
    id: 'trending',
    title: 'Em Alta',
    description: 'Material com 100+ downloads',
    category: 'popularity',
    icon: '🔥',
    rarity: 'common',
    target: 100,
    type: 'max',
    metric: 'max_downloads'
  },
  {
    id: 'viral',
    title: 'Viral',
    description: 'Material com 500+ downloads',
    category: 'popularity',
    icon: '🚀',
    rarity: 'rare',
    target: 500,
    type: 'max',
    metric: 'max_downloads'
  },
  {
    id: 'legend',
    title: 'Lenda',
    description: 'Material com 1000+ downloads',
    category: 'popularity',
    icon: '🏆',
    rarity: 'epic',
    target: 1000,
    type: 'max',
    metric: 'max_downloads'
  },
  
  // Engagement
  {
    id: 'connected',
    title: 'Conectado',
    description: 'Material com 50+ visualizações',
    category: 'engagement',
    icon: '👀',
    rarity: 'common',
    target: 50,
    type: 'max',
    metric: 'max_views'
  },
  {
    id: 'influencer',
    title: 'Influenciador',
    description: 'Material com 500+ visualizações',
    category: 'engagement',
    icon: '📈',
    rarity: 'rare',
    target: 500,
    type: 'max',
    metric: 'max_views'
  },
  {
    id: 'celebrity',
    title: 'Celebridade',
    description: 'Material com 2000+ visualizações',
    category: 'engagement',
    icon: '🎭',
    rarity: 'epic',
    target: 2000,
    type: 'max',
    metric: 'max_views'
  },
  
  // Milestone
  {
    id: 'centenary',
    title: 'Centenário',
    description: '100 downloads totais recebidos',
    category: 'milestone',
    icon: '💯',
    rarity: 'common',
    target: 100,
    type: 'total',
    metric: 'total_downloads'
  },
  {
    id: 'thousand',
    title: 'Milésimo',
    description: '1000 downloads totais recebidos',
    category: 'milestone',
    icon: '🎯',
    rarity: 'rare',
    target: 1000,
    type: 'total',
    metric: 'total_downloads'
  },
  {
    id: 'ten_thousand',
    title: 'Dez Mil',
    description: '10000 downloads totais recebidos',
    category: 'milestone',
    icon: '🎊',
    rarity: 'epic',
    target: 10000,
    type: 'total',
    metric: 'total_downloads'
  }
];

export class AchievementsService {
  /**
   * Calcula o progresso real do usuário para uma conquista
   */
  private static async calculateProgress(
    userId: string, 
    achievement: Achievement
  ): Promise<number> {
    try {
      // Buscar todos os materiais do usuário
      if (!db) {
        return 0;
      }
      
      const q = query(
        collection(db, 'materials'),
        where('authorId', '==', userId),
        where('isApproved', '==', true)
      );
      const snapshot = await getDocs(q);
      const userMaterials: EducationalMaterial[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ratings: data.ratings?.map((r: any) => ({
            ...r,
            createdAt: r.createdAt?.toDate() || new Date()
          })) || [],
          downloads: data.downloads?.map((d: any) => ({
            ...d,
            downloadedAt: d.downloadedAt?.toDate() || new Date()
          })) || [],
        } as EducationalMaterial;
      });
      
      if (userMaterials.length === 0) {
        return 0;
      }

      switch (achievement.metric) {
        case 'materials_shared':
          return userMaterials.length;
          
        case 'average_rating':
          // Calcular média apenas de materiais que têm avaliações
          const materialsWithRatings = userMaterials.filter(m => m.averageRating > 0);
          if (materialsWithRatings.length === 0) {
            return 0;
          }
          const totalRating = materialsWithRatings.reduce((sum, m) => sum + (m.averageRating || 0), 0);
          return totalRating / materialsWithRatings.length;
          
        case 'max_downloads':
          const downloads = userMaterials.map(m => m.totalDownloads || 0);
          return downloads.length > 0 ? Math.max(...downloads) : 0;
          
        case 'max_views':
          const views = userMaterials.map(m => m.views || 0);
          return views.length > 0 ? Math.max(...views) : 0;
          
        case 'total_downloads':
          return userMaterials.reduce((sum, m) => sum + (m.totalDownloads || 0), 0);
          
        default:
          return 0;
      }
    } catch (error) {
      console.error('Erro ao calcular progresso:', error);
      return 0;
    }
  }

  /**
   * Atualiza o progresso de todas as conquistas do usuário
   */
  static async updateUserAchievements(userId: string): Promise<AchievementProgress[]> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const progressList: AchievementProgress[] = [];

      for (const achievement of ALL_ACHIEVEMENTS) {
        const progress = await this.calculateProgress(userId, achievement);
        const isUnlocked = progress >= achievement.target;

        // Buscar ou criar registro de conquista do usuário
        const userAchievementRef = doc(
          db, 
          USER_ACHIEVEMENTS_COLLECTION, 
          `${userId}_${achievement.id}`
        );
        
        const userAchievementSnap = await getDoc(userAchievementRef);
        
        let unlockedAt: Date | undefined;
        let wasUnlocked = false;

        if (userAchievementSnap.exists()) {
          const data = userAchievementSnap.data();
          wasUnlocked = data.isUnlocked;
          if (data.unlockedAt) {
            unlockedAt = data.unlockedAt.toDate();
          }
        }

        // Se acabou de desbloquear
        if (isUnlocked && !wasUnlocked) {
          unlockedAt = new Date();
        }

        // Salvar no Firebase
        await setDoc(userAchievementRef, {
          achievementId: achievement.id,
          userId,
          progress,
          isUnlocked,
          unlockedAt: unlockedAt ? Timestamp.fromDate(unlockedAt) : null,
          lastUpdated: serverTimestamp()
        }, { merge: true });

        progressList.push({
          achievement,
          progress,
          target: achievement.target,
          isUnlocked,
          unlockedAt,
          percentage: Math.min((progress / achievement.target) * 100, 100)
        });
      }

      return progressList;
    } catch (error) {
      console.error('Erro ao atualizar conquistas:', error);
      throw new Error('Falha ao atualizar conquistas');
    }
  }

  /**
   * Obtém todas as conquistas do usuário com progresso
   */
  static async getUserAchievements(userId: string): Promise<AchievementProgress[]> {
    try {
      return await this.updateUserAchievements(userId);
    } catch (error) {
      console.error('Erro ao obter conquistas:', error);
      throw new Error('Falha ao obter conquistas');
    }
  }

  /**
   * Obtém estatísticas de conquistas do usuário
   */
  static async getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      const stats: AchievementStats = {
        total: achievements.length,
        unlocked: achievements.filter(a => a.isUnlocked).length,
        byCategory: {
          sharing: { total: 0, unlocked: 0 },
          quality: { total: 0, unlocked: 0 },
          popularity: { total: 0, unlocked: 0 },
          engagement: { total: 0, unlocked: 0 },
          milestone: { total: 0, unlocked: 0 }
        }
      };

      achievements.forEach(achievement => {
        const category = achievement.achievement.category;
        stats.byCategory[category].total++;
        if (achievement.isUnlocked) {
          stats.byCategory[category].unlocked++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  /**
   * Verifica e atualiza conquistas após uma ação do usuário
   * Deve ser chamado após: compartilhar material, receber download, receber avaliação, etc.
   */
  static async checkAchievementsAfterAction(userId: string): Promise<void> {
    try {
      await this.updateUserAchievements(userId);
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  }
}

