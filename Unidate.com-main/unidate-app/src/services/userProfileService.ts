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
        throw new Error('Firebase não inicializado');
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
        return 0;
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
        return false;
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
        throw new Error('Firebase não inicializado');
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
        throw new Error(`Erro ao adicionar colega: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('🔍 Buscando usuários com termo:', searchTerm);

      const nameQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
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
          joinDate: data.createdAt ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          postsCount: 0,
          friendsCount: 0,
          isFriend: false
        });
      });

      console.log(`✅ ${users.length} usuários encontrados`);
      return users;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Busca todos os usuários do sistema (limitado)
   */
  static async getAllUsers(limitCount: number = 50): Promise<UserProfile[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(limitCount));
      const snapshot = await getDocs(q);

      const users: UserProfile[] = [];
      const userIds: string[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        userIds.push(doc.id);
        users.push({
          uid: doc.id,
          name: data.displayName || data.name || 'Usuário',
          email: data.email || '',
          course: data.course || data.curso || 'Curso não informado',
          university: data.university || data.universidade || 'Universidade não informada',
          bio: data.bio || '',
          avatar: data.photoURL || data.avatar || '',
          joinDate: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : new Date(data.createdAt).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          postsCount: data.postsCount || 0,
          friendsCount: data.friendsCount || 0,
          isFriend: false
        });
      });

      if (userIds.length > 0) {
        const postsPromises = userIds.map(async (userId) => {
          try {
            if (!db) return { userId, count: 0 };
            const postsQuery = query(
              collection(db, 'posts'),
              where('autorId', '==', userId)
            );
            const postsSnapshot = await getDocs(postsQuery);
            return { userId, count: postsSnapshot.size };
          } catch (error) {
            console.error(`Erro ao contar posts do usuário ${userId}:`, error);
            return { userId, count: 0 };
          }
        });

        const postsCounts = await Promise.all(postsPromises);
        postsCounts.forEach(({ userId, count }) => {
          const user = users.find(u => u.uid === userId);
          if (user) {
            user.postsCount = count;
          }
        });
      }

      if (users.length < limitCount) {
        const userProfilesRef = collection(db, 'userProfiles');
        const profilesQuery = query(userProfilesRef, limit(limitCount - users.length));
        const profilesSnapshot = await getDocs(profilesQuery);

        const additionalUserIds: string[] = [];
        
        profilesSnapshot.forEach((doc) => {
          if (!users.find(u => u.uid === doc.id)) {
            const data = doc.data();
            additionalUserIds.push(doc.id);
            users.push({
              uid: doc.id,
              name: data.name || data.displayName || 'Usuário',
              email: data.email || '',
              course: data.course || 'Curso não informado',
              university: data.university || 'Universidade não informada',
              bio: data.bio || '',
              avatar: data.avatar || data.photoURL || '',
              joinDate: data.joinDate || new Date().toISOString().split('T')[0],
              postsCount: data.postsCount || 0,
              friendsCount: data.friendsCount || 0,
              isFriend: false
            });
          }
        });

        if (additionalUserIds.length > 0) {
          const additionalPostsPromises = additionalUserIds.map(async (userId) => {
            try {
              if (!db) return { userId, count: 0 };
              const postsQuery = query(
                collection(db, 'posts'),
                where('autorId', '==', userId)
              );
              const postsSnapshot = await getDocs(postsQuery);
              return { userId, count: postsSnapshot.size };
            } catch (error) {
              console.error(`Erro ao contar posts do usuário ${userId}:`, error);
              return { userId, count: 0 };
            }
          });

          const additionalPostsCounts = await Promise.all(additionalPostsPromises);
          additionalPostsCounts.forEach(({ userId, count }) => {
            const user = users.find(u => u.uid === userId);
            if (user) {
              user.postsCount = count;
            }
          });
        }
      }

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