import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Timestamp;
  edited?: boolean;
  replyTo?: string; // ID da mensagem respondida
}

export interface GroupChat {
  groupId: string;
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
  isActive: boolean;
}

export class GroupChatService {
  static async sendMessage(
    groupId: string, 
    userId: string, 
    userName: string, 
    content: string, 
    type: 'text' | 'image' | 'file' | 'system' = 'text',
    replyTo?: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log(`💬 Enviando mensagem para grupo ${groupId}:`, content);

      const messageRef = await addDoc(collection(db, 'groupMessages'), {
        groupId,
        userId,
        userName,
        content,
        type,
        timestamp: serverTimestamp(),
        edited: false,
        replyTo: replyTo || null
      });

      console.log('✅ Mensagem enviada com sucesso:', messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  static async getGroupMessages(groupId: string, limitCount: number = 50): Promise<GroupMessage[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const messagesQuery = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', groupId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages: GroupMessage[] = [];

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          groupId: data.groupId,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          content: data.content,
          type: data.type || 'text',
          timestamp: data.timestamp,
          edited: data.edited || false,
          replyTo: data.replyTo
        });
      });

      return messages.reverse();
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens do grupo:', error);
      return [];
    }
  }

  static subscribeToGroupMessages(
    groupId: string, 
    callback: (messages: GroupMessage[]) => void,
    limitCount: number = 50
  ): () => void {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const messagesQuery = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', groupId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages: GroupMessage[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            groupId: data.groupId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            content: data.content,
            type: data.type || 'text',
            timestamp: data.timestamp,
            edited: data.edited || false,
            replyTo: data.replyTo
          });
        });

        callback(messages.reverse());
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erro ao escutar mensagens do grupo:', error);
      return () => {};
    }
  }

  static async sendSystemMessage(
    groupId: string, 
    content: string
  ): Promise<string> {
    return this.sendMessage(groupId, 'system', 'Sistema', content, 'system');
  }

  static async markMessagesAsRead(groupId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log(`📖 Marcando mensagens como lidas para usuário ${userId} no grupo ${groupId}`);
    } catch (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
    }
  }

  static async getChatStats(groupId: string): Promise<{
    totalMessages: number;
    activeUsers: number;
    lastActivity: Date | null;
  }> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const messagesQuery = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', groupId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      
      let totalMessages = 0;
      let lastActivity: Date | null = null;
      const activeUsers = new Set<string>();

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalMessages++;
        activeUsers.add(data.userId);
        
        if (!lastActivity && data.timestamp) {
          lastActivity = data.timestamp.toDate();
        }
      });

      return {
        totalMessages,
        activeUsers: activeUsers.size,
        lastActivity
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas do chat:', error);
      return {
        totalMessages: 0,
        activeUsers: 0,
        lastActivity: null
      };
    }
  }
}
