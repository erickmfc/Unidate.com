import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { 
  EducationalMaterial, 
  MaterialUploadData, 
  MaterialFilter, 
  MaterialRating, 
  MaterialDownload,
  MaterialStats,
  MaterialType,
  Subject,
  MaterialCategory,
  DifficultyLevel
} from '../types/materials';

const MATERIALS_COLLECTION = 'materials';
const STORAGE_PATH = 'materials';

export class MaterialsService {
  private static async uploadFile(file: File, materialId: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage não está disponível');
    }
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `${materialId}.${fileExtension}`;
    const storageRef = ref(storage, `${STORAGE_PATH}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  static async createMaterial(
    materialData: MaterialUploadData, 
    authorId: string, 
    authorName: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const materialRef = await addDoc(collection(db, MATERIALS_COLLECTION), {
        title: materialData.title,
        description: materialData.description,
        type: materialData.type,
        subject: materialData.subject,
        category: materialData.category,
        difficulty: materialData.difficulty,
        tags: materialData.tags,
        university: materialData.university || '',
        course: materialData.course || '',
        language: materialData.language,
        
        authorId,
        authorName,
        
        ratings: [],
        averageRating: 0,
        totalRatings: 0,
        
        downloads: [],
        totalDownloads: 0,
        views: 0,
        shares: 0,
        
        isApproved: false,
        isPublic: true,
        reportedCount: 0,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        fileUrl: '',
        externalUrl: materialData.externalUrl || '',
      });

      const materialId = materialRef.id;

      if (materialData.file) {
        const fileUrl = await this.uploadFile(materialData.file, materialId);
        await updateDoc(materialRef, {
          fileUrl,
          fileName: materialData.file.name,
          fileSize: materialData.file.size,
        });
      }

      return materialId;
    } catch (error) {
      console.error('Erro ao criar material:', error);
      throw new Error('Falha ao criar material');
    }
  }

  static async getMaterials(
    filter: MaterialFilter = {},
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{ materials: EducationalMaterial[]; lastDoc: any }> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      let q = query(collection(db, MATERIALS_COLLECTION));

      if (filter.type && filter.type.length > 0) {
        q = query(q, where('type', 'in', filter.type));
      }

      if (filter.subject && filter.subject.length > 0) {
        q = query(q, where('subject', 'in', filter.subject));
      }

      if (filter.category && filter.category.length > 0) {
        q = query(q, where('category', 'in', filter.category));
      }

      if (filter.difficulty && filter.difficulty.length > 0) {
        q = query(q, where('difficulty', 'in', filter.difficulty));
      }

      if (filter.minRating) {
        q = query(q, where('averageRating', '>=', filter.minRating));
      }

      if (filter.university) {
        q = query(q, where('university', '==', filter.university));
      }

      if (filter.course) {
        q = query(q, where('course', '==', filter.course));
      }

      q = query(q, where('isApproved', '==', true));
      q = query(q, where('isPublic', '==', true));

      q = query(q, orderBy('createdAt', 'desc'));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(pageSize));

      const snapshot = await getDocs(q);
      const materials: EducationalMaterial[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        materials.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ratings: data.ratings?.map((rating: any) => ({
            ...rating,
            createdAt: rating.createdAt?.toDate() || new Date(),
          })) || [],
          downloads: data.downloads?.map((download: any) => ({
            ...download,
            downloadedAt: download.downloadedAt?.toDate() || new Date(),
          })) || [],
        } as EducationalMaterial);
      });

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { materials, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      throw new Error('Falha ao buscar materiais');
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
          ratings: data.ratings?.map((rating: any) => ({
            ...rating,
            createdAt: rating.createdAt?.toDate() || new Date(),
          })) || [],
          downloads: data.downloads?.map((download: any) => ({
            ...download,
            downloadedAt: download.downloadedAt?.toDate() || new Date(),
          })) || [],
        } as EducationalMaterial;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar material:', error);
      throw new Error('Falha ao buscar material');
    }
  }

  static async incrementViews(materialId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
      await updateDoc(materialRef, {
        views: increment(1),
      });

      const material = await this.getMaterialById(materialId);
      if (material) {
        const { UserMetricsService } = await import('./userMetricsService');
        await UserMetricsService.updateMetricsOnMaterialChange(material.authorId);
      }
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  }

  static async addDownload(materialId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
      const downloadData: MaterialDownload = {
        userId,
        downloadedAt: new Date(),
      };

      await updateDoc(materialRef, {
        downloads: arrayUnion(downloadData),
        totalDownloads: increment(1),
      });

      const material = await this.getMaterialById(materialId);
      if (material) {
        const { UserMetricsService } = await import('./userMetricsService');
        await UserMetricsService.updateMetricsOnMaterialChange(material.authorId);
      }
    } catch (error) {
      console.error('Erro ao adicionar download:', error);
      throw new Error('Falha ao registrar download');
    }
  }

  static async addRating(
    materialId: string, 
    userId: string, 
    rating: number, 
    comment?: string
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
      const material = await this.getMaterialById(materialId);
      
      if (!material) {
        throw new Error('Material não encontrado');
      }

      const existingRatings = material.ratings.filter(r => r.userId !== userId);
      const newRating: MaterialRating = {
        userId,
        rating,
        comment,
        createdAt: new Date(),
      };

      const allRatings = [...existingRatings, newRating];
      const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await updateDoc(materialRef, {
        ratings: allRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length,
        updatedAt: serverTimestamp(),
      });

      await this.updateUserMetricsOnRating(material.authorId);
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw new Error('Falha ao adicionar avaliação');
    }
  }

  static async addShare(materialId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
      await updateDoc(materialRef, {
        shares: increment(1),
        updatedAt: serverTimestamp(),
      });

      const material = await this.getMaterialById(materialId);
      if (material) {
        const { UserMetricsService } = await import('./userMetricsService');
        await UserMetricsService.updateMetricsOnMaterialChange(material.authorId);
      }
    } catch (error) {
      console.error('Erro ao adicionar compartilhamento:', error);
      throw new Error('Falha ao registrar compartilhamento');
    }
  }

  private static async updateUserMetricsOnRating(authorId: string): Promise<void> {
    try {
      const { UserMetricsService } = await import('./userMetricsService');
      await UserMetricsService.updateMetricsOnMaterialChange(authorId);
    } catch (error) {
      console.error('Erro ao atualizar métricas do usuário:', error);
    }
  }

  static async getMaterialsByUser(userId: string): Promise<EducationalMaterial[]> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const materials: EducationalMaterial[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        materials.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ratings: data.ratings?.map((rating: any) => ({
            ...rating,
            createdAt: rating.createdAt?.toDate() || new Date(),
          })) || [],
          downloads: data.downloads?.map((download: any) => ({
            ...download,
            downloadedAt: download.downloadedAt?.toDate() || new Date(),
          })) || [],
        } as EducationalMaterial);
      });

      return materials;
    } catch (error) {
      console.error('Erro ao buscar materiais do usuário:', error);
      throw new Error('Falha ao buscar materiais do usuário');
    }
  }

  static async getPopularMaterials(limitCount: number = 10): Promise<EducationalMaterial[]> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('isApproved', '==', true),
        where('isPublic', '==', true),
        orderBy('totalDownloads', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const materials: EducationalMaterial[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        materials.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ratings: data.ratings?.map((rating: any) => ({
            ...rating,
            createdAt: rating.createdAt?.toDate() || new Date(),
          })) || [],
          downloads: data.downloads?.map((download: any) => ({
            ...download,
            downloadedAt: download.downloadedAt?.toDate() || new Date(),
          })) || [],
        } as EducationalMaterial);
      });

      return materials;
    } catch (error) {
      console.error('Erro ao buscar materiais populares:', error);
      throw new Error('Falha ao buscar materiais populares');
    }
  }

  static async searchMaterialsByTags(tags: string[]): Promise<EducationalMaterial[]> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const q = query(
        collection(db, MATERIALS_COLLECTION),
        where('isApproved', '==', true),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const materials: EducationalMaterial[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const materialTags = data.tags || [];
        
        const hasMatchingTag = tags.some(tag => 
          materialTags.some((materialTag: string) => 
            materialTag.toLowerCase().includes(tag.toLowerCase())
          )
        );

        if (hasMatchingTag) {
          materials.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            ratings: data.ratings?.map((rating: any) => ({
              ...rating,
              createdAt: rating.createdAt?.toDate() || new Date(),
            })) || [],
            downloads: data.downloads?.map((download: any) => ({
              ...download,
              downloadedAt: download.downloadedAt?.toDate() || new Date(),
            })) || [],
          } as EducationalMaterial);
        }
      });

      return materials;
    } catch (error) {
      console.error('Erro ao buscar materiais por tags:', error);
      throw new Error('Falha ao buscar materiais por tags');
    }
  }

  static async updateMaterial(
    materialId: string, 
    updates: Partial<MaterialUploadData>
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
      
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (updates.file) {
        const fileUrl = await this.uploadFile(updates.file, materialId);
        updateData.fileUrl = fileUrl;
        updateData.fileName = updates.file.name;
        updateData.fileSize = updates.file.size;
      }

      await updateDoc(materialRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      throw new Error('Falha ao atualizar material');
    }
  }

  static async deleteMaterial(materialId: string): Promise<void> {
    try {
      if (!db || !storage) {
        throw new Error('Firebase não está disponível');
      }
      
      const material = await this.getMaterialById(materialId);
      
      if (material?.fileUrl) {
        const fileRef = ref(storage, material.fileUrl);
        await deleteObject(fileRef);
      }

      const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
      await deleteDoc(materialRef);
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      throw new Error('Falha ao deletar material');
    }
  }

  static async getMaterialStats(): Promise<MaterialStats> {
    try {
      if (!db) {
        throw new Error('Firebase não está disponível');
      }
      
      const q = query(collection(db, MATERIALS_COLLECTION), where('isApproved', '==', true));
      const snapshot = await getDocs(q);

      const stats: MaterialStats = {
        totalMaterials: 0,
        materialsByType: {} as Record<MaterialType, number>,
        materialsBySubject: {} as Record<Subject, number>,
        materialsByDifficulty: {} as Record<DifficultyLevel, number>,
        averageRating: 0,
        totalDownloads: 0,
        totalViews: 0,
      };

      let totalRatingSum = 0;
      let materialsWithRatings = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        stats.totalMaterials++;

        const type = data.type as MaterialType;
        stats.materialsByType[type] = (stats.materialsByType[type] || 0) + 1;

        const subject = data.subject as Subject;
        stats.materialsBySubject[subject] = (stats.materialsBySubject[subject] || 0) + 1;

        const difficulty = data.difficulty as DifficultyLevel;
        stats.materialsByDifficulty[difficulty] = (stats.materialsByDifficulty[difficulty] || 0) + 1;

        stats.totalDownloads += data.totalDownloads || 0;
        stats.totalViews += data.views || 0;

        if (data.averageRating > 0) {
          totalRatingSum += data.averageRating;
          materialsWithRatings++;
        }
      });

      stats.averageRating = materialsWithRatings > 0 ? totalRatingSum / materialsWithRatings : 0;

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }
}