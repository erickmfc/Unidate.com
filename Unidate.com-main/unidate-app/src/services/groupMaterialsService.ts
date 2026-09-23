import { supabase } from '../supabaseClient';

export interface GroupMaterial {
  id: string; groupId: string; title: string; description: string; type: string;
  subject: string; category: string; difficulty: string; tags: string[];
  fileUrl?: string; externalUrl?: string; sharedBy: string; sharedByName: string;
  downloads: number; views: number; likes: string[]; comments: number;
  createdAt: string; updatedAt: string;
}

const mapMaterial = (row: any): GroupMaterial => ({
  id: row.id, groupId: row.group_id, title: row.title, description: row.description || '',
  type: row.type || 'link', subject: row.subject || '', category: row.category || '',
  difficulty: row.difficulty || 'iniciante', tags: row.tags || [],
  fileUrl: row.file_url || undefined, externalUrl: row.external_url || undefined,
  sharedBy: row.shared_by, sharedByName: row.shared_by_name || 'Usuário',
  downloads: row.downloads || 0, views: row.views || 0, likes: row.likes || [],
  comments: row.comments_count || 0, createdAt: row.created_at, updatedAt: row.updated_at || row.created_at,
});

export class GroupMaterialsService {
  static async shareMaterial(groupId: string, data: Omit<GroupMaterial, 'id'|'groupId'|'downloads'|'views'|'likes'|'comments'|'createdAt'|'updatedAt'>): Promise<string> {
    const { data: row, error } = await supabase.from('group_materials').insert({
      group_id: groupId, title: data.title.trim(), description: data.description.trim(), type: data.type,
      subject: data.subject.trim(), category: data.category.trim(), difficulty: data.difficulty, tags: data.tags || [],
      file_url: data.fileUrl || null, external_url: data.externalUrl || null,
      shared_by: data.sharedBy, shared_by_name: data.sharedByName,
    }).select('id').single();
    if (error || !row) throw error || new Error('Não foi possível compartilhar o material');
    return row.id;
  }

  static async getGroupMaterials(groupId: string): Promise<GroupMaterial[]> {
    const { data, error } = await supabase.from('group_materials').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapMaterial);
  }

  static async deleteMaterial(materialId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_materials').delete().eq('id', materialId).eq('shared_by', userId);
    if (error) throw error;
  }
}
