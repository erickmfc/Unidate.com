import { supabase } from '../supabaseClient';

export interface SupabaseGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  memberCount: number;
  editors: string[];
  maxMembers?: number;
  category: string;
  university: string;
  isJoined: boolean;
  lastActivity: string;
  image?: string;
  tags: string[];
  createdBy: string;
  isOwner: boolean;
  isEditor: boolean;
  isPublic: boolean;
  upcomingEvents?: { title: string; date: string; attendees: number }[];
  createdAt: string;
  updatedAt: string;
}

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  university: string | null;
  image: string | null;
  tags: string[] | null;
  created_by: string | null;
  editors: string[] | null;
  max_members: number | null;
  members_count: number;
  is_public: boolean | null;
  upcoming_events: SupabaseGroup['upcomingEvents'] | null;
  last_activity: string | null;
  created_at: string;
  updated_at: string | null;
};

const toGroup = (row: GroupRow, members: string[], memberCount: number, userId: string | null): SupabaseGroup => ({
  id: row.id,
  name: row.name,
  description: row.description ?? '',
  members,
  memberCount,
  editors: row.editors ?? [],
  maxMembers: row.max_members ?? undefined,
  category: row.category ?? 'Social',
  university: row.university ?? 'Universidade não informada',
  isJoined: Boolean(userId && members.includes(userId)),
  lastActivity: row.last_activity ?? row.created_at,
  image: row.image ?? undefined,
  tags: row.tags ?? [],
  createdBy: row.created_by ?? '',
  isOwner: Boolean(userId && row.created_by === userId),
  isEditor: Boolean(userId && row.editors?.includes(userId)),
  isPublic: row.is_public !== false,
  upcomingEvents: row.upcoming_events ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at,
});

const attachCurrentMembership = async (rows: GroupRow[], userId: string | null): Promise<SupabaseGroup[]> => {
  if (rows.length === 0) return [];
  if (!userId) return rows.map((row) => toGroup(row, [], row.members_count || 0, null));
  const ids = rows.map((row) => row.id);
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, user_id')
    .eq('user_id', userId)
    .in('group_id', ids);
  if (error) throw error;
  const joinedIds = new Set((data ?? []).map((member) => member.group_id));
  return rows.map((row) => {
    const isJoined = joinedIds.has(row.id);
    return toGroup(row, isJoined ? [userId] : [], row.members_count || 0, userId);
  });
};

export class SupabaseGroupsService {
  static async getGroups(limitCount = 50): Promise<SupabaseGroup[]> {
    const [userResult, groupsResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('groups')
        .select('id, name, description, category, university, image, tags, created_by, editors, max_members, members_count, is_public, upcoming_events, last_activity, created_at, updated_at')
        .order('last_activity', { ascending: false })
        .limit(limitCount),
    ]);
    if (groupsResult.error) throw groupsResult.error;
    const userId = userResult.data.user?.id ?? null;
    return attachCurrentMembership((groupsResult.data ?? []) as GroupRow[], userId);
  }

  static async createGroup(groupData: {
    name: string;
    description: string;
    category: string;
    university: string;
    tags: string[];
    createdBy: string;
    maxMembers?: number;
    isPublic?: boolean;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        category: groupData.category,
        university: groupData.university,
        tags: groupData.tags,
        created_by: groupData.createdBy,
        editors: [groupData.createdBy],
        max_members: groupData.maxMembers ?? 100,
        is_public: groupData.isPublic !== false,
        last_activity: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: data.id, user_id: groupData.createdBy, role: 'admin' });
    if (memberError) throw memberError;
    return data.id;
  }

  static async toggleGroupMembership(groupId: string, userId: string, isJoining: boolean): Promise<void> {
    if (isJoining) {
      const { error } = await supabase.from('group_members').upsert({ group_id: groupId, user_id: userId, role: 'member' });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
      if (error) throw error;
    }
    await supabase.from('groups').update({ last_activity: new Date().toISOString() }).eq('id', groupId);
  }

  static async hasUserCreatedGroup(userId: string): Promise<boolean> {
    const { count, error } = await supabase.from('groups').select('id', { count: 'exact', head: true }).eq('created_by', userId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  static async updateGroupImage(groupId: string, userId: string, imageUrl: string): Promise<void> {
    const { error } = await supabase.from('groups').update({ image: imageUrl, updated_at: new Date().toISOString() }).eq('id', groupId).eq('created_by', userId);
    if (error) throw error;
  }

  static async updateGroup(groupId: string, userId: string, updates: {
    name?: string;
    description?: string;
    category?: string;
    university?: string;
    tags?: string[];
    maxMembers?: number;
    isPublic?: boolean;
  }): Promise<void> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description.trim();
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.university !== undefined) payload.university = updates.university;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.maxMembers !== undefined) payload.max_members = updates.maxMembers;
    if (updates.isPublic !== undefined) payload.is_public = updates.isPublic;
    const { error } = await supabase.from('groups').update(payload).eq('id', groupId).eq('created_by', userId);
    if (error) throw error;
  }

  static async addEditor(groupId: string, userId: string): Promise<void> {
    const { data, error } = await supabase.from('groups').select('editors').eq('id', groupId).single();
    if (error) throw error;
    const editors = Array.from(new Set([...(data?.editors ?? []), userId]));
    const { error: updateError } = await supabase.from('groups').update({ editors }).eq('id', groupId);
    if (updateError) throw updateError;
  }

  static async removeEditor(groupId: string, userId: string): Promise<void> {
    const { data, error } = await supabase.from('groups').select('editors').eq('id', groupId).single();
    if (error) throw error;
    const editors = (data?.editors ?? []).filter((editor: string) => editor !== userId);
    const { error: updateError } = await supabase.from('groups').update({ editors }).eq('id', groupId);
    if (updateError) throw updateError;
  }
}
