import { supabase } from '../supabaseClient';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  course: string;
  university: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  postsCount: number;
  friendsCount: number;
  isFriend: boolean;
  userType?: 'aluno' | 'professor' | 'uni';
}

export interface UserPost {
  id: string;
  titulo: string;
  conteudo: string;
  dataCriacao: any;
  curtidasPor: string[];
  numeroComentarios: number;
  hashtags: string[];
  tipo: string;
}

export class UserProfileService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Perfil não encontrado no Supabase:', error);
        return null;
      }

      const postsCount = await this.getUserPostsCount(userId);
      const friendsCount = await this.getUserFriendsCount(userId);
      
      const { data: { user } } = await supabase.auth.getUser();
      let isFriend = false;
      if (user && user.id !== userId) {
        isFriend = await this.checkFriendship(user.id, userId);
      }

      return {
        uid: profile.id,
        name: profile.display_name || 'Usuário',
        email: profile.email || '',
        course: profile.course || 'Curso não informado',
        university: profile.university || 'Universidade não informada',
        bio: profile.bio || '',
        avatar: profile.photo_url || '',
        joinDate: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        postsCount,
        friendsCount,
        isFriend,
        userType: profile.user_type || 'aluno'
      };
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      return null;
    }
  }

  static async getUserPosts(userId: string, limitCount: number = 10): Promise<UserPost[]> {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes:likes(user_id)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) throw error;

      return (postsData || []).map((p: any) => ({
        id: p.id,
        titulo: p.title || '',
        conteudo: p.content,
        dataCriacao: p.created_at,
        curtidasPor: (p.likes || []).map((l: any) => l.user_id),
        numeroComentarios: p.comments_count || 0,
        hashtags: p.hashtags || [],
        tipo: p.type || 'text'
      }));
    } catch (error) {
      console.error('Erro ao carregar posts do usuário:', error);
      return [];
    }
  }

  static async getUserPostsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar posts:', error);
      return 0;
    }
  }

  static async getUserFriendsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar amigos:', error);
      return 0;
    }
  }

  static async checkFriendship(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('status')
        .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`);

      if (error || !data || data.length === 0) return false;
      return data[0].status === 'accepted';
    } catch (error) {
      return false;
    }
  }

  static async addFriend(userId1: string, userId2: string): Promise<void> {
    try {
      const exists = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`);

      if (exists.data && exists.data.length > 0) {
        // Update to accepted if it exists
        const { error } = await supabase
          .from('matches')
          .update({ status: 'accepted' })
          .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`);

        if (error) throw error;
      } else {
        // Create new accepted match
        const { error } = await supabase
          .from('matches')
          .insert({
            user1_id: userId1,
            user2_id: userId2,
            status: 'accepted'
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error);
      throw error;
    }
  }

  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,course.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%`)
        .limit(50);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const results: UserProfile[] = [];
      for (const p of (profiles || [])) {
        let isFriend = false;
        if (currentUserId && currentUserId !== p.id) {
          isFriend = await this.checkFriendship(currentUserId, p.id);
        }

        results.push({
          uid: p.id,
          name: p.display_name || 'Usuário',
          email: p.email || '',
          course: p.course || 'Curso não informado',
          university: p.university || 'Universidade não informada',
          bio: p.bio || '',
          avatar: p.photo_url || '',
          joinDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          postsCount: await this.getUserPostsCount(p.id),
          friendsCount: await this.getUserFriendsCount(p.id),
          isFriend,
          userType: p.user_type || 'aluno'
        });
      }
      return results;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  static async getAllUsers(limitCount: number = 200): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(limitCount);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const results: UserProfile[] = [];
      for (const p of (profiles || [])) {
        let isFriend = false;
        if (currentUserId && currentUserId !== p.id) {
          isFriend = await this.checkFriendship(currentUserId, p.id);
        }

        results.push({
          uid: p.id,
          name: p.display_name || 'Usuário',
          email: p.email || '',
          course: p.course || 'Curso não informado',
          university: p.university || 'Universidade não informada',
          bio: p.bio || '',
          avatar: p.photo_url || '',
          joinDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          postsCount: await this.getUserPostsCount(p.id),
          friendsCount: await this.getUserFriendsCount(p.id),
          isFriend,
          userType: p.user_type || 'aluno'
        });
      }
      return results;
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      return [];
    }
  }

  static async userExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (error || !data) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  static async debugListAllUsers(): Promise<void> {
    const users = await this.getAllUsers();
    console.log('DEBUG USERS:', users);
  }
}
