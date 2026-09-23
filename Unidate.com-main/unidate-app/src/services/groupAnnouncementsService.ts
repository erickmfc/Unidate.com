import { supabase } from '../supabaseClient';

export interface GroupAnnouncement {
  id: string;
  groupId: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  isPinned: boolean;
  priority: 'low' | 'medium' | 'high'; createdAt: string; updatedAt: string;
}

const mapAnnouncement = (row: any): GroupAnnouncement => ({ id: row.id, groupId: row.group_id, title: row.title, content: row.content, createdBy: row.created_by, createdByName: row.created_by_name || 'Usuário', isPinned: Boolean(row.is_pinned), priority: row.priority || 'medium', createdAt: row.created_at, updatedAt: row.updated_at || row.created_at });

export class GroupAnnouncementsService {
  static async createAnnouncement(
    groupId: string,
    announcementData: {
      title: string;
      content: string;
      createdBy: string;
      createdByName: string;
      isPinned?: boolean;
      priority?: GroupAnnouncement['priority'];
    }
  ): Promise<string> {
    const { data, error } = await supabase.from('group_announcements').insert({ group_id: groupId, title: announcementData.title.trim(), content: announcementData.content.trim(), created_by: announcementData.createdBy, created_by_name: announcementData.createdByName, is_pinned: announcementData.isPinned ?? false, priority: announcementData.priority ?? 'medium' }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível criar o anúncio');
    return data.id;
  }

  static async getGroupAnnouncements(groupId: string): Promise<GroupAnnouncement[]> {
    const { data, error } = await supabase.from('group_announcements').select('*').eq('group_id', groupId).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapAnnouncement);
  }

  static async togglePin(announcementId: string, isPinned: boolean): Promise<void> {
    const { error } = await supabase.from('group_announcements').update({ is_pinned: isPinned }).eq('id', announcementId);
    if (error) throw error;
  }

  static async deleteAnnouncement(announcementId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_announcements').delete().eq('id', announcementId).eq('created_by', userId);
    if (error) throw error;
  }
}
