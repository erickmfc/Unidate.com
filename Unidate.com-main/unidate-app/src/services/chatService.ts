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
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Timestamp;
  edited?: boolean;
  replyTo?: string;
  isRead?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: { [userId: string]: number };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ChatService {
  static async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    try {
      if (!db) {
        console.log("⚡ [CHAT] Buscando ou criando chat offline para:", userId1, "e", userId2);
        const chats = JSON.parse(localStorage.getItem('unidate_offline_chats') || '[]');
        const existing = chats.find((c: any) => 
          c.participants.includes(userId1) && c.participants.includes(userId2) && c.participants.length === 2
        );
        if (existing) {
          return existing.id;
        }

        const chatId = 'chat_offline_' + Math.random().toString(36).substr(2, 9);
        const newChat = {
          id: chatId,
          participants: [userId1, userId2],
          lastMessage: 'Vocês deram match! Diga oi! 👋',
          lastMessageTime: new Date().toISOString(),
          unreadCount: {
            [userId1]: 0,
            [userId2]: 0
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        chats.push(newChat);
        localStorage.setItem('unidate_offline_chats', JSON.stringify(chats));
        window.dispatchEvent(new Event('local-chats-updated'));
        return chatId;
      }

      const existingChatQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId1)
      );

      const existingChats = await getDocs(existingChatQuery);
      
      for (const chatDoc of existingChats.docs) {
        const chatData = chatDoc.data();
        if (chatData.participants.includes(userId2) && chatData.participants.length === 2) {
          return chatDoc.id;
        }
      }

      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [userId1, userId2],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0
        },
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Chat criado:', chatRef.id);
      return chatRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar/obter chat:', error);
      throw error;
    }
  }

  static async sendMessage(
    chatId: string, 
    senderId: string, 
    senderName: string, 
    content: string, 
    type: 'text' | 'image' | 'file' | 'system' = 'text',
    replyTo?: string
  ): Promise<string> {
    try {
      if (!db) {
        console.log("⚡ [CHAT] Enviando mensagem offline para chat:", chatId);
        const messages = JSON.parse(localStorage.getItem('unidate_offline_messages') || '[]');
        const msgId = 'msg_offline_' + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();
        
        const newMessage = {
          id: msgId,
          chatId,
          senderId,
          senderName,
          content,
          type,
          timestamp: now,
          edited: false,
          replyTo: replyTo || null,
          isRead: false
        };

        messages.push(newMessage);
        localStorage.setItem('unidate_offline_messages', JSON.stringify(messages));

        // Update last message in chat
        const chats = JSON.parse(localStorage.getItem('unidate_offline_chats') || '[]');
        const chatIndex = chats.findIndex((c: any) => c.id === chatId);
        if (chatIndex !== -1) {
          chats[chatIndex].lastMessage = content;
          chats[chatIndex].lastMessageTime = now;
          chats[chatIndex].updatedAt = now;
          
          // Increment unread count for other participants
          const otherParticipants = chats[chatIndex].participants.filter((p: string) => p !== senderId);
          otherParticipants.forEach((p: string) => {
            if (!chats[chatIndex].unreadCount) chats[chatIndex].unreadCount = {};
            chats[chatIndex].unreadCount[p] = (chats[chatIndex].unreadCount[p] || 0) + 1;
          });
          
          localStorage.setItem('unidate_offline_chats', JSON.stringify(chats));
        }

        window.dispatchEvent(new CustomEvent('local-chat-messages-updated', { detail: { chatId } }));
        window.dispatchEvent(new Event('local-chats-updated'));
        return msgId;
      }

      console.log(`⚡ Enviando mensagem para chat ${chatId}:`, content);

      const messageRef = await addDoc(collection(db, 'messages'), {
        chatId,
        senderId,
        senderName,
        content,
        type,
        timestamp: serverTimestamp(),
        edited: false,
        replyTo: replyTo || null,
        isRead: false
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Mensagem enviada com sucesso:', messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  static async getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      if (!db) {
        console.log("⚡ [CHAT] Carregando mensagens offline do chat:", chatId);
        const messages = JSON.parse(localStorage.getItem('unidate_offline_messages') || '[]');
        const chatMsgs = messages.filter((m: any) => m.chatId === chatId);
        
        // Helper mock for Timestamp object compatibility
        const createOfflineTimestamp = (isoString?: any) => {
          const d = new Date(isoString);
          return {
            toDate: () => d,
            seconds: Math.floor(d.getTime() / 1000),
            nanoseconds: 0
          };
        };

        const mapped = chatMsgs.map((m: any) => ({
          ...m,
          timestamp: createOfflineTimestamp(m.timestamp)
        }));

        // Sort by timestamp asc
        mapped.sort((a: any, b: any) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime());
        return mapped.slice(-limitCount);
      }

      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages: ChatMessage[] = [];

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          content: data.content,
          type: data.type,
          timestamp: data.timestamp,
          edited: data.edited || false,
          replyTo: data.replyTo,
          isRead: data.isRead || false
        });
      });

      return messages.reverse();
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  static subscribeToChatMessages(
    chatId: string, 
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
  ): () => void {
    if (!db) {
      console.log("⚡ [CHAT] Assinando mensagens offline para chat:", chatId);
      const loadAndCallback = () => {
        ChatService.getChatMessages(chatId, limitCount).then(callback).catch(console.error);
      };

      loadAndCallback();

      const handler = (e: any) => {
        if (e.detail && e.detail.chatId === chatId) {
          loadAndCallback();
        }
      };

      window.addEventListener('local-chat-messages-updated', handler);
      return () => {
        window.removeEventListener('local-chat-messages-updated', handler);
      };
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          content: data.content,
          type: data.type,
          timestamp: data.timestamp,
          edited: data.edited || false,
          replyTo: data.replyTo,
          isRead: data.isRead || false
        });
      });

      callback(messages.reverse());
    }, (error) => {
      console.error('❌ Erro ao escutar mensagens:', error);
    });
  }

  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      if (!db) {
        console.log("⚡ [CHAT] Buscando chats offline para usuário:", userId);
        const chats = JSON.parse(localStorage.getItem('unidate_offline_chats') || '[]');
        const userChats = chats.filter((c: any) => c.participants.includes(userId));
        
        const createOfflineTimestamp = (isoString?: any) => {
          const d = isoString ? new Date(isoString) : new Date();
          return {
            toDate: () => d,
            seconds: Math.floor(d.getTime() / 1000),
            nanoseconds: 0
          };
        };

        const mapped = userChats.map((c: any) => ({
          ...c,
          lastMessageTime: createOfflineTimestamp(c.lastMessageTime),
          createdAt: createOfflineTimestamp(c.createdAt),
          updatedAt: createOfflineTimestamp(c.updatedAt)
        }));

        // Sort by lastMessageTime desc
        mapped.sort((a: any, b: any) => b.lastMessageTime.toDate().getTime() - a.lastMessageTime.toDate().getTime());
        return mapped;
      }

      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const chatsSnapshot = await getDocs(chatsQuery);
      const chats: Chat[] = [];

      chatsSnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          unreadCount: data.unreadCount || {},
          isActive: data.isActive,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });

      return chats;
    } catch (error) {
      console.error('❌ Erro ao buscar chats:', error);
      throw error;
    }
  }

  static async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        console.log("⚡ [CHAT] Marcando mensagens offline como lidas no chat:", chatId);
        const messages = JSON.parse(localStorage.getItem('unidate_offline_messages') || '[]');
        let changed = false;
        const updatedMessages = messages.map((m: any) => {
          if (m.chatId === chatId && m.senderId !== userId && !m.isRead) {
            changed = true;
            return { ...m, isRead: true };
          }
          return m;
        });

        if (changed) {
          localStorage.setItem('unidate_offline_messages', JSON.stringify(updatedMessages));
        }

        const chats = JSON.parse(localStorage.getItem('unidate_offline_chats') || '[]');
        const chatIndex = chats.findIndex((c: any) => c.id === chatId);
        if (chatIndex !== -1) {
          if (!chats[chatIndex].unreadCount) chats[chatIndex].unreadCount = {};
          chats[chatIndex].unreadCount[userId] = 0;
          localStorage.setItem('unidate_offline_chats', JSON.stringify(chats));
        }

        window.dispatchEvent(new Event('local-chats-updated'));
        return;
      }

      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );

      const unreadMessages = await getDocs(unreadMessagesQuery);
      
      const updatePromises = unreadMessages.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );

      await Promise.all(updatePromises);

      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Mensagens marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }
}

