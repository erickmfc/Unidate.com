import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[]; // Array de UIDs dos membros
  maxMembers?: number;
  category: string;
  university: string;
  isJoined: boolean;
  lastActivity: Timestamp;
  image?: string;
  tags: string[];
  createdBy: string; // UID do criador
  isOwner: boolean;
  isPublic: boolean;
  upcomingEvents?: {
    title: string;
    date: string;
    attendees: number;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class GroupsService {
  // Criar novo grupo
  static async createGroup(groupData: Omit<Group, 'id' | 'members' | 'isJoined' | 'isOwner' | 'lastActivity' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        members: [groupData.createdBy], // Criador é automaticamente membro
        isJoined: false, // Será atualizado pelo frontend
        isOwner: false, // Será atualizado pelo frontend
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Grupo criado com sucesso:', groupRef.id);
      return groupRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      throw error;
    }
  }

  // Buscar grupos
  static async getGroups(limitCount: number = 50): Promise<Group[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'groups'),
        orderBy('lastActivity', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const groups: Group[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          lastActivity: data.lastActivity || serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp()
        } as Group);
      });

      console.log(`✅ ${groups.length} grupos carregados`);
      return groups;
    } catch (error) {
      console.error('❌ Erro ao carregar grupos:', error);
      return [];
    }
  }

  // Buscar grupos por categoria
  static async getGroupsByCategory(category: string): Promise<Group[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'groups'),
        where('category', '==', category),
        orderBy('lastActivity', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const groups: Group[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          lastActivity: data.lastActivity || serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp()
        } as Group);
      });

      return groups;
    } catch (error) {
      console.error('❌ Erro ao buscar grupos por categoria:', error);
      return [];
    }
  }

  // Entrar/sair de um grupo
  static async toggleGroupMembership(groupId: string, userId: string, isJoining: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = doc(db, 'groups', groupId);
      
      if (isJoining) {
        await updateDoc(groupRef, {
          members: arrayUnion(userId),
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(groupRef, {
          members: arrayRemove(userId),
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log(`✅ Usuário ${isJoining ? 'entrou' : 'saiu'} do grupo`);
    } catch (error) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      throw error;
    }
  }

  // Buscar grupos do usuário
  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const groups: Group[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          lastActivity: data.lastActivity || serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp()
        } as Group);
      });

      return groups;
    } catch (error) {
      console.error('❌ Erro ao buscar grupos do usuário:', error);
      return [];
    }
  }

  // Verificar se usuário já criou um grupo
  static async hasUserCreatedGroup(userId: string): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'groups'),
        where('createdBy', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Erro ao verificar grupos criados:', error);
      return false;
    }
  }

  // Atualizar grupo
  static async updateGroup(groupId: string, updateData: Partial<Group>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Grupo atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar grupo:', error);
      throw error;
    }
  }

  // Deletar grupo
  static async deleteGroup(groupId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      await deleteDoc(doc(db, 'groups', groupId));
      console.log('✅ Grupo deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar grupo:', error);
      throw error;
    }
  }
}
