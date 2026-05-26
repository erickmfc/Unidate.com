import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GroupAnnouncement {
  id: string;
  groupId: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  isPinned: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class GroupAnnouncementsService {
  static async createAnnouncement(
    groupId: string,
    announcementData: {
      title: string;
      content: string;
      createdBy: string;
      createdByName: string;
      isPinned?: boolean;
      priority?: GroupAnnouncement['priority'];
    }
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const announcementRef = await addDoc(collection(db, 'groupAnnouncements'), {
        ...announcementData,
        groupId,
        isPinned: announcementData.isPinned || false,
        priority: announcementData.priority || 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Anúncio criado:', announcementRef.id);
      return announcementRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar anúncio:', error);
      throw error;
    }
  }

  static async getGroupAnnouncements(groupId: string): Promise<GroupAnnouncement[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'groupAnnouncements'),
        where('groupId', '==', groupId),
        orderBy('isPinned', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const announcements: GroupAnnouncement[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        announcements.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as GroupAnnouncement);
      });

      return announcements;
    } catch (error) {
      console.error('❌ Erro ao buscar anúncios:', error);
      return [];
    }
  }

  static async togglePin(announcementId: string, isPinned: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const announcementRef = doc(db, 'groupAnnouncements', announcementId);
      await updateDoc(announcementRef, {
        isPinned,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar fixação:', error);
      throw error;
    }
  }

  static async deleteAnnouncement(announcementId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const announcementRef = doc(db, 'groupAnnouncements', announcementId);
      const announcementDoc = await getDoc(announcementRef);
      
      if (!announcementDoc.exists()) {
        throw new Error('Anúncio não encontrado');
      }

      const announcementData = announcementDoc.data() as GroupAnnouncement;
      if (announcementData.createdBy !== userId) {
        throw new Error('Você não tem permissão para deletar este anúncio');
      }

      await deleteDoc(announcementRef);
      console.log('✅ Anúncio deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar anúncio:', error);
      throw error;
    }
  }
}
