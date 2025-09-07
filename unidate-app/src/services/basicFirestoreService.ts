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
      console.log('🔄 [FIRESTORE] Iniciando adição de post...');
      console.log('🔄 [FIRESTORE] Dados recebidos:', postData);

      if (!db) {
        console.error('❌ [FIRESTORE] Firestore não está disponível');
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 [FIRESTORE] Firestore disponível, criando coleção...');
      const postsCollection = collection(db, 'posts');
      console.log('🔄 [FIRESTORE] Coleção criada:', postsCollection);
      
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

      console.log('🔄 [FIRESTORE] Dados do post preparados:', novoPostData);
      console.log('🔄 [FIRESTORE] Enviando para Firestore...');

      const docRef = await addDoc(postsCollection, novoPostData);
      
      console.log('✅ [FIRESTORE] Post adicionado com sucesso!');
      console.log('✅ [FIRESTORE] ID do documento:', docRef.id);
      console.log('✅ [FIRESTORE] Caminho do documento:', docRef.path);
      
      return docRef.id;
    } catch (error: any) {
      console.error('❌ [FIRESTORE] Erro ao adicionar post:', error);
      console.error('❌ [FIRESTORE] Detalhes do erro:', error.message);
      throw error;
    }
  }

  // 2. CARREGAR POSTS EM TEMPO REAL
  carregarPosts(
    onPostsUpdate: (posts: BasicPost[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      console.log('🔄 [FIRESTORE] Configurando listener de posts em tempo real...');

      if (!db) {
        console.error('❌ [FIRESTORE] Firestore não está disponível');
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 [FIRESTORE] Firestore disponível, criando query...');
      const postsCollection = collection(db, 'posts');
      const q = query(
        postsCollection,
        orderBy('dataCriacao', 'desc'),
        limit(50)
      );

      console.log('🔄 [FIRESTORE] Query criada, configurando listener...');
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📱 [FIRESTORE] Snapshot recebido:', snapshot.size, 'documentos');
          const posts: BasicPost[] = [];
          
          snapshot.forEach((doc) => {
            const postData = doc.data();
            console.log('🔄 [FIRESTORE] Processando documento:', doc.id, postData);
            
            const post: BasicPost = {
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
            };
            
            posts.push(post);
            console.log('✅ [FIRESTORE] Post processado:', post);
          });

          console.log(`📱 [FIRESTORE] Timeline atualizada! ${posts.length} posts carregados`);
          console.log('📱 [FIRESTORE] Posts finais:', posts);
          onPostsUpdate(posts);
        },
        (error: any) => {
          console.error('❌ [FIRESTORE] Erro no listener de posts:', error);
          console.error('❌ [FIRESTORE] Detalhes do erro:', error.message);
          if (onError) {
            onError(error);
          }
        }
      );

      console.log('✅ [FIRESTORE] Listener configurado com sucesso');
      return unsubscribe;
    } catch (error: any) {
      console.error('❌ [FIRESTORE] Erro ao configurar listener de posts:', error);
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
