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

  async listDemoBots() {
    const { data, error } = await supabase
      .from('bot_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as DemoBotProfile[];
  },
};
