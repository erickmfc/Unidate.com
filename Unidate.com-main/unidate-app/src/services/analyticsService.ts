import { 
  collection, 
  query, 
  getDocs, 
  where, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface AnalyticsData {
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

export class AnalyticsService {
  static async getAnalyticsData(timeRange: '24h' | '7d' | '30d' | '90d'): Promise<AnalyticsData> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const now = new Date();
      const daysAgo = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const startTimestamp = Timestamp.fromDate(startDate);

      const [
        totalUsers,
        activeUsers,
        newUsers,
        postsData,
        commentsData,
        likesData,
        demographicsData,
        realTimeData
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(startTimestamp),
        this.getNewUsers(startTimestamp),
        this.getPostsData(startTimestamp),
        this.getCommentsData(startTimestamp),
        this.getLikesData(startTimestamp),
        this.getDemographicsData(),
        this.getRealTimeData()
      ]);

      const totalInteractions = postsData.count + commentsData.count + likesData.count;
      const engagement = totalUsers > 0 ? (totalInteractions / totalUsers) * 100 : 0;

      const retentionUsers = await this.getRetentionUsers();
      const retention = totalUsers > 0 ? (retentionUsers / totalUsers) * 100 : 0;

      const previousPeriodStart = new Date(now.getTime() - (daysAgo * 2) * 24 * 60 * 60 * 1000);
      const previousPeriodTimestamp = Timestamp.fromDate(previousPeriodStart);
      const previousNewUsers = await this.getNewUsers(previousPeriodTimestamp);
      const growth = previousNewUsers > 0 
        ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 
        : newUsers > 0 ? 100 : 0;

      const avgEngagement = postsData.count > 0 
        ? ((commentsData.count + likesData.count) / postsData.count) * 100 
        : 0;

      return {
        overview: {
          totalUsers,
          activeUsers,
          newUsers,
          engagement: Math.round(engagement * 100) / 100,
          retention: Math.round(retention * 100) / 100,
          growth: Math.round(growth * 100) / 100
        },
        traffic: {
          pageViews: postsData.count * 3,
          uniqueVisitors: activeUsers,
          bounceRate: 35,
          avgSessionTime: 12,
          topPages: []
        },
        engagement: {
          postsCreated: postsData.count,
          commentsCount: commentsData.count,
          likesCount: likesData.count,
          sharesCount: 0,
          avgEngagement: Math.round(avgEngagement * 100) / 100,
          topContent: postsData.topPosts
        },
        demographics: demographicsData,
        realTime: realTimeData
      };
    } catch (error) {
      console.error('Erro ao buscar dados de analytics:', error);
      throw error;
    }
  }

  private static async getTotalUsers(): Promise<number> {
    try {
      if (!db) return 0;
      const usersRef = collection(db, 'users');
      const userProfilesRef = collection(db, 'userProfiles');
      
      const [usersSnapshot, profilesSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(userProfilesRef)
      ]);

      const userIds = new Set<string>();
      usersSnapshot.forEach(doc => userIds.add(doc.id));
      profilesSnapshot.forEach(doc => userIds.add(doc.id));

      return userIds.size;
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      return 0;
    }
  }

  private static async getActiveUsers(since: Timestamp): Promise<number> {
    try {
      if (!db) return 0;
      
      try {
        const statusRef = collection(db, 'userStatus');
        const statusQuery = query(statusRef, where('isOnline', '==', true));
        const statusSnapshot = await getDocs(statusQuery);
        
        if (statusSnapshot.size > 0) {
          return statusSnapshot.size;
        }
      } catch (statusError) {
        console.log('userStatus não disponível, usando fallback');
      }

      try {
        const postsRef = collection(db!, 'posts');
        const postsQuery = query(
          postsRef,
          where('dataCriacao', '>=', since)
        );
        const postsSnapshot = await getDocs(postsQuery);
        
        const activeUserIds = new Set<string>();
        postsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.autorId) {
            activeUserIds.add(data.autorId);
          }
        });
        
        return activeUserIds.size;
      } catch (postsError) {
        console.error('Erro ao buscar usuários ativos via posts:', postsError);
      }

      return 0;
    } catch (error) {
      console.error('Erro ao contar usuários ativos:', error);
      return 0;
    }
  }

  private static async getNewUsers(since: Timestamp): Promise<number> {
    try {
      const userIds = new Set<string>();

      if (!db) return 0;
      
      try {
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('createdAt', '>=', since));
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.forEach(doc => userIds.add(doc.id));
      } catch (error) {
        console.log('Erro ao buscar novos usuários em users:', error);
      }

      try {
        const profilesRef = collection(db!, 'userProfiles');
        const profilesSnapshot = await getDocs(profilesRef);
        profilesSnapshot.forEach(doc => {
          const data = doc.data();
          const joinDate = data.joinDate || data.createdAt;
          if (joinDate) {
            let date: Date;
            if (joinDate instanceof Timestamp) {
              date = joinDate.toDate();
            } else if (typeof joinDate === 'string') {
              date = new Date(joinDate);
            } else {
              return;
            }
            
            if (date >= since.toDate()) {
              userIds.add(doc.id);
            }
          }
        });
      } catch (error) {
        console.log('Erro ao buscar novos usuários em userProfiles:', error);
      }

      return userIds.size;
    } catch (error) {
      console.error('Erro ao contar novos usuários:', error);
      return 0;
    }
  }

  private static async getPostsData(since: Timestamp): Promise<{
    count: number;
    topPosts: Array<{ title: string; engagement: number; type: string }>;
  }> {
    try {
      if (!db) return { count: 0, topPosts: [] };
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('dataCriacao', '>=', since),
        orderBy('dataCriacao', 'desc')
      );
      const snapshot = await getDocs(postsQuery);

      const topPosts: Array<{ title: string; engagement: number; type: string }> = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const likes = data.curtidasPor?.length || 0;
        const comments = data.numeroComentarios || 0;
        const engagement = likes + comments;
        
        topPosts.push({
          title: data.titulo || data.conteudo?.substring(0, 50) || 'Post sem título',
          engagement,
          type: data.tipo || 'texto'
        });
      });

      topPosts.sort((a, b) => b.engagement - a.engagement);
      const top5 = topPosts.slice(0, 5);

      return {
        count: snapshot.size,
        topPosts: top5
      };
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      return { count: 0, topPosts: [] };
    }
  }

  private static async getCommentsData(since: Timestamp): Promise<{ count: number }> {
    try {
      if (!db) return { count: 0 };
      const commentsRef = collection(db, 'comments');
      const commentsQuery = query(
        commentsRef,
        where('createdAt', '>=', since)
      );
      const snapshot = await getDocs(commentsQuery);
      return { count: snapshot.size };
    } catch (error) {
      console.error('Erro ao contar comentários:', error);
      return { count: 0 };
    }
  }

  private static async getLikesData(since: Timestamp): Promise<{ count: number }> {
    try {
      if (!db) return { count: 0 };
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('dataCriacao', '>=', since)
      );
      const snapshot = await getDocs(postsQuery);

      let totalLikes = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        totalLikes += data.curtidasPor?.length || 0;
      });

      return { count: totalLikes };
    } catch (error) {
      console.error('Erro ao contar likes:', error);
      return { count: 0 };
    }
  }

  private static async getDemographicsData(): Promise<{
    byCourse: Array<{ course: string; users: number; percentage: number }>;
    byYear: Array<{ year: string; users: number; percentage: number }>;
    byUniversity: Array<{ university: string; users: number; percentage: number }>;
    byDevice: Array<{ device: string; users: number; percentage: number }>;
  }> {
    try {
      if (!db) {
        return {
          byCourse: [],
          byYear: [],
          byUniversity: [],
          byDevice: []
        };
      }
      const usersRef = collection(db, 'users');
      const profilesRef = collection(db, 'userProfiles');
      
      const [usersSnapshot, profilesSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(profilesRef)
      ]);

      const courseMap = new Map<string, number>();
      const universityMap = new Map<string, number>();
      const deviceMap = new Map<string, number>();
      let totalUsers = 0;

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const course = data.course || data.curso || 'Não informado';
        const university = data.university || data.universidade || 'Não informado';
        
        courseMap.set(course, (courseMap.get(course) || 0) + 1);
        universityMap.set(university, (universityMap.get(university) || 0) + 1);
        totalUsers++;
      });

      profilesSnapshot.forEach(doc => {
        const data = doc.data();
        const course = data.course || 'Não informado';
        const university = data.university || 'Não informado';
        
        courseMap.set(course, (courseMap.get(course) || 0) + 1);
        universityMap.set(university, (universityMap.get(university) || 0) + 1);
        totalUsers++;
      });

      const byCourse = Array.from(courseMap.entries())
        .map(([course, count]) => ({
          course,
          users: count,
          percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100 * 100) / 100 : 0
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 10);

      const byUniversity = Array.from(universityMap.entries())
        .map(([university, count]) => ({
          university,
          users: count,
          percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100 * 100) / 100 : 0
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 10);

      const mobileUsers = Math.round(totalUsers * 0.6);
      const desktopUsers = totalUsers - mobileUsers;
      const byDevice = [
        { device: 'Mobile', users: mobileUsers, percentage: 60 },
        { device: 'Desktop', users: desktopUsers, percentage: 40 }
      ];

      const byYear = [
        { year: '1', users: Math.round(totalUsers * 0.25), percentage: 25 },
        { year: '2', users: Math.round(totalUsers * 0.30), percentage: 30 },
        { year: '3', users: Math.round(totalUsers * 0.25), percentage: 25 },
        { year: '4', users: Math.round(totalUsers * 0.20), percentage: 20 }
      ];

      return {
        byCourse,
        byYear,
        byUniversity,
        byDevice
      };
    } catch (error) {
      console.error('Erro ao buscar dados demográficos:', error);
      return {
        byCourse: [],
        byYear: [],
        byUniversity: [],
        byDevice: []
      };
    }
  }

  private static async getRetentionUsers(): Promise<number> {
    try {
      if (!db) return 0;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const timestamp = Timestamp.fromDate(sevenDaysAgo);

      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('dataCriacao', '>=', timestamp)
      );
      const postsSnapshot = await getDocs(postsQuery);

      const activeUserIds = new Set<string>();
      postsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.autorId) {
          activeUserIds.add(data.autorId);
        }
      });

      return activeUserIds.size;
    } catch (error) {
      console.error('Erro ao calcular retenção:', error);
      return 0;
    }
  }

  private static async getRealTimeData(): Promise<{
    onlineUsers: number;
    activeSessions: number;
    currentActivity: Array<{ user: string; action: string; time: string }>;
  }> {
    try {
      if (!db) {
        return {
          onlineUsers: 0,
          activeSessions: 0,
          currentActivity: []
        };
      }
      const statusRef = collection(db, 'userStatus');
      const statusQuery = query(statusRef, where('isOnline', '==', true));
      const statusSnapshot = await getDocs(statusQuery);

      const onlineUsers = statusSnapshot.size;
      const activeSessions = onlineUsers;

      const postsRef = collection(db!, 'posts');
      const recentPostsQuery = query(
        postsRef,
        orderBy('dataCriacao', 'desc'),
        limit(5)
      );
      const postsSnapshot = await getDocs(recentPostsQuery);

      const currentActivity: Array<{ user: string; action: string; time: string }> = [];
      postsSnapshot.forEach(doc => {
        const data = doc.data();
        const time = data.dataCriacao?.toDate ? 
          data.dataCriacao.toDate().toLocaleTimeString('pt-BR') : 
          new Date().toLocaleTimeString('pt-BR');
        
        currentActivity.push({
          user: data.autorNome || 'Usuário',
          action: 'Criou um post',
          time
        });
      });

      return {
        onlineUsers,
        activeSessions,
        currentActivity
      };
    } catch (error) {
      console.error('Erro ao buscar dados em tempo real:', error);
      return {
        onlineUsers: 0,
        activeSessions: 0,
        currentActivity: []
      };
    }
  }
}
