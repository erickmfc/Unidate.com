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
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  editors: string[];
  maxMembers?: number;
  category: string;
  university: string;
  isJoined: boolean;
  lastActivity: Timestamp;
  image?: string;
  tags: string[];
  createdBy: string;
  isOwner: boolean;
  isEditor: boolean;
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
  static async createGroup(groupData: Omit<Group, 'id' | 'members' | 'editors' | 'isJoined' | 'isOwner' | 'isEditor' | 'lastActivity' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        members: [groupData.createdBy],
        editors: [groupData.createdBy],
        isJoined: false,
        isOwner: false,
        isEditor: false,
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

  static async updateGroupImage(groupId: string, userId: string, imageUrl: string): Promise<void> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        throw new Error('Firebase não inicializado');
      }

      console.log(`🖼️ Atualizando foto do grupo ${groupId} por usuário ${userId}`);

      const groupRef = doc(db, 'groups', groupId);
      
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) {
        throw new Error('Grupo não encontrado');
      }

      const groupData = groupDoc.data();
      
      if (!groupData.members.includes(userId)) {
        throw new Error('Apenas membros do grupo podem alterar a foto');
      }

      await updateDoc(groupRef, {
        image: imageUrl,
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Foto do grupo ${groupId} atualizada com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao atualizar foto do grupo:', error);
      throw error;
    }
  }

  static async toggleGroupMembership(groupId: string, userId: string, isJoining: boolean): Promise<void> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        throw new Error('Firebase não está disponível. Verifique sua conexão.');
      }

      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      console.log(`🔄 Tentando ${isJoining ? 'entrar' : 'sair'} do grupo ${groupId} para usuário ${userId}`);

      const groupRef = doc(db, 'groups', groupId);
      
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) {
        throw new Error('Grupo não encontrado');
      }

      const groupData = groupDoc.data();
      console.log('📋 Dados do grupo:', groupData);
      
      const isAlreadyMember = groupData.members?.includes(userId) || false;
      
      if (isJoining && isAlreadyMember) {
        console.log('⚠️ Usuário já é membro do grupo');
        return;
      }
      
      if (!isJoining && !isAlreadyMember) {
        console.log('⚠️ Usuário não é membro do grupo');
        return;
      }
      
      if (isJoining) {
        await updateDoc(groupRef, {
          members: arrayUnion(userId),
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Usuário ${userId} entrou no grupo ${groupId}`);
      } else {
        await updateDoc(groupRef, {
          members: arrayRemove(userId),
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Usuário ${userId} saiu do grupo ${groupId}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      console.error('❌ Detalhes do erro:', {
        groupId,
        userId,
        isJoining,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          throw new Error('Você não tem permissão para esta ação');
        } else if (error.message.includes('not-found')) {
          throw new Error('Grupo não encontrado');
        } else if (error.message.includes('unavailable')) {
          throw new Error('Serviço temporariamente indisponível. Tente novamente.');
        }
      }
      
      throw error;
    }
  }

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

  static async addEditor(groupId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        editors: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Editor adicionado ao grupo:', groupId);
    } catch (error) {
      console.error('❌ Erro ao adicionar editor ao grupo:', error);
      throw error;
    }
  }

  static async removeEditor(groupId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        editors: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Editor removido do grupo:', groupId);
    } catch (error) {
      console.error('❌ Erro ao remover editor do grupo:', error);
      throw error;
    }
  }

  static async isEditor(groupId: string, userId: string): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        return groupData.editors?.includes(userId) || false;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar se usuário é editor:', error);
      return false;
    }
  }
}
