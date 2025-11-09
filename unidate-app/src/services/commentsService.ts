import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  orderBy,
  limit,
  where,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: any;
  likes: number;
  likedBy: string[];
  edited?: boolean;
  editedAt?: any;
}

export class CommentsService {
  // Adicionar comentário
  static async addComment(
    postId: string, 
    userId: string, 
    userName: string, 
    userAvatar: string, 
    content: string
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 [COMMENTS] Adicionando comentário...', { postId, userId, userName, content });

      const commentData = {
        postId,
        userId,
        userName,
        userAvatar: userAvatar || '/api/placeholder/40/40',
        content: content.trim(),
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        edited: false
      };

      const commentRef = await addDoc(collection(db, 'comments'), commentData);
      
      // Atualizar contador de comentários no post
      await this.updatePostCommentCount(postId, 1);

      console.log('✅ [COMMENTS] Comentário adicionado com sucesso!', commentRef.id);
      return commentRef.id;
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  // Carregar comentários de um post em tempo real
  static loadPostComments(
    postId: string, 
    onCommentsUpdate: (comments: Comment[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 50
  ): () => void {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 [COMMENTS] Carregando comentários do post:', postId);

      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          console.log('📱 [COMMENTS] Snapshot recebido:', snapshot.size, 'comentários');
          
          const comments: Comment[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            comments.push({
              id: doc.id,
              postId: data.postId,
              userId: data.userId,
              userName: data.userName,
              userAvatar: data.userAvatar,
              content: data.content,
              timestamp: data.timestamp,
              likes: data.likes || 0,
              likedBy: data.likedBy || [],
              edited: data.edited || false,
              editedAt: data.editedAt
            });
          });

          console.log('✅ [COMMENTS] Comentários carregados:', comments.length);
          onCommentsUpdate(comments);
        },
        (error) => {
          console.error('❌ [COMMENTS] Erro ao carregar comentários:', error);
          if (onError) {
            onError(error);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao configurar listener de comentários:', error);
      throw error;
    }
  }

  // Curtir/descurtir comentário
  static async toggleCommentLike(commentId: string, userId: string, isLiked: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      const commentRef = doc(db, 'comments', commentId);
      
      if (isLiked) {
        // Descurtir
        await updateDoc(commentRef, {
          likedBy: arrayRemove(userId)
        });
      } else {
        // Curtir
        await updateDoc(commentRef, {
          likedBy: arrayUnion(userId)
        });
      }

      console.log('✅ [COMMENTS] Like do comentário atualizado');
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao curtir comentário:', error);
      throw error;
    }
  }

  // Editar comentário
  static async editComment(commentId: string, userId: string, newContent: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      const commentRef = doc(db, 'comments', commentId);
      
      await updateDoc(commentRef, {
        content: newContent.trim(),
        edited: true,
        editedAt: serverTimestamp()
      });

      console.log('✅ [COMMENTS] Comentário editado com sucesso');
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao editar comentário:', error);
      throw error;
    }
  }

  // Deletar comentário
  static async deleteComment(commentId: string, postId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      // Deletar comentário
      await deleteDoc(doc(db, 'comments', commentId));
      
      // Atualizar contador de comentários no post
      await this.updatePostCommentCount(postId, -1);

      console.log('✅ [COMMENTS] Comentário deletado com sucesso');
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao deletar comentário:', error);
      throw error;
    }
  }

  // Atualizar contador de comentários no post
  private static async updatePostCommentCount(postId: string, increment: number): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      const postRef = doc(db, 'posts', postId);
      
      // Primeiro, vamos ler o valor atual
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const currentCount = postData?.numeroComentarios || postData?.comments || 0;
        const newCount = Math.max(0, currentCount + increment);
        
        await updateDoc(postRef, {
          numeroComentarios: newCount,
          comments: newCount, // Manter compatibilidade com ambos os campos
          updatedAt: serverTimestamp()
        });

        console.log('✅ [COMMENTS] Contador de comentários atualizado:', newCount);
      } else {
        console.warn('⚠️ [COMMENTS] Post não encontrado para atualizar contador:', postId);
      }
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao atualizar contador de comentários:', error);
      // Não re-throw o erro para não quebrar a funcionalidade principal
      console.warn('⚠️ [COMMENTS] Continuando sem atualizar contador...');
    }
  }
}
