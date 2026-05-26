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
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GroupMaterial {
  id: string;
  groupId: string;
  materialId?: string;
  title: string;
  description: string;
  type: 'resumo' | 'livro' | 'video' | 'link' | 'exercicio' | 'prova';
  subject: string;
  category: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  tags: string[];
  fileUrl?: string;
  externalUrl?: string;
  sharedBy: string;
  sharedByName: string;
  downloads: number;
  views: number;
  likes: string[];
  comments: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class GroupMaterialsService {
  static async shareMaterial(
    groupId: string,
    materialData: {
      title: string;
      description: string;
      type: GroupMaterial['type'];
      subject: string;
      category: string;
      difficulty: GroupMaterial['difficulty'];
      tags: string[];
      fileUrl?: string;
      externalUrl?: string;
      sharedBy: string;
      sharedByName: string;
    }
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const materialRef = await addDoc(collection(db, 'groupMaterials'), {
        ...materialData,
        groupId,
        downloads: 0,
        views: 0,
        likes: [],
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Material compartilhado no grupo:', materialRef.id);
      return materialRef.id;
    } catch (error) {
      console.error('❌ Erro ao compartilhar material:', error);
      throw error;
    }
  }

  static async getGroupMaterials(
    groupId: string,
    filters?: {
      type?: string[];
      subject?: string[];
      difficulty?: string[];
      searchQuery?: string;
    }
  ): Promise<GroupMaterial[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      let q = query(
        collection(db, 'groupMaterials'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const materials: GroupMaterial[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const material: GroupMaterial = {
          id: doc.id,
          groupId: data.groupId,
          materialId: data.materialId,
          title: data.title,
          description: data.description,
          type: data.type,
          subject: data.subject,
          category: data.category,
          difficulty: data.difficulty,
          tags: data.tags || [],
          fileUrl: data.fileUrl,
          externalUrl: data.externalUrl,
          sharedBy: data.sharedBy,
          sharedByName: data.sharedByName,
          downloads: data.downloads || 0,
          views: data.views || 0,
          likes: data.likes || [],
          comments: data.comments || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };

        if (filters) {
          if (filters.type && filters.type.length > 0 && !filters.type.includes(material.type)) {
            return;
          }
          if (filters.subject && filters.subject.length > 0 && !filters.subject.includes(material.subject)) {
            return;
          }
          if (filters.difficulty && filters.difficulty.length > 0 && !filters.difficulty.includes(material.difficulty)) {
            return;
          }
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matches = 
              material.title.toLowerCase().includes(query) ||
              material.description.toLowerCase().includes(query) ||
              material.tags.some(tag => tag.toLowerCase().includes(query));
            if (!matches) return;
          }
        }

        materials.push(material);
      });

      return materials;
    } catch (error) {
      console.error('❌ Erro ao buscar materiais do grupo:', error);
      return [];
    }
  }

  static async incrementViews(materialId: string): Promise<void> {
    try {
      if (!db) return;

      const materialRef = doc(db, 'groupMaterials', materialId);
      await updateDoc(materialRef, {
        views: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erro ao incrementar visualizações:', error);
    }
  }

  static async toggleLike(materialId: string, userId: string, isLiking: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const materialRef = doc(db, 'groupMaterials', materialId);
      
      if (isLiking) {
        await updateDoc(materialRef, {
          likes: arrayUnion(userId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(materialRef, {
          likes: arrayRemove(userId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar curtida:', error);
      throw error;
    }
  }

  static async deleteMaterial(materialId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const materialRef = doc(db, 'groupMaterials', materialId);
      const materialDoc = await getDoc(materialRef);
      
      if (!materialDoc.exists()) {
        throw new Error('Material não encontrado');
      }

      const materialData = materialDoc.data();
      if (materialData.sharedBy !== userId) {
        throw new Error('Você não tem permissão para deletar este material');
      }

      await deleteDoc(materialRef);
      console.log('✅ Material deletado do grupo');
    } catch (error) {
      console.error('❌ Erro ao deletar material:', error);
      throw error;
    }
  }
}
