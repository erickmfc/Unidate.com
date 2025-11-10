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
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GroupPost {
  id: string;
  groupId: string;
  author: {
    uid: string;
    name: string;
    avatar?: string;
    course?: string;
  };
  content: string;
  type: 'text' | 'image' | 'poll';
  image?: string;
  pollData?: {
    question: string;
    options: string[];
    votes: Record<string, number>; // userId -> optionIndex
  };
  likes: string[]; // Array de UIDs
  comments: number;
  hashtags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class GroupPostsService {
  // Criar post no grupo
  static async createPost(
    groupId: string,
    postData: {
      author: GroupPost['author'];
      content: string;
      type: GroupPost['type'];
      image?: string;
      pollData?: GroupPost['pollData'];
    }
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      // Extrair hashtags
      const hashtags = postData.content.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];

      const postRef = await addDoc(collection(db, 'groupPosts'), {
        ...postData,
        groupId,
        likes: [],
        comments: 0,
        hashtags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Post criado no grupo:', postRef.id);
      return postRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar post:', error);
      throw error;
    }
  }

  // Buscar posts do grupo
  static async getGroupPosts(groupId: string, limitCount: number = 20): Promise<GroupPost[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const q = query(
        collection(db, 'groupPosts'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const posts: GroupPost[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as GroupPost);
      });

      return posts;
    } catch (error) {
      console.error('❌ Erro ao buscar posts do grupo:', error);
      return [];
    }
  }

  // Curtir/descurtir post
  static async toggleLike(postId: string, userId: string, isLiking: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'groupPosts', postId);
      
      if (isLiking) {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar curtida:', error);
      throw error;
    }
  }

  // Votar em enquete
  static async votePoll(postId: string, userId: string, optionIndex: number): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'groupPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post não encontrado');
      }

      const postData = postDoc.data() as GroupPost;
      if (!postData.pollData) {
        throw new Error('Este post não é uma enquete');
      }

      // Remover voto anterior se existir
      const currentVotes = postData.pollData.votes || {};
      const newVotes = { ...currentVotes, [userId]: optionIndex };

      await updateDoc(postRef, {
        'pollData.votes': newVotes,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erro ao votar na enquete:', error);
      throw error;
    }
  }

  // Incrementar contador de comentários
  static async incrementComments(postId: string): Promise<void> {
    try {
      if (!db) return;

      const postRef = doc(db, 'groupPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        await updateDoc(postRef, {
          comments: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar comentários:', error);
    }
  }

  // Deletar post
  static async deletePost(postId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const postRef = doc(db, 'groupPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post não encontrado');
      }

      const postData = postDoc.data() as GroupPost;
      if (postData.author.uid !== userId) {
        throw new Error('Você não tem permissão para deletar este post');
      }

      await deleteDoc(postRef);
      console.log('✅ Post deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar post:', error);
      throw error;
    }
  }
}

