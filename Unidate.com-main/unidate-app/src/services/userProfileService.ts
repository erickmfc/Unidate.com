import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  course: string;
  university: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  postsCount: number;
  friendsCount: number;
  isFriend: boolean;
  userType?: 'aluno' | 'professor' | 'uni';
}

export interface UserPost {
  id: string;
  titulo: string;
  conteudo: string;
  dataCriacao: any;
  curtidasPor: string[];
  numeroComentarios: number;
  hashtags: string[];
  tipo: string;
}

export class UserProfileService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!db) {
        // Try active profile first (logged in user)
        const activeProfileStr = localStorage.getItem('unidate_offline_profile');
        if (activeProfileStr) {
          const activeProfile = JSON.parse(activeProfileStr);
          if (activeProfile.uid === userId) {
            return {
              uid: activeProfile.uid,
              name: activeProfile.displayName || activeProfile.name || 'Usuário',
              email: activeProfile.email || '',
              course: activeProfile.course || 'Curso não informado',
              university: activeProfile.university || 'Universidade não informada',
              bio: activeProfile.bio || '',
              avatar: activeProfile.photoURL || activeProfile.avatar || '',
              joinDate: activeProfile.createdAt ? new Date(activeProfile.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              postsCount: 0,
              friendsCount: await this.getUserFriendsCount(userId),
              isFriend: false,
              userType: activeProfile.userType || 'aluno'
            };
          }
        }

        // Fetch from backend (SQLite)
        try {
          const response = await fetch(`${API_URL}/users/${userId}`);
          if (response.ok) {
            const u = await response.json();
            return {
              uid: u.uid,
              name: u.displayName || 'Usuário',
              email: u.email || '',
              course: u.course || 'Curso não informado',
              university: u.university || 'Universidade não informada',
              bio: u.bio || '',
              avatar: u.photoURL || '',
              joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              postsCount: 0,
              friendsCount: await this.getUserFriendsCount(userId),
              isFriend: false,
              userType: u.userType || 'aluno'
            };
          }
        } catch (fetchError) {
          console.error('Erro ao buscar perfil offline do backend:', fetchError);
        }

        // Fallback to local storage mock if any
        const mockProfiles = JSON.parse(localStorage.getItem('unidate_mock_profiles') || '[]');
        const localProfile = mockProfiles.find((p: any) => p.uid === userId);
        if (localProfile) {
          return {
            uid: localProfile.uid,
            name: localProfile.displayName || localProfile.name || 'Usuário',
            email: localProfile.email || '',
            course: localProfile.course || 'Curso não informado',
            university: localProfile.university || 'Universidade não informada',
            bio: localProfile.bio || '',
            avatar: localProfile.photoURL || localProfile.avatar || '',
            joinDate: localProfile.createdAt ? new Date(localProfile.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            postsCount: 0,
            friendsCount: await this.getUserFriendsCount(userId),
            isFriend: false,
            userType: localProfile.userType || 'aluno'
          };
        }
        
        throw new Error('Firebase não inicializado e usuário não encontrado no SQLite');
      }

      console.log('🔍 Buscando perfil do usuário:', userId);
      console.log('🔍 Firebase configurado:', !!db);
      console.log('🔍 Projeto ID:', db.app.options.projectId);

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      let userData;
      
      if (!userDoc.exists()) {
        console.log('❌ Usuário não encontrado na coleção users, tentando buscar em userProfiles...');
        
        const userProfileRef = doc(db, 'userProfiles', userId);
        const userProfileDoc = await getDoc(userProfileRef);
        
        if (!userProfileDoc.exists()) {
          console.log('❌ Usuário não encontrado em nenhuma coleção, tentando criar perfil básico...');
          
          const postsQuery = query(
            collection(db, 'posts'),
            where('autorId', '==', userId),
            limit(1)
          );
          const postsSnapshot = await getDocs(postsQuery);
          
          const groupPostsQuery = query(
            collection(db, 'groupPosts'),
            where('author.uid', '==', userId),
            limit(1)
          );
          const groupPostsSnapshot = await getDocs(groupPostsQuery);
          
          let autorNome = 'Usuário';
          let autorCurso = 'Curso não informado';
          let autorUniversidade = 'Universidade não informada';
          let autorAvatar = '';
          
          if (!postsSnapshot.empty) {
            const postData = postsSnapshot.docs[0].data();
            autorNome = postData.autorNome || postData.author?.name || 'Usuário';
            autorCurso = postData.autorCurso || postData.author?.course || 'Curso não informado';
            autorUniversidade = postData.autorUniversidade || postData.author?.university || 'Universidade não informada';
            autorAvatar = postData.autorAvatar || postData.author?.avatar || '';
          } 
          else if (!groupPostsSnapshot.empty) {
            const postData = groupPostsSnapshot.docs[0].data();
            autorNome = postData.author?.name || 'Usuário';
            autorCurso = postData.author?.course || 'Curso não informado';
            autorUniversidade = postData.author?.university || 'Universidade não informada';
            autorAvatar = postData.author?.avatar || '';
          }
          
          const postsCount = await this.getUserPostsCount(userId);
          
          let userType: 'aluno' | 'professor' | 'uni' | undefined = undefined;
          try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              userType = userDoc.data().userType || 'aluno';
            }
          } catch (error) {
            console.log('⚠️ Não foi possível buscar userType');
          }
          
          if (!postsSnapshot.empty || !groupPostsSnapshot.empty || postsCount > 0) {
            console.log('📝 Usuário tem posts, criando perfil básico...');
            
            const profile: UserProfile = {
              uid: userId,
              name: autorNome,
              email: '',
              course: autorCurso,
              university: autorUniversidade,
              bio: 'Usuário ativo no UniDate',
              avatar: autorAvatar,
              joinDate: new Date().toISOString().split('T')[0],
              postsCount,
              friendsCount: 0,
              isFriend: false,
              userType: userType || 'aluno'
            };
            
            console.log('✅ Perfil básico criado para usuário com posts:', profile);
            
            try {
              await setDoc(doc(db, 'userProfiles', userId), {
                uid: userId,
                displayName: autorNome,
                name: autorNome,
                course: autorCurso,
                university: autorUniversidade,
                bio: 'Usuário ativo no UniDate',
                photoURL: autorAvatar,
                avatar: autorAvatar,
                createdAt: serverTimestamp(),
                isBasicProfile: true,
                postsCount,
                friendsCount: 0
              });
              console.log('💾 Perfil básico salvo no Firebase');
            } catch (error) {
              console.error('❌ Erro ao salvar perfil básico:', error);
            }
            
            return profile;
          }
          
          console.log('⚠️ Usuário não encontrado em coleções, mas criando perfil mínimo...');
          
          let userTypeMinimal: 'aluno' | 'professor' | 'uni' | undefined = undefined;
          try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              userTypeMinimal = userDoc.data().userType || 'aluno';
            }
          } catch (error) {
            console.log('⚠️ Não foi possível buscar userType');
          }
          
          const minimalProfile: UserProfile = {
            uid: userId,
            name: 'Usuário',
            email: '',
            course: 'Curso não informado',
            university: 'Universidade não informada',
            bio: 'Usuário do UniDate',
            avatar: '',
            joinDate: new Date().toISOString().split('T')[0],
            postsCount: 0,
            friendsCount: 0,
            isFriend: false,
            userType: userTypeMinimal || 'aluno'
          };
          
          console.log('✅ Perfil mínimo criado:', minimalProfile);
          return minimalProfile;
        }
        
        userData = userProfileDoc.data();
        console.log('📋 Dados do usuário encontrados em userProfiles:', userData);
      } else {
        userData = userDoc.data();
        console.log('📋 Dados do usuário encontrados em users:', userData);
      }

      let authUser = null;
      try {
        const auth = getAuth();
      } catch (authError) {
        console.log('⚠️ Não foi possível buscar do Auth:', authError);
      }

      const postsCount = await this.getUserPostsCount(userId);
      const friendsCount = await this.getUserFriendsCount(userId);

      const profile: UserProfile = {
        uid: userId,
        name: userData.displayName || userData.name || userData.email?.split('@')[0] || 'Usuário',
        email: userData.email || '',
        course: userData.course || userData.curso || (userData.registrationNumber ? 'Curso não informado' : 'Curso não informado'),
        university: userData.university || userData.universidade || (userData.registrationNumber ? 'Universidade não informada' : 'Universidade não informada'),
        bio: userData.bio || '',
        avatar: userData.photoURL || userData.avatar || '',
        joinDate: userData.createdAt ? (userData.createdAt.toDate ? userData.createdAt.toDate().toISOString().split('T')[0] : new Date(userData.createdAt).toISOString().split('T')[0]) : (userData.updatedAt ? (userData.updatedAt.toDate ? userData.updatedAt.toDate().toISOString().split('T')[0] : new Date(userData.updatedAt).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]),
        postsCount,
        friendsCount,
        isFriend: false,
        userType: userData.userType || 'aluno'
      };

      console.log('✅ Perfil do usuário carregado:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Erro ao buscar perfil do usuário:', error);
      console.log('⚠️ Retornando perfil mínimo devido a erro');
      
      let userTypeError: 'aluno' | 'professor' | 'uni' | undefined = undefined;
      if (db) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            userTypeError = userDoc.data().userType || 'aluno';
          }
        } catch (error) {
          console.log('⚠️ Não foi possível buscar userType no erro');
        }
      }
      
      const minimalProfile: UserProfile = {
        uid: userId,
        name: 'Usuário',
        email: '',
        course: 'Curso não informado',
        university: 'Universidade não informada',
        bio: 'Usuário do UniDate',
        avatar: '',
        joinDate: new Date().toISOString().split('T')[0],
        postsCount: 0,
        friendsCount: 0,
        isFriend: false,
        userType: userTypeError || 'aluno'
      };
      return minimalProfile;
    }
  }

  static async getUserPosts(userId: string, limitCount: number = 10): Promise<UserPost[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('📝 Buscando posts do usuário:', userId);

      const posts: UserPost[] = [];

      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('autorId', '==', userId),
          orderBy('dataCriacao', 'desc'),
          limit(limitCount)
        );

        const postsSnapshot = await getDocs(postsQuery);
        postsSnapshot.forEach((doc) => {
          const data = doc.data();
          posts.push({
            id: doc.id,
            titulo: data.titulo || '',
            conteudo: data.conteudo || '',
            dataCriacao: data.dataCriacao,
            curtidasPor: data.curtidasPor || [],
            numeroComentarios: data.numeroComentarios || 0,
            hashtags: data.hashtags || [],
            tipo: data.tipo || 'texto'
          });
        });
      } catch (error) {
        console.error('❌ Erro ao buscar posts normais:', error);
      }

      if (posts.length < limitCount) {
        try {
          const groupPostsQuery = query(
            collection(db, 'groupPosts'),
            where('author.uid', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount - posts.length)
          );

          const groupPostsSnapshot = await getDocs(groupPostsQuery);
          groupPostsSnapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({
              id: doc.id,
              titulo: data.content?.substring(0, 50) || 'Post do grupo',
              conteudo: data.content || '',
              dataCriacao: data.createdAt,
              curtidasPor: data.likes || [],
              numeroComentarios: data.comments || 0,
              hashtags: data.hashtags || [],
              tipo: 'texto'
            });
          });
        } catch (error) {
          console.error('❌ Erro ao buscar posts de grupos:', error);
        }
      }

      posts.sort((a, b) => {
        const dateA = a.dataCriacao?.toDate ? a.dataCriacao.toDate().getTime() : 0;
        const dateB = b.dataCriacao?.toDate ? b.dataCriacao.toDate().getTime() : 0;
        return dateB - dateA;
      });

      console.log(`✅ ${posts.length} posts encontrados para o usuário`);
      return posts.slice(0, limitCount);
    } catch (error) {
      console.error('❌ Erro ao buscar posts do usuário:', error);
      return [];
    }
  }

  static async getUserPostsCount(userId: string): Promise<number> {
    try {
      if (!db) {
        return 0;
      }

      const postsQuery = query(
        collection(db, 'posts'),
        where('autorId', '==', userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const normalPostsCount = postsSnapshot.size;

      const groupPostsQuery = query(
        collection(db, 'groupPosts'),
        where('author.uid', '==', userId)
      );
      const groupPostsSnapshot = await getDocs(groupPostsQuery);
      const groupPostsCount = groupPostsSnapshot.size;

      return normalPostsCount + groupPostsCount;
    } catch (error) {
      console.error('❌ Erro ao contar posts do usuário:', error);
      return 0;
    }
  }

  static async getUserFriendsCount(userId: string): Promise<number> {
    try {
      if (!db) {
        const friendships = JSON.parse(localStorage.getItem('unidate_offline_friendships') || '[]');
        const userFriendships = friendships.filter((f: any) => 
          (f.user1Id === userId || f.user2Id === userId) && f.status === 'accepted'
        );
        return userFriendships.length;
      }

      const friendshipsQuery1 = query(
        collection(db, 'friendships'),
        where('user1Id', '==', userId),
        where('status', '==', 'accepted')
      );
      const friendshipsQuery2 = query(
        collection(db, 'friendships'),
        where('user2Id', '==', userId),
        where('status', '==', 'accepted')
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendshipsQuery1),
        getDocs(friendshipsQuery2)
      ]);

      return snapshot1.size + snapshot2.size;
    } catch (error) {
      console.error('❌ Erro ao contar amigos do usuário:', error);
      return 0;
    }
  }

  static async checkFriendship(userId1: string, userId2: string): Promise<boolean> {
    try {
      if (!db) {
        const friendships = JSON.parse(localStorage.getItem('unidate_offline_friendships') || '[]');
        return friendships.some((f: any) => 
          ((f.user1Id === userId1 && f.user2Id === userId2) || (f.user1Id === userId2 && f.user2Id === userId1)) && 
          f.status === 'accepted'
        );
      }

      const friendshipQuery1 = query(
        collection(db, 'friendships'),
        where('user1Id', '==', userId1),
        where('user2Id', '==', userId2),
        where('status', '==', 'accepted')
      );
      const friendshipQuery2 = query(
        collection(db, 'friendships'),
        where('user1Id', '==', userId2),
        where('user2Id', '==', userId1),
        where('status', '==', 'accepted')
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendshipQuery1),
        getDocs(friendshipQuery2)
      ]);

      return !snapshot1.empty || !snapshot2.empty;
    } catch (error) {
      console.error('❌ Erro ao verificar amizade:', error);
      return false;
    }
  }

  static async addFriend(userId1: string, userId2: string): Promise<void> {
    try {
      if (!db) {
        console.log('🔄 [FRIENDSHIP] Adicionando amizade offline entre:', userId1, 'e', userId2);
        const friendships = JSON.parse(localStorage.getItem('unidate_offline_friendships') || '[]');
        const exists = friendships.some((f: any) => 
          (f.user1Id === userId1 && f.user2Id === userId2) || (f.user1Id === userId2 && f.user2Id === userId1)
        );
        if (!exists) {
          friendships.push({
            user1Id: userId1,
            user2Id: userId2,
            status: 'accepted',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          localStorage.setItem('unidate_offline_friendships', JSON.stringify(friendships));
          window.dispatchEvent(new Event('local-friendships-updated'));
        }
        return;
      }

      if (!userId1 || !userId2 || userId1 === userId2) {
        throw new Error('IDs de usuário inválidos');
      }

      console.log('🔄 [FRIENDSHIP] Adicionando amizade entre:', userId1, 'e', userId2);

      const query1 = query(
        collection(db, 'friendships'),
        where('user1Id', '==', userId1),
        where('user2Id', '==', userId2)
      );
      
      const query2 = query(
        collection(db, 'friendships'),
        where('user1Id', '==', userId2),
        where('user2Id', '==', userId1)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(query1),
        getDocs(query2)
      ]);

      const existingDoc = snapshot1.empty ? (snapshot2.empty ? null : snapshot2.docs[0]) : snapshot1.docs[0];

      if (existingDoc) {
        console.log('🔄 [FRIENDSHIP] Amizade já existe, atualizando status...');
        await updateDoc(doc(db, 'friendships', existingDoc.id), {
          status: 'accepted',
          updatedAt: serverTimestamp()
        });
        console.log('✅ [FRIENDSHIP] Amizade atualizada com sucesso');
      } else {
        const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

        console.log('🔄 [FRIENDSHIP] Criando nova amizade...');
        await addDoc(collection(db, 'friendships'), {
          user1Id: user1,
          user2Id: user2,
          status: 'accepted',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ [FRIENDSHIP] Amizade criada com sucesso');
      }
    } catch (error: any) {
      console.error('❌ [FRIENDSHIP] Erro ao adicionar amigo:', error);
      console.error('❌ [FRIENDSHIP] Código do erro:', error.code);
      console.error('❌ [FRIENDSHIP] Mensagem:', error.message);
      
      if (error.code === 'permission-denied') {
        throw new Error('Você não tem permissão para adicionar colegas. Verifique se está logado.');
      } else if (error.code === 'unavailable') {
        throw new Error('Serviço temporariamente indisponível. Tente novamente.');
      } else {
        throw new Error("Erro ao adicionar colega: " + (error.message || "Erro desconhecido"));
      }
    }
  }

  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      if (!db) {
        console.log('🔍 [USER PROFILE] Buscando usuários offline do SQLite:', searchTerm);
        const allUsers = await this.getAllUsers();
        return allUsers.filter((u: any) => 
          (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      console.log('🔍 Buscando usuários com termo:', searchTerm);

      const nameQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\\uf8ff'),
        limit(10)
      );

      const nameSnapshot = await getDocs(nameQuery);
      const users: UserProfile[] = [];

      nameSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          name: data.displayName || data.name || 'Usuário',
          email: data.email || '',
          course: data.course || data.curso || 'Curso não informado',
          university: data.university || data.universidade || 'Universidade não informada',
          bio: data.bio || '',
          avatar: data.photoURL || data.avatar || '',
          joinDate: data.createdAt ? data.createdAt.toDate().toISOString().split('T')[0] : new Date(data.createdAt).toISOString().split('T')[0],
          postsCount: 0,
          friendsCount: 0,
          isFriend: false,
          userType: data.userType || 'aluno'
        });
      });

      console.log("✅ " + users.length + " usuários encontrados");
      return users;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return [];
    }
  }

  static async getAllUsers(limitCount: number = 200): Promise<UserProfile[]> {
    try {
      if (!db) {
        console.log('⚡ [USER PROFILE] Carregando todos os usuários offline do SQLite');
        try {
          const response = await fetch(`${API_URL}/users`);
          if (response.ok) {
            const usersData = await response.json();
            const mappedUsers = await Promise.all(usersData.map(async (u: any) => {
              const friendsCount = await this.getUserFriendsCount(u.uid);
              return {
                uid: u.uid,
                name: u.displayName || 'Usuário',
                email: u.email || '',
                course: u.course || 'Curso não informado',
                university: u.university || 'Universidade não informada',
                bio: u.bio || '',
                avatar: u.photoURL || '',
                joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                postsCount: 0,
                friendsCount,
                isFriend: false,
                userType: u.userType || 'aluno'
              };
            }));
            return mappedUsers;
          }
        } catch (fetchError) {
          console.error('Erro ao buscar usuários do SQLite, usando fallback de mock:', fetchError);
        }

        // Fallback
        const mockProfiles = JSON.parse(localStorage.getItem('unidate_mock_profiles') || '[]');
        return mockProfiles.map((p: any) => ({
          uid: p.uid,
          name: p.displayName || p.name || 'Usuário',
          email: p.email || '',
          course: p.course || 'Curso não informado',
          university: p.university || 'Universidade não informada',
          bio: p.bio || '',
          avatar: p.photoURL || p.avatar || '',
          joinDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          postsCount: 0,
          friendsCount: 0,
          isFriend: false,
          userType: p.userType || 'aluno'
        }));
      }

      console.log('⚡ Buscando todos os usuários no Firebase...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(query(usersRef, limit(limitCount)));
      const users: UserProfile[] = [];

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          name: data.displayName || data.name || 'Usuário',
          email: data.email || '',
          course: data.course || data.curso || 'Curso não informado',
          university: data.university || data.universidade || 'Universidade não informada',
          bio: data.bio || '',
          avatar: data.photoURL || data.avatar || '',
          joinDate: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : new Date(data.createdAt).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          postsCount: 0,
          friendsCount: 0,
          isFriend: false,
          userType: data.userType || 'aluno'
        });
      });

      return users;
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      return [];
    }
  }

  static async userExists(userId: string): Promise<boolean> {
    try {
      if (!db) {
        return false;
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error('❌ Erro ao verificar se usuário existe:', error);
      return false;
    }
  }

  static async debugListAllUsers(): Promise<void> {
    try {
      if (!db) {
        console.log('❌ Firebase não inicializado para debug');
        return;
      }

      console.log('🔍 [DEBUG] Listando todos os usuários...');
      
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log(`📋 [DEBUG] ${usersSnapshot.size} usuários encontrados na coleção 'users':`);
      usersSnapshot.forEach((doc) => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

      const userProfilesQuery = query(collection(db, 'userProfiles'));
      const userProfilesSnapshot = await getDocs(userProfilesQuery);
      
      console.log(`📋 [DEBUG] ${userProfilesSnapshot.size} usuários encontrados na coleção 'userProfiles':`);
      userProfilesSnapshot.forEach((doc) => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

      const postsQuery = query(collection(db, 'posts'), limit(5));
      const postsSnapshot = await getDocs(postsQuery);
      
      console.log(`📋 [DEBUG] ${postsSnapshot.size} posts encontrados (primeiros 5):`);
      postsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  - Post ${doc.id}: autorId = ${data.autorId}, autorNome = ${data.autorNome}`);
      });

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao listar usuários:', error);
    }
  }
}
