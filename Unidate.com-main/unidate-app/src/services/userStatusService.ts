import { 
  doc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  currentGroup?: string;
}

export class UserStatusService {
  static async setUserOnline(userId: string, groupId?: string): Promise<void> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return;
      }

      console.log(`🟢 Usuário ${userId} ficou online${groupId ? ` no grupo ${groupId}` : ''}`);

      const userStatusRef = doc(db, 'userStatus', userId);
      
      await updateDoc(userStatusRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        currentGroup: groupId || null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Status online atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar status online:', error);
    }
  }

  static async setUserOffline(userId: string): Promise<void> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return;
      }

      console.log(`🔴 Usuário ${userId} ficou offline`);

      const userStatusRef = doc(db, 'userStatus', userId);
      
      await updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
        currentGroup: null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Status offline atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar status offline:', error);
    }
  }

  static subscribeToUserStatus(
    userId: string, 
    callback: (status: UserStatus | null) => void
  ): () => void {
    if (!db) {
      console.error('Firebase não inicializado');
      return () => {};
    }

    const userStatusRef = doc(db, 'userStatus', userId);

    return onSnapshot(userStatusRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          userId: doc.id,
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen,
          currentGroup: data.currentGroup || null
        });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('❌ Erro ao escutar status do usuário:', error);
    });
  }

  static subscribeToGroupUsersStatus(
    groupId: string,
    callback: (usersStatus: UserStatus[]) => void
  ): () => void {
    if (!db) {
      console.error('Firebase não inicializado');
      return () => {};
    }

    return () => {};
  }

  static async canUserAccessGroupChat(userId: string, groupId: string): Promise<boolean> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return false;
      }

      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        return false;
      }

      const groupData = groupDoc.data();
      
      return groupData.members.includes(userId);
    } catch (error) {
      console.error('❌ Erro ao verificar acesso ao chat do grupo:', error);
      return false;
    }
  }
}
