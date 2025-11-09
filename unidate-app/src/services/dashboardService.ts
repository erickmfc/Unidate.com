import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

export interface UserStats {
  matches: number;
  posts: number;
  groups: number;
  messages: number;
  totalLikes: number;
  profileCompletion: number;
}

export interface RecentActivity {
  id: string;
  type: 'post' | 'group' | 'match' | 'message';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

export class DashboardService {
  // Buscar estatísticas completas do usuário
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('📊 Buscando estatísticas do usuário:', userId);

      // Buscar todas as estatísticas em paralelo
      const [
        matchesCount,
        postsCount,
        groupsCount,
        messagesCount,
        totalLikes,
        profileCompletion
      ] = await Promise.all([
        this.getMatchesCount(userId),
        this.getPostsCount(userId),
        this.getGroupsCount(userId),
        this.getMessagesCount(userId),
        this.getTotalLikes(userId),
        this.getProfileCompletion(userId)
      ]);

      const stats: UserStats = {
        matches: matchesCount,
        posts: postsCount,
        groups: groupsCount,
        messages: messagesCount,
        totalLikes,
        profileCompletion
      };

      console.log('✅ Estatísticas carregadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        matches: 0,
        posts: 0,
        groups: 0,
        messages: 0,
        totalLikes: 0,
        profileCompletion: 0
      };
    }
  }

  // Contar matches do usuário
  private static async getMatchesCount(userId: string): Promise<number> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return 0;
      }

      // Buscar na coleção de matches onde o usuário está envolvido
      const matchesQuery = query(
        collection(db, 'matches'),
        where('participants', 'array-contains', userId)
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      return matchesSnapshot.size;
    } catch (error) {
      console.error('❌ Erro ao contar matches:', error);
      return 0;
    }
  }

  // Contar posts do usuário
  private static async getPostsCount(userId: string): Promise<number> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return 0;
      }

      const postsQuery = query(
        collection(db, 'posts'),
        where('autorId', '==', userId)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      return postsSnapshot.size;
    } catch (error) {
      console.error('❌ Erro ao contar posts:', error);
      return 0;
    }
  }

  // Contar grupos do usuário
  private static async getGroupsCount(userId: string): Promise<number> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return 0;
      }

      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      return groupsSnapshot.size;
    } catch (error) {
      console.error('❌ Erro ao contar grupos:', error);
      return 0;
    }
  }

  // Contar mensagens do usuário
  private static async getMessagesCount(userId: string): Promise<number> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return 0;
      }

      // Contar mensagens em grupos
      const groupMessagesQuery = query(
        collection(db, 'groupMessages'),
        where('userId', '==', userId)
      );
      
      const groupMessagesSnapshot = await getDocs(groupMessagesQuery);
      
      // Contar mensagens em chats privados
      const privateMessagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', userId)
      );
      
      const privateMessagesSnapshot = await getDocs(privateMessagesQuery);
      
      return groupMessagesSnapshot.size + privateMessagesSnapshot.size;
    } catch (error) {
      console.error('❌ Erro ao contar mensagens:', error);
      return 0;
    }
  }

  // Contar total de curtidas recebidas
  private static async getTotalLikes(userId: string): Promise<number> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return 0;
      }

      const postsQuery = query(
        collection(db, 'posts'),
        where('autorId', '==', userId)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      let totalLikes = 0;
      
      postsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalLikes += (data.curtidasPor?.length || 0);
      });
      
      return totalLikes;
    } catch (error) {
      console.error('❌ Erro ao contar curtidas:', error);
      return 0;
    }
  }

  // Calcular completude do perfil
  private static async getProfileCompletion(userId: string): Promise<number> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return 0;
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return 0;
      }
      
      const userData = userDoc.data();
      let completion = 0;
      
      // Campos obrigatórios (cada um vale 20%)
      if (userData.displayName) completion += 20;
      if (userData.photoURL) completion += 20;
      if (userData.course || userData.curso) completion += 20;
      if (userData.university || userData.universidade) completion += 20;
      if (userData.bio) completion += 20;
      
      return Math.min(completion, 100);
    } catch (error) {
      console.error('❌ Erro ao calcular completude do perfil:', error);
      return 0;
    }
  }

  // Buscar atividade recente do usuário
  static async getRecentActivity(userId: string, limitCount: number = 5): Promise<RecentActivity[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('🔄 Buscando atividade recente do usuário:', userId);

      const activities: RecentActivity[] = [];

      // Buscar posts recentes
      const postsQuery = query(
        collection(db, 'posts'),
        where('autorId', '==', userId),
        orderBy('dataCriacao', 'desc'),
        limit(3)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'post',
          title: 'Novo post publicado',
          description: data.titulo || 'Post sem título',
          timestamp: data.dataCriacao?.toDate() || new Date(),
          icon: '📝',
          color: 'text-blue-500'
        });
      });

      // Buscar grupos recentes
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc'),
        limit(2)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      groupsSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'group',
          title: 'Entrou em um grupo',
          description: data.name || 'Grupo sem nome',
          timestamp: data.lastActivity?.toDate() || new Date(),
          icon: '👥',
          color: 'text-green-500'
        });
      });

      // Ordenar por timestamp e limitar
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return activities.slice(0, limitCount);
    } catch (error) {
      console.error('❌ Erro ao buscar atividade recente:', error);
      return [];
    }
  }

  // Buscar próximos eventos
  static async getUpcomingEvents(userId: string): Promise<any[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Buscar eventos dos grupos do usuário
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      const events: any[] = [];

      // Para cada grupo, buscar eventos
      for (const groupDoc of groupsSnapshot.docs) {
        const eventsQuery = query(
          collection(db, 'events'),
          where('groupId', '==', groupDoc.id),
          where('date', '>=', new Date()),
          orderBy('date', 'asc'),
          limit(2)
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        eventsSnapshot.forEach((eventDoc) => {
          const eventData = eventDoc.data();
          events.push({
            id: eventDoc.id,
            title: eventData.title,
            date: eventData.date?.toDate(),
            groupName: groupDoc.data().name,
            description: eventData.description
          });
        });
      }

      // Ordenar por data e limitar
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      return events.slice(0, 3);
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return [];
    }
  }
}
