import { supabase } from '../supabaseClient';

export interface GroupResource {
  id: string; groupId: string; title: string; description: string; url: string;
  category: string; tags: string[]; addedBy: string; addedByName: string;
  clicks: number; likes: string[]; createdAt: string; updatedAt: string;
}

const mapResource = (row: any): GroupResource => ({
  id: row.id, groupId: row.group_id, title: row.title, description: row.description || '', url: row.url,
  category: row.category || 'link', tags: row.tags || [], addedBy: row.added_by, addedByName: row.added_by_name || 'Usuário',
  clicks: row.clicks || 0, likes: row.likes || [], createdAt: row.created_at, updatedAt: row.updated_at || row.created_at,
});

export class GroupResourcesService {
  static async addResource(groupId: string, data: Omit<GroupResource, 'id'|'groupId'|'clicks'|'likes'|'createdAt'|'updatedAt'>): Promise<string> {
    const { data: row, error } = await supabase.from('group_resources').insert({
      group_id: groupId, title: data.title.trim(), description: data.description.trim(), url: data.url.trim(),
      category: data.category, tags: data.tags || [], added_by: data.addedBy, added_by_name: data.addedByName,
    }).select('id').single();
    if (error || !row) throw error || new Error('Não foi possível adicionar o recurso');
    return row.id;
  }

  static async getGroupResources(groupId: string): Promise<GroupResource[]> {
    const { data, error } = await supabase.from('group_resources').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapResource);
  }

  static async deleteResource(resourceId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_resources').delete().eq('id', resourceId).eq('added_by', userId);
    if (error) throw error;
  }
}
