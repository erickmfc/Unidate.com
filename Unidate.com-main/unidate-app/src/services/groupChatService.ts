import { supabase } from '../supabaseClient';

type TimestampLike = { toDate: () => Date; seconds: number; nanoseconds: number };
const asTimestamp = (value?: string | null): TimestampLike => {
  const date = value ? new Date(value) : new Date();
  return { toDate: () => date, seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
};

export interface GroupMessage { id: string; groupId: string; userId: string; userName: string; userAvatar?: string; content: string; type: 'text' | 'image' | 'file' | 'system'; timestamp: TimestampLike; edited?: boolean; replyTo?: string; }
export interface GroupChat { groupId: string; lastMessage: string; lastMessageTime: TimestampLike; unreadCount: number; isActive: boolean; }

const mapMessage = (row: any): GroupMessage => ({ id: row.id, groupId: row.group_id, userId: row.sender_id, userName: row.sender_name || 'Usuário', content: row.content, type: row.type || 'text', timestamp: asTimestamp(row.created_at), edited: false, replyTo: row.reply_to || undefined });

export class GroupChatService {
  static async sendMessage(groupId: string, userId: string, userName: string, content: string, type: 'text' | 'image' | 'file' | 'system' = 'text', replyTo?: string): Promise<string> {
    const { data, error } = await supabase.from('group_messages').insert({ group_id: groupId, sender_id: userId, sender_name: userName, content, type, reply_to: replyTo || null }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível enviar a mensagem');
    return data.id;
  }

  static async getGroupMessages(groupId: string, limitCount = 50): Promise<GroupMessage[]> {
    const { data, error } = await supabase.from('group_messages').select('*').eq('group_id', groupId).order('created_at', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data || []).reverse().map(mapMessage);
  }

  static subscribeToGroupMessages(groupId: string, callback: (messages: GroupMessage[]) => void, limitCount = 50): () => void {
    let active = true;
    const load = async () => { try { const messages = await this.getGroupMessages(groupId, limitCount); if (active) callback(messages); } catch (error) { console.error('Erro ao carregar chat do grupo:', error); } };
    void load();
    const channel = supabase.channel(`group-chat:${groupId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, load).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }

  static async sendSystemMessage(groupId: string, content: string): Promise<string> { return this.sendMessage(groupId, 'system', 'Sistema', content, 'system'); }

  static async markMessagesAsRead(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_messages').update({ is_read: true }).eq('group_id', groupId).neq('sender_id', userId).eq('is_read', false);
    if (error) throw error;
  }

  static async getChatStats(groupId: string): Promise<{ totalMessages: number; activeUsers: number; lastActivity: Date | null }> {
    const { data, error } = await supabase.from('group_messages').select('sender_id, created_at').eq('group_id', groupId).order('created_at', { ascending: false }).limit(1000);
    if (error) throw error;
    return { totalMessages: data?.length || 0, activeUsers: new Set((data || []).map((row) => row.sender_id)).size, lastActivity: data?.[0]?.created_at ? new Date(data[0].created_at) : null };
  }
}
