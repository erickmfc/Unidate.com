import { supabase } from '../supabaseClient';

export interface AdminUser {
  id: string; displayName: string; email: string; photoURL?: string; university: string; course: string; year?: number;
  status: 'active'|'suspended'|'banned'; isVerified: boolean; createdAt: Date; lastLogin?: Date;
  postsCount: number; groupsCount: number; reportsCount: number; warningsCount: number; role?: string;
}

const mapUser = (row: any): AdminUser => ({ id: row.id, displayName: row.display_name || 'Usuário', email: row.email || '', photoURL: row.photo_url || '', university: row.university || 'Não informado', course: row.course || 'Não informado', year: row.year, status: 'active', isVerified: Boolean(row.is_verified), createdAt: new Date(row.created_at), postsCount: 0, groupsCount: 0, reportsCount: 0, warningsCount: 0, role: 'user' });

export class AdminUsersService {
  static async getUsers(maxUsers = 100): Promise<AdminUser[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(maxUsers);
    if (error) throw error;
    return Promise.all((data || []).map(async row => {
      const user = mapUser(row);
      const [{ count: postsCount }, { count: groupsCount }] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', row.id),
        supabase.from('group_members').select('group_id', { count: 'exact', head: true }).eq('user_id', row.id),
      ]);
      return { ...user, postsCount: postsCount || 0, groupsCount: groupsCount || 0 };
    }));
  }

  static async getUserDetails(userId: string): Promise<{ user: AdminUser; posts: any[]; groups: any[]; reports: any[] }> {
    const user = (await this.getUsers(1000)).find(item => item.id === userId);
    if (!user) throw new Error('Usuário não encontrado');
    const [{ data: posts }, { data: memberships }] = await Promise.all([
      supabase.from('posts').select('*').eq('author_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('group_members').select('group_id').eq('user_id', userId),
    ]);
    const groupIds = (memberships || []).map(row => row.group_id);
    const { data: groups } = groupIds.length ? await supabase.from('groups').select('*').in('id', groupIds).limit(10) : { data: [] };
    return { user, posts: posts || [], groups: groups || [], reports: [] };
  }
}
