import { supabase } from '../supabaseClient';

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
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      if (!supabase) {
        throw new Error('Supabase não inicializado');
      }

      console.log('📊 Buscando estatísticas do usuário no Supabase:', userId);

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

      console.log('✅ Estatísticas carregadas do Supabase:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas no Supabase:', error);
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

  private static async getMatchesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Erro ao contar matches no Supabase:', error);
      return 0;
    }
  }

  private static async getPostsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Erro ao contar posts no Supabase:', error);
      return 0;
    }
  }

  private static async getGroupsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Erro ao contar grupos no Supabase:', error);
      return 0;
    }
  }

  private static async getMessagesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Erro ao contar mensagens no Supabase:', error);
      return 0;
    }
  }

  private static async getTotalLikes(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('author_id', userId);
      
      if (error) throw error;
      
      let total = 0;
      if (data) {
        total = data.reduce((sum, post) => sum + (post.likes_count || 0), 0);
      }
      return total;
    } catch (error) {
      console.error('❌ Erro ao contar curtidas no Supabase:', error);
      return 0;
    }
  }

  private static async getProfileCompletion(userId: string): Promise<number> {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !userData) {
        return 0;
      }
      
      let completion = 0;
      if (userData.display_name) completion += 20;
      if (userData.photo_url) completion += 20;
      if (userData.course) completion += 20;
      if (userData.university) completion += 20;
      if (userData.bio) completion += 20;
      
      return Math.min(completion, 100);
    } catch (error) {
      console.error('❌ Erro ao calcular completude do perfil no Supabase:', error);
      return 0;
    }
  }

  static async getRecentActivity(userId: string, limitCount: number = 5): Promise<RecentActivity[]> {
    try {
      console.log('🔄 Buscando atividade recente do usuário no Supabase:', userId);
      const activities: RecentActivity[] = [];

      // 1. Posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!postsError && posts) {
        posts.forEach((post) => {
          activities.push({
            id: post.id,
            type: 'post',
            title: 'Novo post publicado',
            description: post.content ? (post.content.substring(0, 60) + (post.content.length > 60 ? '...' : '')) : 'Post sem conteúdo',
            timestamp: new Date(post.created_at),
            icon: '📝',
            color: 'text-blue-500'
          });
        });
      }

      // 2. Groups joined
      const { data: memberships, error: memError } = await supabase
        .from('group_members')
        .select('created_at, groups(id, name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2);

      if (!memError && memberships) {
        memberships.forEach((mem: any) => {
          const group = mem.groups;
          if (group) {
            activities.push({
              id: group.id,
              type: 'group',
              title: 'Entrou em um grupo',
              description: group.name || 'Grupo sem nome',
              timestamp: new Date(mem.created_at),
              icon: '👥',
              color: 'text-green-500'
            });
          }
        });
      }

      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return activities.slice(0, limitCount);
    } catch (error) {
      console.error('❌ Erro ao buscar atividade recente no Supabase:', error);
      return [];
    }
  }

  static async getUpcomingEvents(userId: string): Promise<any[]> {
    try {
      console.log('📅 Buscando eventos futuros no Supabase...');
      
      const { data: memberships, error: memError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      
      if (memError || !memberships || memberships.length === 0) {
        return [];
      }
      
      const groupIds = memberships.map(m => m.group_id);
      
      // Tentativa de buscar da tabela 'events' (tabela opcional)
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, date, description, groups(name)')
        .in('group_id', groupIds)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);
        
      if (eventsError) {
        // Se a tabela não existir no Supabase, retorna vazio em vez de estourar erro
        console.log('ℹ️ Tabela "events" indisponível no banco. Retornando vazio.');
        return [];
      }
      
      return (events || []).map(e => ({
        id: e.id,
        title: e.title,
        date: new Date(e.date),
        groupName: (e.groups as any)?.name || 'Grupo',
        description: e.description
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar eventos futuros no Supabase:', error);
      return [];
    }
  }
}
