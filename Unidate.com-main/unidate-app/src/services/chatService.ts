import { supabase } from '../supabaseClient';

type TimestampLike = { toDate: () => Date; seconds: number; nanoseconds: number };
const asTimestamp = (value?: string | null): TimestampLike => {
  const date = value ? new Date(value) : new Date();
  return { toDate: () => date, seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
};

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: TimestampLike;
  edited?: boolean;
  replyTo?: string;
  isRead?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: TimestampLike;
  unreadCount: { [userId: string]: number };
  isActive: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

const mapMessage = (row: any): ChatMessage => ({
  id: row.id,
  chatId: row.chat_id,
  senderId: row.sender_id,
  senderName: row.sender_name || 'Usuário',
  senderAvatar: row.sender_avatar || undefined,
  content: row.content,
  type: row.type || 'text',
  timestamp: asTimestamp(row.created_at),
  edited: row.edited || false,
  replyTo: row.reply_to || undefined,
  isRead: row.is_read || false,
});

const mapChat = (row: any, participantRows: any[] = []): Chat => ({
  id: row.id,
  participants: participantRows.map((participant) => participant.user_id),
  lastMessage: row.last_message || '',
  lastMessageTime: asTimestamp(row.last_message_at),
  unreadCount: {},
  isActive: row.is_active !== false,
  createdAt: asTimestamp(row.created_at),
  updatedAt: asTimestamp(row.updated_at),
});

export class ChatService {
  static async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    // A função RPC cria os dois participantes em uma transação protegida.
    // Inserir o segundo participante pelo navegador é bloqueado pela política RLS.
    const { data, error } = await supabase.rpc('create_direct_chat', {
      target_user_id: userId2,
    });
    if (error || !data) {
      throw error || new Error('Não foi possível criar a conversa');
    }
    return data as string;
  }

  static async sendMessage(chatId: string, senderId: string, senderName: string, content: string,
    type: 'text' | 'image' | 'file' | 'system' = 'text', replyTo?: string): Promise<string> {
    const { data: authData } = await supabase.auth.getUser();
    const effectiveSenderId = authData.user?.id || senderId;
    const { data, error } = await supabase.from('messages').insert({
      chat_id: chatId, sender_id: effectiveSenderId, sender_name: senderName, content, type,
      reply_to: replyTo || null, is_read: false,
    }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível enviar a mensagem');
    const { error: chatUpdateError } = await supabase.from('chats').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', chatId);
    if (chatUpdateError) throw chatUpdateError;
    return data.id;
  }

  static async getChatMessages(chatId: string, limitCount = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId)
      .order('created_at', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data || []).reverse().map(mapMessage);
  }

  static subscribeToChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void, limitCount = 50): () => void {
    let active = true;
    const load = async () => {
      try { const messages = await this.getChatMessages(chatId, limitCount); if (active) callback(messages); }
      catch (error) { console.error('Erro ao carregar mensagens do Supabase:', error); }
    };
    void load();
    const channel = supabase.channel(`chat:${chatId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, load)
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }

  static async getUserChats(userId: string): Promise<Chat[]> {
    const { data: memberships, error } = await supabase.from('chat_participants')
      .select('chat_id, chats(*)').eq('user_id', userId);
    if (error) throw error;
    const chatIds = (memberships || []).map((row: any) => row.chat_id);
    if (chatIds.length === 0) return [];
    const { data: participants, error: participantsError } = await supabase.from('chat_participants')
      .select('chat_id, user_id').in('chat_id', chatIds);
    if (participantsError) throw participantsError;
    return (memberships || []).map((row: any) => mapChat(row.chats, (participants || []).filter((p) => p.chat_id === row.chat_id)))
      .sort((a, b) => b.lastMessageTime.toDate().getTime() - a.lastMessageTime.toDate().getTime());
  }

  static async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('messages').update({ is_read: true }).eq('chat_id', chatId)
      .neq('sender_id', userId).eq('is_read', false);
    if (error) throw error;
  }
}
