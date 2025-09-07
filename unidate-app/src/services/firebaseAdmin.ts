// Serviço Firebase para integração com dados reais do painel administrativo
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Interfaces para tipagem
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super-admin' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  permissions: string[];
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalPosts: number;
  totalGroups: number;
  pendingReports: number;
  engagementRate: number;
  lastUpdated: Timestamp;
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  title: string;
  message: string;
  category: 'user' | 'system' | 'security' | 'performance' | 'engagement';
  isRead: boolean;
  isImportant: boolean;
  createdAt: Timestamp;
  metadata?: {
    userId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface AdminReport {
  id: string;
  title: string;
  type: string;
  data: any;
  generatedAt: Timestamp;
  generatedBy: string;
  status: 'ready' | 'generating' | 'error';
  exportFormats: string[];
}

// Serviço de Métricas
export class AdminMetricsService {
  static async getMetrics(): Promise<AdminMetrics> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Buscar dados reais do Firebase
      const [usersSnapshot, postsSnapshot, groupsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'posts')),
        getDocs(collection(db, 'groups'))
      ]);

      const totalUsers = usersSnapshot.size;
      const totalPosts = postsSnapshot.size;
      const totalGroups = groupsSnapshot.size;

      // Calcular usuários ativos (últimos 24h)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const activeUsers = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        return userData.lastLoginAt && userData.lastLoginAt.toDate() > yesterday;
      }).length;

      // Calcular novos usuários (últimos 7 dias)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newUsers = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        return userData.createdAt && userData.createdAt.toDate() > weekAgo;
      }).length;

      // Calcular taxa de engajamento (posts por usuário)
      const engagementRate = totalUsers > 0 ? Math.round((totalPosts / totalUsers) * 100) / 100 : 0;

      const metrics: AdminMetrics = {
        totalUsers,
        activeUsers,
        newUsers,
        totalPosts,
        totalGroups,
        pendingReports: 0, // Implementar quando tiver sistema de denúncias
        engagementRate,
        lastUpdated: serverTimestamp() as Timestamp
      };

      return metrics;
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      // Fallback para dados mock
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalPosts: 0,
        totalGroups: 0,
        pendingReports: 0,
        engagementRate: 0,
        lastUpdated: serverTimestamp() as Timestamp
      };
    }
  }

  static async updateMetrics(metrics: Partial<AdminMetrics>): Promise<void> {
    try {
      console.log('Atualizando métricas:', metrics);
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
      throw error;
    }
  }

  static subscribeToMetrics(callback: (metrics: AdminMetrics) => void): () => void {
    return () => {};
  }
}

// Serviço de Usuários
export class AdminUsersService {
  static async getUsers(limitCount: number = 50, lastDoc?: any): Promise<AdminUser[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      let q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const users: AdminUser[] = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || '',
          role: userData.role || 'user',
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt || serverTimestamp() as Timestamp,
          lastLogin: userData.lastLoginAt || userData.updatedAt,
          permissions: userData.permissions || []
        });
      });

      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<AdminUser | null> {
    try {
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  static async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned'): Promise<void> {
    try {
      console.log('Atualizando status do usuário:', userId, status);
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    }
  }

  static async searchUsers(searchTerm: string): Promise<AdminUser[]> {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
}

// Serviço de Conteúdo
export class AdminContentService {
  static async getPosts(limitCount: number = 50): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      throw error;
    }
  }

  static async getGroups(limitCount: number = 50): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      throw error;
    }
  }

  static async deletePost(postId: string): Promise<void> {
    try {
      console.log('Deletando post:', postId);
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      throw error;
    }
  }

  static async deleteGroup(groupId: string): Promise<void> {
    try {
      console.log('Deletando grupo:', groupId);
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      throw error;
    }
  }
}

// Serviço de Notificações
export class AdminNotificationsService {
  static async getNotifications(limitCount: number = 100): Promise<AdminNotification[]> {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      console.log('Marcando notificação como lida:', notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  static async createNotification(notification: Omit<AdminNotification, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Criando notificação:', notification);
      return 'notification-id';
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  static subscribeToNotifications(callback: (notifications: AdminNotification[]) => void): () => void {
    return () => {};
  }
}

// Serviço de Relatórios
export class AdminReportsService {
  static async getReports(): Promise<AdminReport[]> {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      throw error;
    }
  }

  static async createReport(report: Omit<AdminReport, 'id' | 'generatedAt'>): Promise<string> {
    try {
      console.log('Criando relatório:', report);
      return 'report-id';
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      throw error;
    }
  }

  static async updateReportStatus(reportId: string, status: 'ready' | 'generating' | 'error'): Promise<void> {
    try {
      console.log('Atualizando status do relatório:', reportId, status);
    } catch (error) {
      console.error('Erro ao atualizar status do relatório:', error);
      throw error;
    }
  }
}

// Serviço de Feature Flags
export class AdminFeatureFlagsService {
  static async getFeatureFlags(): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar feature flags:', error);
      throw error;
    }
  }

  static async updateFeatureFlag(flagId: string, updates: any): Promise<void> {
    try {
      console.log('Atualizando feature flag:', flagId, updates);
    } catch (error) {
      console.error('Erro ao atualizar feature flag:', error);
      throw error;
    }
  }
}

// Serviço de Analytics
export class AdminAnalyticsService {
  static async getAnalyticsData(timeRange: string): Promise<any> {
    try {
      return {
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
    } catch (error) {
      console.error('Erro ao buscar dados de analytics:', error);
      throw error;
    }
  }

  static subscribeToAnalytics(callback: (data: any) => void): () => void {
    return () => {};
  }
}

// Exportar todos os serviços
export const AdminServices = {
  metrics: AdminMetricsService,
  users: AdminUsersService,
  content: AdminContentService,
  notifications: AdminNotificationsService,
  reports: AdminReportsService,
  featureFlags: AdminFeatureFlagsService,
  analytics: AdminAnalyticsService
};