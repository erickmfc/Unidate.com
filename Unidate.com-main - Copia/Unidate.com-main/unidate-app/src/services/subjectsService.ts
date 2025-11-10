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
  Timestamp
} from 'firebase/firestore';
import { Subject, Module, Lesson, UserProgress } from '../types/subjects';

export class SubjectsService {
  // Obter todas as matérias
  static async getSubjects(): Promise<Subject[]> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return [];
      }

      const subjectsRef = collection(db, 'subjects');
      const snapshot = await getDocs(subjectsRef);
      
      const subjects: Subject[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        subjects.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          icon: data.icon,
          color: data.color || '#8B5CF6',
          modules: data.modules || [],
          totalProgress: data.totalProgress || 0,
          expertIds: data.expertIds || [],
          category: data.category || 'Geral',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return subjects.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('❌ Erro ao buscar matérias:', error);
      return [];
    }
  }

  // Obter matéria por ID
  static async getSubjectById(subjectId: string): Promise<Subject | null> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return null;
      }

      const subjectRef = doc(db, 'subjects', subjectId);
      const snapshot = await getDoc(subjectRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color || '#8B5CF6',
        modules: data.modules || [],
        totalProgress: data.totalProgress || 0,
        expertIds: data.expertIds || [],
        category: data.category || 'Geral',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('❌ Erro ao buscar matéria:', error);
      return null;
    }
  }

  // Obter progresso do usuário em uma matéria
  static async getUserProgress(userId: string, subjectId: string): Promise<UserProgress | null> {
    try {
      if (!db) {
        return null;
      }

      const progressRef = doc(db, 'userProgress', userId, 'subjects', subjectId);
      const snapshot = await getDoc(progressRef);

      if (!snapshot.exists()) {
        // Criar progresso inicial
        const initialProgress: UserProgress = {
          userId,
          subjectId,
          totalProgress: 0,
          completedLessons: [],
          timeSpent: 0,
          lastAccessed: new Date(),
          notesCount: 0,
          contributionsCount: 0,
          updatedAt: new Date(),
        };
        await setDoc(progressRef, {
          ...initialProgress,
          lastAccessed: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return initialProgress;
      }

      const data = snapshot.data();
      return {
        userId: data.userId,
        subjectId: data.subjectId,
        totalProgress: data.totalProgress || 0,
        completedLessons: data.completedLessons || [],
        currentLesson: data.currentLesson,
        timeSpent: data.timeSpent || 0,
        lastAccessed: data.lastAccessed?.toDate() || new Date(),
        notesCount: data.notesCount || 0,
        contributionsCount: data.contributionsCount || 0,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('❌ Erro ao buscar progresso:', error);
      return null;
    }
  }

  // Atualizar progresso do usuário
  static async updateUserProgress(
    userId: string, 
    subjectId: string, 
    updates: Partial<UserProgress>
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const progressRef = doc(db, 'userProgress', userId, 'subjects', subjectId);
      await updateDoc(progressRef, {
        ...updates,
        lastAccessed: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  // Criar nova matéria (admin)
  static async createSubject(subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const subjectsRef = collection(db, 'subjects');
      const docRef = doc(subjectsRef);
      
      await setDoc(docRef, {
        ...subjectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar matéria:', error);
      throw error;
    }
  }
}

