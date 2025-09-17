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
  serverTimestamp
} from 'firebase/firestore';
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
  // Buscar perfil de usuário por UID
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('🔍 Buscando perfil do usuário:', userId);
      console.log('🔍 Firebase configurado:', !!db);
      console.log('🔍 Projeto ID:', db.app.options.projectId);

      // Buscar dados do usuário na coleção 'users'
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      let userData;
      
      if (!userDoc.exists()) {
        console.log('❌ Usuário não encontrado na coleção users, tentando buscar em userProfiles...');
        
        // Tentar buscar na coleção 'userProfiles' como fallback
        const userProfileRef = doc(db, 'userProfiles', userId);
        const userProfileDoc = await getDoc(userProfileRef);
        
        if (!userProfileDoc.exists()) {
          console.log('❌ Usuário não encontrado em nenhuma coleção, tentando criar perfil básico...');
          
          // Verificar se o usuário tem posts (significa que existe mas não tem perfil completo)
          const postsCount = await this.getUserPostsCount(userId);
          if (postsCount > 0) {
            console.log('📝 Usuário tem posts, criando perfil básico...');
            
            // Criar perfil básico baseado nos dados dos posts
            const userPosts = await this.getUserPosts(userId, 1);
            if (userPosts.length > 0) {
              // Tentar extrair informações do primeiro post
              const firstPost = userPosts[0];
              
              // Buscar informações do autor nos posts
              const postsQuery = query(
                collection(db, 'posts'),
                where('autorId', '==', userId),
                limit(1)
              );
              const postsSnapshot = await getDocs(postsQuery);
              
              let autorNome = 'Usuário';
              let autorCurso = 'Curso não informado';
              let autorUniversidade = 'Universidade não informada';
              
              if (!postsSnapshot.empty) {
                const postData = postsSnapshot.docs[0].data();
                autorNome = postData.autorNome || 'Usuário';
                autorCurso = postData.autorCurso || 'Curso não informado';
                autorUniversidade = postData.autorUniversidade || 'Universidade não informada';
              }
              
              const profile: UserProfile = {
                uid: userId,
                name: autorNome,
                email: '',
                course: autorCurso,
                university: autorUniversidade,
                bio: 'Usuário ativo no UniDate',
                avatar: '',
                joinDate: new Date().toISOString().split('T')[0],
                postsCount,
                friendsCount: 0,
                isFriend: false
              };
              
              console.log('✅ Perfil básico criado para usuário com posts:', profile);
              
              // Salvar o perfil básico no Firebase para futuras consultas
              try {
                await setDoc(doc(db, 'userProfiles', userId), {
                  uid: userId,
                  displayName: autorNome,
                  name: autorNome,
                  course: autorCurso,
                  university: autorUniversidade,
                  bio: 'Usuário ativo no UniDate',
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
          }
          
          console.log('❌ Usuário não encontrado e sem posts');
          return null;
        }
        
        userData = userProfileDoc.data();
        console.log('📋 Dados do usuário encontrados em userProfiles:', userData);
      } else {
        userData = userDoc.data();
        console.log('📋 Dados do usuário encontrados em users:', userData);
      }

      // Buscar estatísticas do usuário
      const postsCount = await this.getUserPostsCount(userId);
      const friendsCount = await this.getUserFriendsCount(userId);

      const profile: UserProfile = {
        uid: userId,
        name: userData.displayName || userData.name || 'Usuário',
        email: userData.email || '',
        course: userData.course || userData.curso || 'Curso não informado',
        university: userData.university || userData.universidade || 'Universidade não informada',
        bio: userData.bio || userData.bio || '',
        avatar: userData.photoURL || userData.avatar || '',
        joinDate: userData.createdAt ? userData.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        postsCount,
        friendsCount,
        isFriend: false // TODO: Implementar verificação de amizade
      };

      console.log('✅ Perfil do usuário carregado:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  // Buscar posts do usuário
  static async getUserPosts(userId: string, limitCount: number = 10): Promise<UserPost[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('📝 Buscando posts do usuário:', userId);

      const postsQuery = query(
        collection(db, 'posts'),
        where('autorId', '==', userId),
        orderBy('dataCriacao', 'desc'),
        limit(limitCount)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const posts: UserPost[] = [];

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

      console.log(`✅ ${posts.length} posts encontrados para o usuário`);
      return posts;
    } catch (error) {
      console.error('❌ Erro ao buscar posts do usuário:', error);
      return [];
    }
  }

  // Contar posts do usuário
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
      return postsSnapshot.size;
    } catch (error) {
      console.error('❌ Erro ao contar posts do usuário:', error);
      return 0;
    }
  }

  // Contar amigos do usuário (placeholder - implementar quando tivermos sistema de amigos)
  static async getUserFriendsCount(userId: string): Promise<number> {
    try {
      // TODO: Implementar sistema de amigos
      // Por enquanto, retornar 0
      return 0;
    } catch (error) {
      console.error('❌ Erro ao contar amigos do usuário:', error);
      return 0;
    }
  }

  // Buscar usuário por nome ou email (para busca)
  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('🔍 Buscando usuários com termo:', searchTerm);

      // Buscar por nome
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
          postsCount: 0, // Será calculado se necessário
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

  // Verificar se usuário existe
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

  // Função de debug para listar todos os usuários
  static async debugListAllUsers(): Promise<void> {
    try {
      if (!db) {
        console.log('❌ Firebase não inicializado para debug');
        return;
      }

      console.log('🔍 [DEBUG] Listando todos os usuários...');
      
      // Listar usuários da coleção 'users'
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log(`📋 [DEBUG] ${usersSnapshot.size} usuários encontrados na coleção 'users':`);
      usersSnapshot.forEach((doc) => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

      // Listar usuários da coleção 'userProfiles'
      const userProfilesQuery = query(collection(db, 'userProfiles'));
      const userProfilesSnapshot = await getDocs(userProfilesQuery);
      
      console.log(`📋 [DEBUG] ${userProfilesSnapshot.size} usuários encontrados na coleção 'userProfiles':`);
      userProfilesSnapshot.forEach((doc) => {
        console.log(`  - ${doc.id}:`, doc.data());
      });

      // Listar alguns posts para ver os autorIds
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
