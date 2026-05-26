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
  where,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GroupResource {
  id: string;
  groupId: string;
  title: string;
  description: string;
  url: string;
  category: 'link' | 'documento' | 'ferramenta' | 'video' | 'outro';
  tags: string[];
  addedBy: string;
  addedByName: string;
  clicks: number;
  likes: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class GroupResourcesService {
  static async addResource(
    groupId: string,
    resourceData: {
      title: string;
      description: string;
      url: string;
      category: GroupResource['category'];
      tags: string[];
      addedBy: string;
      addedByName: string;
    }
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const resourceRef = await addDoc(collection(db, 'groupResources'), {
        ...resourceData,
        groupId,
        clicks: 0,
        likes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Recurso adicionado:', resourceRef.id);
      return resourceRef.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar recurso:', error);
      throw error;
    }
  }

  static async getGroupResources(
    groupId: string,
    category?: GroupResource['category']
  ): Promise<GroupResource[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      let q = query(
        collection(db, 'groupResources'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      const snapshot = await getDocs(q);
      const resources: GroupResource[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        resources.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as GroupResource);
      });

      return resources;
    } catch (error) {
      console.error('❌ Erro ao buscar recursos:', error);
      return [];
    }
  }

  static async incrementClicks(resourceId: string): Promise<void> {
    try {
      if (!db) return;

      const resourceRef = doc(db, 'groupResources', resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (resourceDoc.exists()) {
        await updateDoc(resourceRef, {
          clicks: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar cliques:', error);
    }
  }

  static async toggleLike(resourceId: string, userId: string, isLiking: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const resourceRef = doc(db, 'groupResources', resourceId);
      
      if (isLiking) {
        await updateDoc(resourceRef, {
          likes: arrayUnion(userId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(resourceRef, {
          likes: arrayRemove(userId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar curtida:', error);
      throw error;
    }
  }

  static async deleteResource(resourceId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const resourceRef = doc(db, 'groupResources', resourceId);
      const resourceDoc = await getDoc(resourceRef);
      
      if (!resourceDoc.exists()) {
        throw new Error('Recurso não encontrado');
      }

      const resourceData = resourceDoc.data() as GroupResource;
      if (resourceData.addedBy !== userId) {
        throw new Error('Você não tem permissão para deletar este recurso');
      }

      await deleteDoc(resourceRef);
      console.log('✅ Recurso deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar recurso:', error);
      throw error;
    }
  }
}
