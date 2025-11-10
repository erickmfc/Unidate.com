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
  replyTo?: string; // ID da mensagem respondida
  isRead?: boolean;
}

export interface Chat {
  id: string;
  participants: string[]; // Array de UIDs dos participantes
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: { [userId: string]: number }; // Contador de mensagens não lidas por usuário
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ChatService {
  // Criar ou obter chat entre dois usuários
  static async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Verificar se já existe um chat entre esses usuários
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

      // Se não existe, criar novo chat
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

  // Enviar mensagem no chat
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
        throw new Error('Firebase não inicializado');
      }

      console.log(`💬 Enviando mensagem para chat ${chatId}:`, content);

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

      // Atualizar informações do chat
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

  // Buscar mensagens do chat
  static async getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
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

      // Ordenar por timestamp (mais antigas primeiro)
      return messages.reverse();
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  // Escutar mensagens em tempo real
  static subscribeToChatMessages(
    chatId: string, 
    callback: (messages: ChatMessage[]) => void,
    limitCount: number = 50
  ): () => void {
    if (!db) {
      console.error('Firebase não inicializado');
      return () => {};
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

      // Ordenar por timestamp (mais antigas primeiro)
      callback(messages.reverse());
    }, (error) => {
      console.error('❌ Erro ao escutar mensagens:', error);
    });
  }

  // Buscar chats do usuário
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
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

  // Marcar mensagens como lidas
  static async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Buscar mensagens não lidas
      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );

      const unreadMessages = await getDocs(unreadMessagesQuery);
      
      // Marcar como lidas
      const updatePromises = unreadMessages.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );

      await Promise.all(updatePromises);

      // Atualizar contador de não lidas no chat
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
