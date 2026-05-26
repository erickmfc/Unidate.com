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
  lastActivity: any;
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
  createdAt: any;
  updatedAt: any;
}

const DEFAULT_MOCK_GROUPS: Group[] = [
  {
    id: 'group_sqlite_mock_1',
    name: 'Gerações de T.I. 💻',
    description: 'Comunidade dos alunos de TI, ciência da computação e sistemas de informação para networking, ajuda em projetos e memes.',
    members: ['ai-bot-unidate'],
    editors: ['ai-bot-unidate'],
    maxMembers: 150,
    category: 'Estudos',
    university: 'UFRJ - Universidade Federal do Rio de Janeiro',
    isJoined: false,
    lastActivity: new Date().toISOString(),
    tags: ['ti', 'tecnologia', 'programacao'],
    createdBy: 'ai-bot-unidate',
    isOwner: false,
    isEditor: false,
    isPublic: true,
    image: '/api/placeholder/120/120',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'group_sqlite_mock_2',
    name: 'Cálculo 1 - Desespero & Café ☕',
    description: 'Grupo focado em sobreviver ao Cálculo 1. Compartilhamento de listas de exercícios, resoluções e ajuda mútua antes das provas.',
    members: ['ai-bot-unidate'],
    editors: ['ai-bot-unidate'],
    maxMembers: 100,
    category: 'Estudos',
    university: 'UFRJ - Universidade Federal do Rio de Janeiro',
    isJoined: false,
    lastActivity: new Date().toISOString(),
    tags: ['calculo1', 'matematica', 'engenharia'],
    createdBy: 'ai-bot-unidate',
    isOwner: false,
    isEditor: false,
    isPublic: true,
    image: '/api/placeholder/120/120',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'group_sqlite_mock_3',
    name: 'Atlética Geral do Campus 🏆',
    description: 'Fique por dentro de todos os campeonatos universitários, treinos, jogos, festas e produtos oficiais da nossa atlética.',
    members: ['ai-bot-unidate'],
    editors: ['ai-bot-unidate'],
    maxMembers: 300,
    category: 'Lazer',
    university: 'UFRJ - Universidade Federal do Rio de Janeiro',
    isJoined: false,
    lastActivity: new Date().toISOString(),
    tags: ['atletica', 'esportes', 'jogos'],
    createdBy: 'ai-bot-unidate',
    isOwner: false,
    isEditor: false,
    isPublic: true,
    image: '/api/placeholder/120/120',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const getLocalGroups = (): Group[] => {
  const local = localStorage.getItem('unidate_offline_groups');
  if (!local) {
    localStorage.setItem('unidate_offline_groups', JSON.stringify(DEFAULT_MOCK_GROUPS));
    return DEFAULT_MOCK_GROUPS;
  }
  return JSON.parse(local);
};

const saveLocalGroups = (groups: Group[]) => {
  localStorage.setItem('unidate_offline_groups', JSON.stringify(groups));
  window.dispatchEvent(new Event('local-groups-updated'));
};

export class GroupsService {
  static async createGroup(groupData: Omit<Group, 'id' | 'members' | 'editors' | 'isJoined' | 'isOwner' | 'isEditor' | 'lastActivity' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        console.log('🔄 [GROUPS] Criando grupo em modo local (localStorage)');
        const id = 'group_sqlite_' + Math.random().toString(36).substr(2, 9);
        const newGroup: Group = {
          id,
          ...groupData,
          members: [groupData.createdBy],
          editors: [groupData.createdBy],
          isJoined: true,
          isOwner: true,
          isEditor: true,
          lastActivity: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const allGroups = getLocalGroups();
        allGroups.push(newGroup);
        saveLocalGroups(allGroups);
        return id;
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
        console.log('🔄 [GROUPS] Carregando grupos locais');
        return getLocalGroups().slice(0, limitCount);
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
        console.log('🔄 [GROUPS] Carregando grupos locais por categoria:', category);
        return getLocalGroups().filter(g => g.category === category);
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
        console.log(`🖼️ [GROUPS] Atualizando foto do grupo local ${groupId} por usuário ${userId}`);
        const allGroups = getLocalGroups();
        const group = allGroups.find(g => g.id === groupId);
        if (!group) throw new Error('Grupo não encontrado');
        if (!group.members.includes(userId)) {
          throw new Error('Apenas membros do grupo podem alterar a foto');
        }
        group.image = imageUrl;
        group.updatedAt = new Date().toISOString();
        saveLocalGroups(allGroups);
        return;
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
        console.log(`🔄 [GROUPS] Membro local ${isJoining ? 'entrando' : 'saindo'} no grupo ${groupId}`);
        const allGroups = getLocalGroups();
        const group = allGroups.find(g => g.id === groupId);
        if (!group) throw new Error('Grupo não encontrado');
        
        const isAlreadyMember = group.members.includes(userId);
        if (isJoining && isAlreadyMember) return;
        if (!isJoining && !isAlreadyMember) return;
        
        if (isJoining) {
          group.members.push(userId);
        } else {
          group.members = group.members.filter(id => id !== userId);
        }
        
        group.lastActivity = new Date().toISOString();
        group.updatedAt = new Date().toISOString();
        saveLocalGroups(allGroups);
        return;
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
      } else {
        await updateDoc(groupRef, {
          members: arrayRemove(userId),
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      throw error;
    }
  }

  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      if (!db) {
        console.log('🔄 [GROUPS] Buscando grupos locais do usuário:', userId);
        return getLocalGroups().filter(g => g.members.includes(userId));
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
        return getLocalGroups().some(g => g.createdBy === userId);
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
        console.log('🔄 [GROUPS] Atualizando grupo local:', groupId);
        const allGroups = getLocalGroups();
        const index = allGroups.findIndex(g => g.id === groupId);
        if (index === -1) throw new Error('Grupo não encontrado');
        
        allGroups[index] = {
          ...allGroups[index],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        saveLocalGroups(allGroups);
        return;
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
        console.log('🔄 [GROUPS] Deletando grupo local:', groupId);
        const allGroups = getLocalGroups();
        const updated = allGroups.filter(g => g.id !== groupId);
        saveLocalGroups(updated);
        return;
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
        console.log('🔄 [GROUPS] Adicionando editor local ao grupo:', groupId);
        const allGroups = getLocalGroups();
        const group = allGroups.find(g => g.id === groupId);
        if (!group) throw new Error('Grupo não encontrado');
        if (!group.editors.includes(userId)) {
          group.editors.push(userId);
        }
        saveLocalGroups(allGroups);
        return;
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
        console.log('🔄 [GROUPS] Removendo editor local do grupo:', groupId);
        const allGroups = getLocalGroups();
        const group = allGroups.find(g => g.id === groupId);
        if (!group) throw new Error('Grupo não encontrado');
        group.editors = group.editors.filter(id => id !== userId);
        saveLocalGroups(allGroups);
        return;
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
        const group = getLocalGroups().find(g => g.id === groupId);
        return group ? group.editors.includes(userId) : false;
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
