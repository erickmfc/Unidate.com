import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Interface básica para posts
export interface BasicPost {
  id: string;
  titulo: string;
  conteudo: string;
  autorId: string;
  autorNome: string;
  autorAvatar?: string;
  autorCurso?: string;
  autorUniversidade?: string;
  dataCriacao: any;
  curtidasPor: string[];
  numeroComentarios: number;
  hashtags: string[];
  tipo: 'texto' | 'imagem' | 'poll' | 'tev';
}

class BasicFirestoreService {
  // 1. ADICIONAR NOVO POST
  async adicionarPost(postData: {
    titulo: string;
    conteudo: string;
    autorId: string;
    autorNome: string;
    autorAvatar?: string;
    autorCurso?: string;
    autorUniversidade?: string;
    tipo?: 'texto' | 'imagem' | 'poll' | 'tev';
  }): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 Adicionando novo post ao Firestore...', postData);

      const postsCollection = collection(db, 'posts');
      
      const novoPostData = {
        titulo: postData.titulo,
        conteudo: postData.conteudo,
        autorId: postData.autorId,
        autorNome: postData.autorNome,
        autorAvatar: postData.autorAvatar || '/api/placeholder/40/40',
        autorCurso: postData.autorCurso || 'Curso não informado',
        autorUniversidade: postData.autorUniversidade || 'Universidade não informada',
        dataCriacao: serverTimestamp(),
        curtidasPor: [],
        numeroComentarios: 0,
        hashtags: this.extrairHashtags(postData.conteudo),
        tipo: postData.tipo || 'texto'
      };

      const docRef = await addDoc(postsCollection, novoPostData);
      
      console.log('✅ Post adicionado com sucesso! ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar post:', error);
      throw error;
    }
  }

  // 2. CARREGAR POSTS EM TEMPO REAL
  carregarPosts(
    onPostsUpdate: (posts: BasicPost[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 Configurando listener de posts em tempo real...');

      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection,
        orderBy('dataCriacao', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const posts: BasicPost[] = [];
          
          snapshot.forEach((doc) => {
            const postData = doc.data();
            posts.push({
              id: doc.id,
              titulo: postData.titulo || '',
              conteudo: postData.conteudo || '',
              autorId: postData.autorId || '',
              autorNome: postData.autorNome || 'Usuário',
              autorAvatar: postData.autorAvatar,
              autorCurso: postData.autorCurso,
              autorUniversidade: postData.autorUniversidade,
              dataCriacao: postData.dataCriacao,
              curtidasPor: postData.curtidasPor || [],
              numeroComentarios: postData.numeroComentarios || 0,
              hashtags: postData.hashtags || [],
              tipo: postData.tipo || 'texto'
            });
          });

          console.log(`📱 Timeline atualizada! ${posts.length} posts carregados`);
          onPostsUpdate(posts);
        },
        (error) => {
          console.error('❌ Erro ao carregar posts:', error);
          if (onError) {
            onError(error);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erro ao configurar listener de posts:', error);
      throw error;
    }
  }

  // 3. FUNCIONALIDADE DE LIKES
  async curtirPost(postId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log(`🔄 Curtindo post ${postId} para usuário ${userId}`);

      const postRef = doc(db, 'posts', postId);
      
      await updateDoc(postRef, {
        curtidasPor: arrayUnion(userId)
      });

      console.log('✅ Post curtido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao curtir post:', error);
      throw error;
    }
  }

  async descurtirPost(postId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log(`🔄 Descurtindo post ${postId} para usuário ${userId}`);

      const postRef = doc(db, 'posts', postId);
      
      await updateDoc(postRef, {
        curtidasPor: arrayRemove(userId)
      });

      console.log('✅ Post descurtido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao descurtir post:', error);
      throw error;
    }
  }

  async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
      await this.descurtirPost(postId, userId);
    } else {
      await this.curtirPost(postId, userId);
    }
  }

  // 4. FUNCIONALIDADES AUXILIARES
  private extrairHashtags(texto: string): string[] {
    const hashtagRegex = /#\w+/g;
    const matches = texto.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }
}

// Exportar instância singleton
export const basicFirestoreService = new BasicFirestoreService();
export default basicFirestoreService;
