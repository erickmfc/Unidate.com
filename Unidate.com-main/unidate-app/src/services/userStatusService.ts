import { supabase } from '../supabaseClient';

export class UserStatusService {
  static async canUserAccessGroupChat(userId: string, groupId: string): Promise<boolean> {
    const { data, error } = await supabase.from('group_members')
      .select('user_id').eq('group_id', groupId).eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }
}
