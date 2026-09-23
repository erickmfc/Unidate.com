import { supabase } from '../supabaseClient';

export interface BotProfile { id: string; name: string; handle: string; course: string; university: string; period: number; avatar: string; bio: string; writingStyle: string; personality: string; interests: string[]; postingFrequency: { enabled: boolean; intervalMinutes: number }; status: 'active'|'paused'|'draft'; postsCount: number; lastPostTime: Date|null; createdAt: Date; updatedAt: Date; }

const mapBot = (row: any): BotProfile => ({ id: row.id, name: row.display_name, handle: row.handle || row.bot_key, course: '', university: '', period: 1, avatar: row.photo_url || '', bio: row.bio || '', writingStyle: '', personality: row.personality || 'descontraído', interests: row.interests || [], postingFrequency: { enabled: Boolean(row.is_active), intervalMinutes: 60 }, status: row.is_active === false ? 'paused' : 'active', postsCount: 0, lastPostTime: null, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at || row.created_at) });

export class AIBotProfilesService {
  static async createProfile(profileData: Omit<BotProfile, 'id'|'postsCount'|'lastPostTime'|'createdAt'|'updatedAt'>): Promise<string> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuário não autenticado');
    const { data, error } = await supabase.from('bot_profiles').insert({ auth_user_id: user.id, bot_key: profileData.handle, display_name: profileData.name, handle: profileData.handle, bio: profileData.bio, personality: profileData.personality, interests: profileData.interests, photo_url: profileData.avatar, is_active: profileData.status === 'active' }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível criar o perfil automatizado');
    return data.id;
  }
  static async getProfiles(): Promise<BotProfile[]> { const { data, error } = await supabase.from('bot_profiles').select('*').order('created_at', { ascending: false }); if (error) throw error; return (data || []).map(mapBot); }
  static async updateProfile(profileId: string, updates: Partial<BotProfile>): Promise<void> { const payload: any = {}; if (updates.name !== undefined) payload.display_name = updates.name; if (updates.handle !== undefined) payload.handle = updates.handle; if (updates.bio !== undefined) payload.bio = updates.bio; if (updates.personality !== undefined) payload.personality = updates.personality; if (updates.interests !== undefined) payload.interests = updates.interests; if (updates.avatar !== undefined) payload.photo_url = updates.avatar; if (updates.status !== undefined) payload.is_active = updates.status === 'active'; const { error } = await supabase.from('bot_profiles').update(payload).eq('id', profileId); if (error) throw error; }
  static async deleteProfile(profileId: string): Promise<void> { const { error } = await supabase.from('bot_profiles').delete().eq('id', profileId); if (error) throw error; }
  static async generatePostForProfile(profile: BotProfile): Promise<string> { const posts = [`${profile.name} compartilhando uma dica de estudos para o campus.`, `Como estão os estudos de vocês? — ${profile.name}`, `Mais um passo concluído hoje. Força, pessoal!`]; return posts[profile.name.length % posts.length]; }
  static async createPostForProfile(profile: BotProfile): Promise<string> { return `bot-post-${profile.id}-${Date.now()}`; }
  static generateAvatar(name: string, course: string): string { const color = ['8b5cf6','ec4899','06b6d4','10b981','f59e0b','ef4444'][name.length % 6]; return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128&bold=true`; }
}
