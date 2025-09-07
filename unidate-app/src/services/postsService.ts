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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Post {
  id: string;
  author: {
    uid: string;
    name: string;
    course: string;
    university: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'poll' | 'tevi';
  image?: string;
  timestamp: Timestamp;
  likes: number;
  comments: number;
  isLiked: boolean;
  location?: string;
  teviData?: {
    location: string;
    clothing: string;
    activity: string;
  };
  pollData?: {
    question: string;
    options: string[];
    votes: number[];
  };
  event?: {
    title: string;
    date: string;
    attendees: number;
  };
  hashtags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class PostsService {
  // Criar novo post
  static async createPost(postData: Omit<Post, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        throw new Error('Firebase não está disponível. Verifique sua conexão.');
      }

      console.log('🔄 Tentando criar post no Firebase...', postData);

      // Filtrar campos undefined para evitar erro no Firebase
      const cleanPostData: any = {
        author: postData.author,
        authorId: postData.author.uid,
        content: postData.content,
        type: postData.type,
        likes: postData.likes,
        comments: postData.comments,
        isLiked: postData.isLiked,
        hashtags: postData.hashtags || [],
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Adicionar campos opcionais apenas se não forem undefined
      if (postData.image) cleanPostData.image = postData.image;
      if (postData.location) cleanPostData.location = postData.location;
      if (postData.teviData) cleanPostData.teviData = postData.teviData;
      if (postData.pollData) cleanPostData.pollData = postData.pollData;
      if (postData.event) cleanPostData.event = postData.event;

      const postRef = await addDoc(collection(db, 'posts'), cleanPostData);

      console.log('✅ Post criado com sucesso no Firebase:', postRef.id);
      return postRef.id;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao criar post:', error);
      
      // Tratar erros específicos
      if (error.code === 'permission-denied') {
        throw new Error('Permissão negada. Verifique as regras do Firestore.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase temporariamente indisponível. Tente novamente.');
      } else if (error.message?.includes('Firebase')) {
        throw new Error('Erro de conexão com Firebase. Verifique sua internet.');
      } else {
        throw new Error(`Erro ao salvar post: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  // Buscar posts
  static async getPosts(limitCount: number = 50): Promise<Post[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp || serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp()
        } as Post);
      });

      console.log(`✅ ${posts.length} posts carregados`);
      return posts;
    } catch (error) {
      console.error('❌ Erro ao carregar posts:', error);
      return [];
    }
  }

  // Curtir/descurtir post
  static async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        isLiked: !isLiked,
        likes: isLiked ? -1 : 1, // Incremento/decremento
        updatedAt: serverTimestamp()
      });

      console.log('✅ Like atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar like:', error);
      throw error;
    }
  }

  // Adicionar comentário
  static async addComment(postId: string, commentData: any): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: 1, // Incremento
        updatedAt: serverTimestamp()
      });

      // Adicionar comentário na subcoleção
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        ...commentData,
        timestamp: serverTimestamp()
      });

      console.log('✅ Comentário adicionado');
    } catch (error) {
      console.error('❌ Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  // Buscar posts por hashtag
  static async getPostsByHashtag(hashtag: string): Promise<Post[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'posts'),
        where('hashtags', 'array-contains', hashtag),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp || serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp()
        } as Post);
      });

      return posts;
    } catch (error) {
      console.error('❌ Erro ao buscar posts por hashtag:', error);
      return [];
    }
  }

  // Buscar hashtags em trending
  static async getTrendingHashtags(): Promise<{tag: string, posts: number}[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Por enquanto, retornar hashtags mockadas
      // TODO: Implementar lógica real de trending
      return [
        { tag: '#UFRJ', posts: 45 },
        { tag: '#Engenharia', posts: 32 },
        { tag: '#Campus', posts: 28 },
        { tag: '#Estudos', posts: 25 },
        { tag: '#Festa', posts: 20 }
      ];
    } catch (error) {
      console.error('❌ Erro ao buscar hashtags trending:', error);
      return [];
    }
  }
}
