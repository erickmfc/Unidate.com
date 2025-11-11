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
  static async addComment(
    postId: string, 
    userId: string, 
    userName: string, 
    userAvatar: string, 
    content: string
  ): Promise<string> {
    try {
      if (!db) {
        console.error('❌ [COMMENTS] Firestore não está disponível');
        throw new Error('Firestore não está disponível');
      }

      // Verificar autenticação
      const { auth } = await import('../firebase/config');
      if (!auth?.currentUser) {
        console.error('❌ [COMMENTS] Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      if (auth.currentUser.uid !== userId) {
        console.warn('⚠️ [COMMENTS] UID do usuário autenticado não corresponde ao userId');
        console.warn('⚠️ [COMMENTS] auth.currentUser.uid:', auth.currentUser.uid);
        console.warn('⚠️ [COMMENTS] userId:', userId);
      }

      if (!postId || !userId || !userName || !content.trim()) {
        console.error('❌ [COMMENTS] Dados inválidos:', { postId, userId, userName, content: content.substring(0, 50) });
        throw new Error('Dados do comentário inválidos');
      }

      console.log('🔄 [COMMENTS] Adicionando comentário...', { 
        postId, 
        userId, 
        userName, 
        content: content.substring(0, 50),
        authenticatedUser: auth.currentUser.uid
      });

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

      console.log('🔄 [COMMENTS] Dados do comentário preparados:', commentData);
      console.log('🔄 [COMMENTS] Verificando permissões...');
      console.log('🔄 [COMMENTS] request.auth.uid será:', auth.currentUser.uid);
      console.log('🔄 [COMMENTS] request.resource.data.userId será:', userId);
      
      const commentRef = await addDoc(collection(db, 'comments'), commentData);
      
      console.log('✅ [COMMENTS] Comentário salvo no Firestore com ID:', commentRef.id);
      console.log('✅ [COMMENTS] Caminho do documento:', commentRef.path);
      
      // Aguardar um pouco para garantir que o documento foi salvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        await this.updatePostCommentCount(postId, 1);
        console.log('✅ [COMMENTS] Contador de comentários atualizado');
      } catch (countError: any) {
        console.warn('⚠️ [COMMENTS] Erro ao atualizar contador (não crítico):', countError);
        console.warn('⚠️ [COMMENTS] Código do erro:', countError.code);
      }

      console.log('✅ [COMMENTS] Comentário adicionado com sucesso!', commentRef.id);
      return commentRef.id;
    } catch (error: any) {
      console.error('❌ [COMMENTS] Erro ao adicionar comentário:', error);
      console.error('❌ [COMMENTS] Código do erro:', error.code);
      console.error('❌ [COMMENTS] Mensagem:', error.message);
      console.error('❌ [COMMENTS] Stack:', error.stack);
      
      // Melhorar mensagem de erro
      if (error.code === 'permission-denied') {
        throw new Error('Permissão negada. Verifique se você está logado e se as regras do Firestore permitem criar comentários.');
      } else if (error.code === 'unavailable') {
        throw new Error('Serviço temporariamente indisponível. Verifique sua conexão e tente novamente.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Você precisa estar logado para comentar.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error(`Erro ao salvar comentário: ${error.code || 'Erro desconhecido'}`);
      }
    }
  }

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

      let q;
      try {
        q = query(
          collection(db, 'comments'),
          where('postId', '==', postId),
          orderBy('timestamp', 'asc'),
          limit(limitCount)
        );
      } catch (error: any) {
        console.warn('⚠️ [COMMENTS] Índice não encontrado, usando query sem orderBy:', error.message);
        q = query(
          collection(db, 'comments'),
          where('postId', '==', postId),
          limit(limitCount)
        );
      }

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          console.log('📱 [COMMENTS] ===== SNAPSHOT RECEBIDO =====');
          console.log('📱 [COMMENTS] Tamanho do snapshot:', snapshot.size);
          console.log('📱 [COMMENTS] Snapshot vazio?', snapshot.empty);
          console.log('📱 [COMMENTS] From cache?', snapshot.metadata.fromCache);
          console.log('📱 [COMMENTS] Has pending writes?', snapshot.metadata.hasPendingWrites);
          
          const comments: Comment[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('🔄 [COMMENTS] Processando comentário:', doc.id, { 
              postId: data.postId, 
              userId: data.userId, 
              userName: data.userName,
              content: data.content?.substring(0, 30) 
            });
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

          // Ordenar por timestamp, tratando casos onde timestamp pode não estar disponível
          comments.sort((a, b) => {
            try {
              let aTime = 0;
              let bTime = 0;
              
              // Tentar obter timestamp do comentário A
              if (a.timestamp) {
                if (a.timestamp.toDate) {
                  aTime = a.timestamp.toDate().getTime();
                } else if (typeof a.timestamp === 'string') {
                  aTime = new Date(a.timestamp).getTime();
                } else if (a.timestamp instanceof Date) {
                  aTime = a.timestamp.getTime();
                } else if (a.timestamp.seconds) {
                  // Firestore Timestamp com seconds
                  aTime = a.timestamp.seconds * 1000;
                }
              }
              
              // Tentar obter timestamp do comentário B
              if (b.timestamp) {
                if (b.timestamp.toDate) {
                  bTime = b.timestamp.toDate().getTime();
                } else if (typeof b.timestamp === 'string') {
                  bTime = new Date(b.timestamp).getTime();
                } else if (b.timestamp instanceof Date) {
                  bTime = b.timestamp.getTime();
                } else if (b.timestamp.seconds) {
                  // Firestore Timestamp com seconds
                  bTime = b.timestamp.seconds * 1000;
                }
              }
              
              // Se ambos têm timestamp válido, ordenar
              if (aTime > 0 && bTime > 0) {
                return aTime - bTime;
              }
              
              // Se apenas um tem timestamp, colocar o que tem timestamp primeiro
              if (aTime > 0) return -1;
              if (bTime > 0) return 1;
              
              // Se nenhum tem timestamp, manter ordem original
              return 0;
            } catch (err) {
              console.warn('⚠️ [COMMENTS] Erro ao ordenar comentários:', err);
              return 0;
            }
          });

          console.log('✅ [COMMENTS] Comentários processados:', comments.length);
          console.log('✅ [COMMENTS] IDs dos comentários:', comments.map(c => c.id));
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

  static async toggleCommentLike(commentId: string, userId: string, isLiked: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      const commentRef = doc(db, 'comments', commentId);
      
      const commentDoc = await getDoc(commentRef);
      if (!commentDoc.exists()) {
        throw new Error('Comentário não encontrado');
      }
      
      const commentData = commentDoc.data();
      const currentLikedBy = commentData.likedBy || [];
      const currentLikes = commentData.likes || 0;
      
      if (isLiked) {
        await updateDoc(commentRef, {
          likedBy: arrayRemove(userId),
          likes: Math.max(0, currentLikes - 1)
        });
      } else {
        await updateDoc(commentRef, {
          likedBy: arrayUnion(userId),
          likes: currentLikes + 1
        });
      }

      console.log('✅ [COMMENTS] Like do comentário atualizado');
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao curtir comentário:', error);
      throw error;
    }
  }

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

  static async deleteComment(commentId: string, postId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      await deleteDoc(doc(db, 'comments', commentId));
      
      await this.updatePostCommentCount(postId, -1);

      console.log('✅ [COMMENTS] Comentário deletado com sucesso');
    } catch (error) {
      console.error('❌ [COMMENTS] Erro ao deletar comentário:', error);
      throw error;
    }
  }

  private static async updatePostCommentCount(postId: string, increment: number): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      const postRef = doc(db, 'posts', postId);
      
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
      console.warn('⚠️ [COMMENTS] Continuando sem atualizar contador...');
    }
  }
}
