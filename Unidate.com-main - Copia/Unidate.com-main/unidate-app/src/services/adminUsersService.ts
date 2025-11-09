import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  university: string;
  course: string;
  year?: number;
  status: 'active' | 'suspended' | 'banned';
  isVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  postsCount: number;
  groupsCount: number;
  reportsCount: number;
  warningsCount: number;
  role?: string;
}

export class AdminUsersService {
  static async getUsers(maxUsers: number = 100): Promise<AdminUser[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('📊 Buscando usuários do admin...');

      // Buscar de ambas as coleções
      const usersRef = collection(db, 'users');
      const profilesRef = collection(db, 'userProfiles');

      const [usersSnapshot, profilesSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(profilesRef)
      ]);

      const userMap = new Map<string, any>();

      // Processar users
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        userMap.set(doc.id, {
          id: doc.id,
          displayName: data.displayName || data.name || 'Usuário',
          email: data.email || '',
          photoURL: data.photoURL || data.avatar || '',
          university: data.university || data.universidade || 'Não informado',
          course: data.course || data.curso || 'Não informado',
          year: data.year || data.ano || undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : undefined,
          role: data.role || 'user',
          isActive: data.isActive !== false
        });
      });

      // Processar userProfiles (atualizar dados existentes ou criar novos)
      profilesSnapshot.forEach(doc => {
        const data = doc.data();
        const existing = userMap.get(doc.id);
        
        if (existing) {
          // Atualizar dados existentes
          existing.university = data.university || existing.university;
          existing.course = data.course || existing.course;
          existing.photoURL = data.avatar || data.photoURL || existing.photoURL;
        } else {
          // Criar novo registro
          userMap.set(doc.id, {
            id: doc.id,
            displayName: data.name || data.displayName || 'Usuário',
            email: data.email || '',
            photoURL: data.avatar || data.photoURL || '',
            university: data.university || 'Não informado',
            course: data.course || 'Não informado',
            year: data.year || undefined,
            createdAt: data.joinDate ? new Date(data.joinDate) : new Date(),
            lastLogin: undefined,
            role: 'user',
            isActive: true
          });
        }
      });

      // Buscar contagens de posts, grupos e denúncias
      const usersWithCounts = await Promise.all(
        Array.from(userMap.values()).slice(0, maxUsers).map(async (user) => {
          const [postsCount, groupsCount, reportsCount] = await Promise.all([
            this.getUserPostsCount(user.id),
            this.getUserGroupsCount(user.id),
            this.getUserReportsCount(user.id)
          ]);

          return {
            ...user,
            postsCount,
            groupsCount,
            reportsCount,
            warningsCount: 0 // TODO: Implementar contagem de avisos
          };
        })
      );

      // Converter para formato AdminUser
      const adminUsers: AdminUser[] = usersWithCounts.map(user => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        university: user.university,
        course: user.course,
        year: user.year,
        status: user.isActive ? 'active' : 'suspended',
        isVerified: user.role === 'admin' || user.role === 'super-admin',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        postsCount: user.postsCount,
        groupsCount: user.groupsCount,
        reportsCount: user.reportsCount,
        warningsCount: user.warningsCount,
        role: user.role
      }));

      console.log(`✅ ${adminUsers.length} usuários encontrados`);
      return adminUsers;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return [];
    }
  }

  private static async getUserPostsCount(userId: string): Promise<number> {
    try {
      if (!db) return 0;
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('autorId', '==', userId)
      );
      const snapshot = await getDocs(postsQuery);
      return snapshot.size;
    } catch (error) {
      console.error(`Erro ao contar posts do usuário ${userId}:`, error);
      return 0;
    }
  }

  private static async getUserGroupsCount(userId: string): Promise<number> {
    try {
      if (!db) return 0;
      const groupsRef = collection(db, 'groups');
      const groupsQuery = query(groupsRef);
      const snapshot = await getDocs(groupsQuery);
      
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const members = data.members || data.memberIds || [];
        if (Array.isArray(members) && members.includes(userId)) {
          count++;
        }
      });
      
      return count;
    } catch (error) {
      console.error(`Erro ao contar grupos do usuário ${userId}:`, error);
      return 0;
    }
  }

  private static async getUserReportsCount(userId: string): Promise<number> {
    try {
      if (!db) return 0;
      const reportsRef = collection(db, 'reports');
      const reportsQuery = query(
        reportsRef,
        where('reportedUserId', '==', userId),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(reportsQuery);
      return snapshot.size;
    } catch (error) {
      console.error(`Erro ao contar denúncias do usuário ${userId}:`, error);
      return 0;
    }
  }

  static async getUserDetails(userId: string): Promise<{
    user: AdminUser;
    posts: any[];
    groups: any[];
    reports: any[];
  }> {
    try {
      const user = (await this.getUsers(1000)).find(u => u.id === userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Buscar posts
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('autorId', '==', userId),
        orderBy('dataCriacao', 'desc'),
        limit(10)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Buscar grupos
      const groupsRef = collection(db!, 'groups');
      const groupsQuery = query(groupsRef, limit(100));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groups = groupsSnapshot.docs
        .filter(doc => {
          const data = doc.data();
          const members = data.members || data.memberIds || [];
          return Array.isArray(members) && members.includes(userId);
        })
        .slice(0, 10)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      // Buscar denúncias
      const reportsRef = collection(db!, 'reports');
      const reportsQuery = query(
        reportsRef,
        where('reportedUserId', '==', userId),
        orderBy('reportedAt', 'desc'),
        limit(10)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const reports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        user,
        posts,
        groups,
        reports
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
      throw error;
    }
  }
}

