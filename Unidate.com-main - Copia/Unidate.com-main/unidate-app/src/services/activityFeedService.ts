import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { ActivityFeed } from '../types/subjects';

export class ActivityFeedService {
  // Obter feed de atividades
  static async getFeed(userId?: string, filters?: { type?: string; subjectId?: string }, limitCount: number = 20): Promise<ActivityFeed[]> {
    try {
      if (!db) {
        return [];
      }

      const feedRef = collection(db, 'activityFeed');
      let q;

      if (filters?.subjectId) {
        q = query(
          feedRef,
          where('subjectId', '==', filters.subjectId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          feedRef,
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(q);
      const activities: ActivityFeed[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar || '',
          type: data.type,
          subjectId: data.subjectId,
          lessonId: data.lessonId,
          content: data.content,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return activities;
    } catch (error) {
      console.error('❌ Erro ao buscar feed de atividades:', error);
      return [];
    }
  }

  // Compartilhar layout
  static async shareLayout(layoutId: string, userId: string, userName: string, userAvatar: string, layoutData: any): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const feedRef = collection(db, 'activityFeed');
      const docRef = doc(feedRef);
      
      await setDoc(docRef, {
        userId,
        userName,
        userAvatar,
        type: 'layout_shared',
        content: {
          layoutId,
          layoutData,
        },
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao compartilhar layout:', error);
      throw error;
    }
  }

  // Destacar conteúdo
  static async highlightContent(
    contentId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    contentType: string,
    contentData: any
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const feedRef = collection(db, 'activityFeed');
      const docRef = doc(feedRef);
      
      await setDoc(docRef, {
        userId,
        userName,
        userAvatar,
        type: 'material_added',
        content: {
          contentId,
          contentType,
          contentData,
        },
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao destacar conteúdo:', error);
      throw error;
    }
  }

  // Notificar nova lição concluída
  static async notifyLessonCompleted(
    userId: string,
    userName: string,
    userAvatar: string,
    subjectId: string,
    lessonId: string,
    lessonTitle: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const feedRef = collection(db, 'activityFeed');
      const docRef = doc(feedRef);
      
      await setDoc(docRef, {
        userId,
        userName,
        userAvatar,
        type: 'lesson_completed',
        subjectId,
        lessonId,
        content: {
          lessonTitle,
        },
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao notificar lição concluída:', error);
      throw error;
    }
  }

  // Notificar contribuição aprovada
  static async notifyContributionApproved(
    contributorId: string,
    contributorName: string,
    contributorAvatar: string,
    contributionId: string,
    contributionTitle: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const feedRef = collection(db, 'activityFeed');
      const docRef = doc(feedRef);
      
      await setDoc(docRef, {
        userId: contributorId,
        userName: contributorName,
        userAvatar: contributorAvatar,
        type: 'contribution_approved',
        content: {
          contributionId,
          contributionTitle,
        },
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao notificar contribuição aprovada:', error);
      throw error;
    }
  }

  // Curtir atividade
  static async likeActivity(activityId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const activityRef = doc(db, 'activityFeed', activityId);
      await updateDoc(activityRef, {
        likes: increment(1),
      });
    } catch (error) {
      console.error('❌ Erro ao curtir atividade:', error);
      throw error;
    }
  }

  // Compartilhar atividade
  static async shareActivity(activityId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const activityRef = doc(db, 'activityFeed', activityId);
      await updateDoc(activityRef, {
        shares: increment(1),
      });
    } catch (error) {
      console.error('❌ Erro ao compartilhar atividade:', error);
      throw error;
    }
  }
}

