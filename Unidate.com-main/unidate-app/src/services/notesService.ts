import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { PersonalNote, Highlight } from '../types/subjects';

export class NotesService {
  static async createNote(noteData: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const notesRef = collection(db, 'personalNotes', noteData.userId, 'notes');
      const docRef = doc(notesRef);
      
      await setDoc(docRef, {
        ...noteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar anotação:', error);
      throw error;
    }
  }

  static async getUserNotes(userId: string, subjectId?: string, lessonId?: string): Promise<PersonalNote[]> {
    try {
      if (!db) {
        return [];
      }

      const notesRef = collection(db, 'personalNotes', userId, 'notes');
      let q;

      if (lessonId) {
        q = query(notesRef, where('lessonId', '==', lessonId), orderBy('createdAt', 'desc'));
      } else if (subjectId) {
        q = query(notesRef, where('subjectId', '==', subjectId), orderBy('createdAt', 'desc'));
      } else {
        q = query(notesRef, orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const notes: PersonalNote[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          userId: data.userId,
          subjectId: data.subjectId,
          lessonId: data.lessonId,
          content: data.content,
          position: data.position,
          highlights: data.highlights || [],
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return notes;
    } catch (error) {
      console.error('❌ Erro ao buscar anotações:', error);
      return [];
    }
  }

  static async updateNote(noteId: string, userId: string, updates: Partial<PersonalNote>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const noteRef = doc(db, 'personalNotes', userId, 'notes', noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar anotação:', error);
      throw error;
    }
  }

  static async deleteNote(noteId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const noteRef = doc(db, 'personalNotes', userId, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('❌ Erro ao deletar anotação:', error);
      throw error;
    }
  }

  static async addHighlight(
    userId: string,
    lessonId: string,
    subjectId: string,
    highlight: Highlight
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const notesRef = collection(db, 'personalNotes', userId, 'notes');
      const q = query(notesRef, where('lessonId', '==', lessonId));
      const snapshot = await getDocs(q);

      let noteId: string;
      if (snapshot.empty) {
        const docRef = doc(notesRef);
        noteId = docRef.id;
        await setDoc(docRef, {
          userId,
          subjectId,
          lessonId,
          content: '',
          position: highlight.position,
          highlights: [highlight],
          tags: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const noteDoc = snapshot.docs[0];
        noteId = noteDoc.id;
        const data = noteDoc.data();
        const highlights = data.highlights || [];
        highlights.push(highlight);

        await updateDoc(noteDoc.ref, {
          highlights,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar highlight:', error);
      throw error;
    }
  }

  static async addTag(noteId: string, userId: string, tag: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const noteRef = doc(db, 'personalNotes', userId, 'notes', noteId);
      const noteDoc = await getDoc(noteRef);

      if (noteDoc.exists()) {
        const data = noteDoc.data();
        const tags = data.tags || [];
        
        if (!tags.includes(tag)) {
          tags.push(tag);
          await updateDoc(noteRef, {
            tags,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar tag:', error);
      throw error;
    }
  }

  static async createSummary(
    userId: string,
    lessonId: string,
    subjectId: string,
    summary: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const notesRef = collection(db, 'personalNotes', userId, 'notes');
      const docRef = doc(notesRef);
      
      await setDoc(docRef, {
        userId,
        subjectId,
        lessonId,
        content: summary,
        position: { sectionId: 'summary', paragraphIndex: 0, characterStart: 0, characterEnd: 0 },
        highlights: [],
        tags: ['resumo'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar resumo:', error);
      throw error;
    }
  }

  static async getNotesByTag(userId: string, tag: string): Promise<PersonalNote[]> {
    try {
      if (!db) {
        return [];
      }

      const notesRef = collection(db, 'personalNotes', userId, 'notes');
      const q = query(notesRef, where('tags', 'array-contains', tag), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const notes: PersonalNote[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          userId: data.userId,
          subjectId: data.subjectId,
          lessonId: data.lessonId,
          content: data.content,
          position: data.position,
          highlights: data.highlights || [],
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return notes;
    } catch (error) {
      console.error('❌ Erro ao buscar anotações por tag:', error);
      return [];
    }
  }
}
