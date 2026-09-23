import supabase from '../supabaseClient';

export interface DemoBotProfile {
  id: string;
  auth_user_id: string;
  bot_key: string;
  display_name: string;
  handle: string;
  bio: string;
  personality: string;
  interests: string[];
  photo_url: string | null;
  is_automated: boolean;
  is_active: boolean;
  city?: string;
  institution?: string;
  course?: string;
  public_disclosure?: string;
  writing_style?: string;
  topics?: string[];
  initiative_level?: 'reserved' | 'normal' | 'high';
  daily_post_limit?: number;
  daily_comment_limit?: number;
  response_probability?: number;
}

export interface BotAutomationSettings {
  id: boolean;
  intensity: 'off' | 'low' | 'normal' | 'high' | 'custom';
  is_enabled: boolean;
  posts_enabled: boolean;
  comments_enabled: boolean;
  require_approval: boolean;
  paused_until: string | null;
  updated_at: string;
}

export interface BotActivityLog {
  id: string;
  bot_key: string;
  action: 'post' | 'comment' | 'skip' | 'error';
  content: string | null;
  decision_reason: string | null;
  status: string;
  created_at: string;
}

export const botAutomationService = {
  async seedDemoBots() {
    const { data, error } = await supabase.functions.invoke('seed-demo-bots', { body: {} });
    if (error) throw error;
    return data as { ok: boolean; created: number; bots: Array<{ name: string; handle: string; isAutomated: boolean }> };
  },

  async provisionErickCampus() {
    const { data, error } = await supabase.functions.invoke('provision-erick-campus', { body: {} });
    if (error) throw error;
    return data as { ok: boolean; created: boolean; bot: { name: string; handle: string; isAutomated: boolean } };
  },

  async interactErickCampus() {
    const { data, error } = await supabase.functions.invoke('interact-erick-campus', { body: {} });
    if (error) throw error;
    return data as { ok: boolean; commented: boolean; remainingPhotos: number; post: { id: string; image: string | null; content: string } };
  },

  async provisionCampusPersona(botKey: string) {
    const { data, error } = await supabase.functions.invoke('provision-campus-persona', { body: { botKey } });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'Não foi possível cadastrar a personagem.');
    return data as { ok: boolean; created: boolean; bot: DemoBotProfile };
  },

  async listDemoBots() {
    const { data, error } = await supabase
      .from('bot_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as DemoBotProfile[];
  },

  async getAutomationSettings() {
    const { data, error } = await supabase.from('bot_automation_settings').select('*').eq('id', true).single();
    if (error) throw error;
    return data as BotAutomationSettings;
  },

  async updateAutomationSettings(settings: Pick<BotAutomationSettings, 'intensity' | 'is_enabled' | 'posts_enabled' | 'comments_enabled' | 'require_approval'> & { paused_until?: string | null }) {
    const { data, error } = await supabase.rpc('update_bot_automation_settings', {
      p_intensity: settings.intensity,
      p_is_enabled: settings.is_enabled,
      p_posts_enabled: settings.posts_enabled,
      p_comments_enabled: settings.comments_enabled,
      p_require_approval: settings.require_approval,
      p_paused_until: settings.paused_until ?? null,
    });
    if (error) throw error;
    return data as BotAutomationSettings;
  },

  async updateBotProfileSettings(botKey: string, changes: { is_active?: boolean; daily_post_limit?: number; daily_comment_limit?: number; response_probability?: number; initiative_level?: 'reserved' | 'normal' | 'high' }) {
    const { data, error } = await supabase.rpc('update_bot_profile_settings', {
      p_bot_key: botKey,
      p_is_active: changes.is_active ?? null,
      p_daily_post_limit: changes.daily_post_limit ?? null,
      p_daily_comment_limit: changes.daily_comment_limit ?? null,
      p_response_probability: changes.response_probability ?? null,
      p_initiative_level: changes.initiative_level ?? null,
    });
    if (error) throw error;
    return data as DemoBotProfile;
  },

  async runAutomationNow() {
    const { data, error } = await supabase.rpc('run_bot_automation_for_admin');
    if (error) throw error;
    return data as { ok: boolean; action: string; bot_key?: string; reason?: string };
  },

  async listActivityLogs(limit = 30) {
    const { data, error } = await supabase.from('bot_activity_logs').select('id,bot_key,action,content,decision_reason,status,created_at').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as BotActivityLog[];
  },
};
