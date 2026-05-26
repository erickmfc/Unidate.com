import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { EducationalMaterial } from '../types/materials';

const MATERIALS_COLLECTION = 'materials';

export class MaterialsService {
  
  static async getMaterialsByUser(userId: string): Promise<EducationalMaterial[]> {
    try {
      if (!db) {
        console.warn('Firebase não está disponível, retornando array vazio');
        return [];
      }

      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('authorId', '==', userId)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ratings: data.ratings?.map((r: any) => ({
            ...r,
            createdAt: r.createdAt?.toDate() || new Date(),
          })) || [],
          downloads: data.downloads?.map((d: any) => ({
            ...d,
            downloadedAt: d.downloadedAt?.toDate() || new Date(),
          })) || [],
        } as EducationalMaterial;
      });
    } catch (error) {
      console.error('Erro ao obter materiais do usuário:', error);
      return [];
    }
  }

  
  static async getMaterialById(materialId: string): Promise<EducationalMaterial | null> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(db, MATERIALS_COLLECTION, materialId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ratings: data.ratings?.map((r: any) => ({
            ...r,
            createdAt: r.createdAt?.toDate() || new Date(),
          })) || [],
          downloads: data.downloads?.map((d: any) => ({
            ...d,
            downloadedAt: d.downloadedAt?.toDate() || new Date(),
          })) || [],
        } as EducationalMaterial;
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter material:', error);
      throw new Error('Falha ao obter material');
    }
  }

  
  static async createMaterial(materialData: Partial<EducationalMaterial>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(collection(db, MATERIALS_COLLECTION));
      await setDoc(docRef, {
        ...materialData,
        views: 0,
        totalDownloads: 0,
        totalRatings: 0,
        averageRating: 0,
        ratings: [],
        downloads: [],
        shares: 0,
        isApproved: false,
        isPublic: true,
        reportedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar material:', error);
      throw new Error('Falha ao criar material');
    }
  }

  
  static async updateMaterial(materialId: string, updates: Partial<EducationalMaterial>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }

      const docRef = doc(db, MATERIALS_COLLECTION, materialId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      throw new Error('Falha ao atualizar material');
    }
  }

  
  static async materialExists(materialId: string): Promise<boolean> {
    try {
      if (!db) {
        return false;
      }

      const docRef = doc(db, MATERIALS_COLLECTION, materialId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Erro ao verificar material:', error);
      return false;
    }
  }
}
