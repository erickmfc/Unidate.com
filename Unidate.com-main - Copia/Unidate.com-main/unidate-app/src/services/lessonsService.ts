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
  serverTimestamp
} from 'firebase/firestore';
import { Lesson, Module } from '../types/subjects';

export class LessonsService {
  // Obter todas as lições de um módulo
  static async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    try {
      if (!db) {
        return [];
      }

      const lessonsRef = collection(db, 'lessons');
      const q = query(
        lessonsRef,
        where('moduleId', '==', moduleId),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const lessons: Lesson[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        lessons.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          content: data.content,
          order: data.order,
          isCompleted: data.isCompleted || false,
          completedAt: data.completedAt?.toDate(),
          progress: data.progress || 0,
          estimatedTime: data.estimatedTime || 0,
          difficulty: data.difficulty || 'iniciante',
          tags: data.tags || [],
          multimedia: data.multimedia || {},
          exercises: data.exercises || [],
          expertId: data.expertId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return lessons;
    } catch (error) {
      console.error('❌ Erro ao buscar lições:', error);
      return [];
    }
  }

  // Obter lição por ID
  static async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      if (!db) {
        return null;
      }

      const lessonRef = doc(db, 'lessons', lessonId);
      const snapshot = await getDoc(lessonRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        title: data.title,
        description: data.description,
        content: data.content,
        order: data.order,
        isCompleted: data.isCompleted || false,
        completedAt: data.completedAt?.toDate(),
        progress: data.progress || 0,
        estimatedTime: data.estimatedTime || 0,
        difficulty: data.difficulty || 'iniciante',
        tags: data.tags || [],
        multimedia: data.multimedia || {},
        exercises: data.exercises || [],
        expertId: data.expertId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('❌ Erro ao buscar lição:', error);
      return null;
    }
  }

  // Marcar lição como concluída
  static async markAsCompleted(lessonId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Atualizar lição
      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, {
        isCompleted: true,
        completedAt: serverTimestamp(),
        progress: 100,
        updatedAt: serverTimestamp(),
      });

      // Atualizar progresso do usuário
      const lesson = await this.getLessonById(lessonId);
      if (lesson) {
        // Buscar subjectId através do moduleId
        const moduleRef = doc(db, 'modules', lesson.content.sections[0]?.id || '');
        const moduleDoc = await getDoc(moduleRef);
        
        if (moduleDoc.exists()) {
          const moduleData = moduleDoc.data();
          const subjectId = moduleData.subjectId;
          
          if (subjectId) {
            const progressRef = doc(db, 'userProgress', userId, 'subjects', subjectId);
            const progressDoc = await getDoc(progressRef);
            
            if (progressDoc.exists()) {
              const progressData = progressDoc.data();
              const completedLessons = progressData.completedLessons || [];
              
              if (!completedLessons.includes(lessonId)) {
                await updateDoc(progressRef, {
                  completedLessons: [...completedLessons, lessonId],
                  updatedAt: serverTimestamp(),
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao marcar lição como concluída:', error);
      throw error;
    }
  }

  // Atualizar progresso da lição
  static async updateLessonProgress(
    lessonId: string, 
    userId: string, 
    progress: number
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, {
        progress: Math.min(100, Math.max(0, progress)),
        updatedAt: serverTimestamp(),
      });

      // Se progresso for 100%, marcar como concluída
      if (progress >= 100) {
        await this.markAsCompleted(lessonId, userId);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso da lição:', error);
      throw error;
    }
  }

  // Obter progresso do usuário em uma matéria
  static async getProgress(userId: string, subjectId: string): Promise<number> {
    try {
      if (!db) {
        return 0;
      }

      const progressRef = doc(db, 'userProgress', userId, 'subjects', subjectId);
      const snapshot = await getDoc(progressRef);

      if (!snapshot.exists()) {
        return 0;
      }

      const data = snapshot.data();
      return data.totalProgress || 0;
    } catch (error) {
      console.error('❌ Erro ao buscar progresso:', error);
      return 0;
    }
  }

  // Criar nova lição (admin/expert)
  static async createLesson(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const lessonsRef = collection(db, 'lessons');
      const docRef = doc(lessonsRef);
      
      await setDoc(docRef, {
        ...lessonData,
        isCompleted: false,
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar lição:', error);
      throw error;
    }
  }
}

