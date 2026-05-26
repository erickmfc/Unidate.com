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
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Expert, MentorshipSession } from '../types/subjects';

export class ExpertsService {
  static async getExperts(): Promise<Expert[]> {
    try {
      if (!db) {
        return [];
      }

      const expertsRef = collection(db, 'experts');
      const snapshot = await getDocs(expertsRef);
      
      const experts: Expert[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        experts.push({
          id: doc.id,
          name: data.name,
          avatar: data.avatar || '',
          bio: data.bio || '',
          credentials: data.credentials || [],
          specialties: data.specialties || [],
          subjects: data.subjects || [],
          rating: data.rating || 0,
          totalRatings: data.totalRatings || 0,
          isFavorite: data.isFavorite || false,
          contactMethods: data.contactMethods || [],
          availability: data.availability || { timezone: 'UTC', schedule: [], isAvailable: false },
          mentorshipSessions: data.mentorshipSessions || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return experts;
    } catch (error) {
      console.error('❌ Erro ao buscar especialistas:', error);
      return [];
    }
  }

  static async getExpertsBySubject(subjectId: string): Promise<Expert[]> {
    try {
      if (!db) {
        return [];
      }

      const expertsRef = collection(db, 'experts');
      const q = query(expertsRef, where('subjects', 'array-contains', subjectId));
      const snapshot = await getDocs(q);
      
      const experts: Expert[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        experts.push({
          id: doc.id,
          name: data.name,
          avatar: data.avatar || '',
          bio: data.bio || '',
          credentials: data.credentials || [],
          specialties: data.specialties || [],
          subjects: data.subjects || [],
          rating: data.rating || 0,
          totalRatings: data.totalRatings || 0,
          isFavorite: data.isFavorite || false,
          contactMethods: data.contactMethods || [],
          availability: data.availability || { timezone: 'UTC', schedule: [], isAvailable: false },
          mentorshipSessions: data.mentorshipSessions || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return experts.sort((a, b) => b.rating - a.rating);
    } catch (error) {
      console.error('❌ Erro ao buscar especialistas por matéria:', error);
      return [];
    }
  }

  static async getExpertById(expertId: string): Promise<Expert | null> {
    try {
      if (!db) {
        return null;
      }

      const expertRef = doc(db, 'experts', expertId);
      const snapshot = await getDoc(expertRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name,
        avatar: data.avatar || '',
        bio: data.bio || '',
        credentials: data.credentials || [],
        specialties: data.specialties || [],
        subjects: data.subjects || [],
        rating: data.rating || 0,
        totalRatings: data.totalRatings || 0,
        isFavorite: data.isFavorite || false,
        contactMethods: data.contactMethods || [],
        availability: data.availability || { timezone: 'UTC', schedule: [], isAvailable: false },
        mentorshipSessions: data.mentorshipSessions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('❌ Erro ao buscar especialista:', error);
      return null;
    }
  }

  static async toggleFavorite(expertId: string, userId: string): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const favoriteRef = doc(db, 'expertFavorites', userId, 'favorites', expertId);
      const snapshot = await getDoc(favoriteRef);

      if (snapshot.exists()) {
        await updateDoc(favoriteRef, {
          removedAt: serverTimestamp(),
        });
        return false;
      } else {
        await setDoc(favoriteRef, {
          expertId,
          addedAt: serverTimestamp(),
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar favorito:', error);
      throw error;
    }
  }

  static async isFavorite(expertId: string, userId: string): Promise<boolean> {
    try {
      if (!db) {
        return false;
      }

      const favoriteRef = doc(db, 'expertFavorites', userId, 'favorites', expertId);
      const snapshot = await getDoc(favoriteRef);
      return snapshot.exists();
    } catch (error) {
      console.error('❌ Erro ao verificar favorito:', error);
      return false;
    }
  }

  static async rateExpert(
    expertId: string, 
    userId: string, 
    rating: number
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const ratingRef = doc(db, 'expertRatings', expertId, 'ratings', userId);
      await setDoc(ratingRef, {
        userId,
        rating,
        createdAt: serverTimestamp(),
      });

      const expertRef = doc(db, 'experts', expertId);
      const expertDoc = await getDoc(expertRef);
      
      if (expertDoc.exists()) {
        const data = expertDoc.data();
        const currentRating = data.rating || 0;
        const totalRatings = data.totalRatings || 0;
        
        const newTotalRatings = totalRatings + 1;
        const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;

        await updateDoc(expertRef, {
          rating: newRating,
          totalRatings: newTotalRatings,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('❌ Erro ao avaliar especialista:', error);
      throw error;
    }
  }

  static async requestMentorship(
    expertId: string, 
    userId: string, 
    scheduledAt: Date,
    duration: number = 60
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const sessionsRef = collection(db, 'mentorshipSessions');
      const docRef = doc(sessionsRef);
      
      const session: MentorshipSession = {
        id: docRef.id,
        studentId: userId,
        scheduledAt,
        duration,
        status: 'scheduled',
      };

      await setDoc(docRef, {
        ...session,
        expertId,
        scheduledAt: Timestamp.fromDate(scheduledAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao solicitar mentoria:', error);
      throw error;
    }
  }

  static async getUserMentorshipSessions(userId: string): Promise<MentorshipSession[]> {
    try {
      if (!db) {
        return [];
      }

      const sessionsRef = collection(db, 'mentorshipSessions');
      const q = query(
        sessionsRef,
        where('studentId', '==', userId),
        orderBy('scheduledAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const sessions: MentorshipSession[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          studentId: data.studentId,
          scheduledAt: data.scheduledAt?.toDate() || new Date(),
          duration: data.duration || 60,
          status: data.status || 'scheduled',
          notes: data.notes,
        });
      });

      return sessions;
    } catch (error) {
      console.error('❌ Erro ao buscar sessões de mentoria:', error);
      return [];
    }
  }
}
