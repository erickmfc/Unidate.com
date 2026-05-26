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
  static async createPost(postData: Omit<Post, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        throw new Error('Firebase não está disponível. Verifique sua conexão.');
      }

      console.log('🔄 Tentando criar post no Firebase...', postData);

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

  static async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        isLiked: !isLiked,
        likes: isLiked ? -1 : 1,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Like atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar like:', error);
      throw error;
    }
  }

  static async addComment(postId: string, commentData: any): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: 1,
        updatedAt: serverTimestamp()
      });

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

  static async getTrendingHashtags(): Promise<{tag: string, posts: number}[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const hashtagCount: {[key: string]: number} = {};

      postsSnapshot.forEach((doc) => {
        const post = doc.data();
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach((hashtag: string) => {
            const tag = hashtag.toLowerCase();
            hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
          });
        }
      });

      const trending = Object.entries(hashtagCount)
        .map(([tag, posts]) => ({ tag: `#${tag}`, posts }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      return trending;
    } catch (error) {
      console.error('❌ Erro ao buscar hashtags trending:', error);
      return [];
    }
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'posts', postId);
      
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) {
        throw new Error('Post não encontrado');
      }

      const postData = postDoc.data();
      if (postData.autorId !== userId) {
        throw new Error('Você não tem permissão para deletar este post');
      }

      await deleteDoc(postRef);
      
      console.log('✅ Post deletado com sucesso:', postId);
    } catch (error) {
      console.error('❌ Erro ao deletar post:', error);
      throw error;
    }
  }
}
