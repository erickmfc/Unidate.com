import { supabase } from '../supabaseClient';

export interface AdminMetrics { totalUsers: number; activeUsers: number; newUsers: number; totalPosts: number; totalGroups: number; pendingReports: number; engagementRate: number; lastUpdated: Date; }
const count = async (table: string) => { const { count: value, error } = await supabase.from(table).select('id', { count: 'exact', head: true }); if (error) throw error; return value || 0; };
export class AdminMetricsService {
  static async getMetrics(): Promise<AdminMetrics> { try { const [totalUsers, totalPosts, totalGroups] = await Promise.all([count('profiles'), count('posts'), count('groups')]); return { totalUsers, activeUsers: 0, newUsers: 0, totalPosts, totalGroups, pendingReports: 0, engagementRate: totalUsers ? Math.round(totalPosts / totalUsers * 100) / 100 : 0, lastUpdated: new Date() }; } catch { return { totalUsers: 0, activeUsers: 0, newUsers: 0, totalPosts: 0, totalGroups: 0, pendingReports: 0, engagementRate: 0, lastUpdated: new Date() }; } }
}
