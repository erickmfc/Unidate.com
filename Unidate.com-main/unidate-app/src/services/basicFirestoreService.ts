import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

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

      // Validação de dados
      if (!postData.autorId) {
        throw new Error('ID do autor é obrigatório');
      }
      if (!postData.conteudo || !postData.conteudo.trim()) {
        throw new Error('Conteúdo do post não pode estar vazio');
      }
      if (!postData.titulo || !postData.titulo.trim()) {
        throw new Error('Título do post não pode estar vazio');
      }

      if (!db) {
        console.error('❌ [FIRESTORE] Firestore não está disponível');
        throw new Error('Firestore não está disponível');
      }

      // Verificar autenticação
      const { auth } = await import('../firebase/config');
      if (!auth?.currentUser) {
        throw new Error('Usuário não autenticado');
      }
      if (auth.currentUser.uid !== postData.autorId) {
        console.warn('⚠️ [FIRESTORE] UID do usuário autenticado não corresponde ao autorId');
        console.warn('⚠️ [FIRESTORE] auth.currentUser.uid:', auth.currentUser.uid);
        console.warn('⚠️ [FIRESTORE] postData.autorId:', postData.autorId);
      }

      console.log('🔄 [FIRESTORE] Firestore disponível, criando coleção...');
      const postsCollection = collection(db, 'posts');
      console.log('🔄 [FIRESTORE] Coleção criada:', postsCollection);
      
      const novoPostData = {
        titulo: postData.titulo.trim(),
        conteudo: postData.conteudo.trim(),
        autorId: postData.autorId,
        autorNome: postData.autorNome || 'Usuário',
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
      console.log('🔄 [FIRESTORE] Usuário autenticado:', auth.currentUser.uid);

      const docRef = await addDoc(postsCollection, novoPostData);
      
      console.log('✅ [FIRESTORE] Post adicionado com sucesso!');
      console.log('✅ [FIRESTORE] ID do documento:', docRef.id);
      console.log('✅ [FIRESTORE] Caminho do documento:', docRef.path);
      
      return docRef.id;
    } catch (error: any) {
      console.error('❌ [FIRESTORE] Erro ao adicionar post:', error);
      console.error('❌ [FIRESTORE] Código do erro:', error.code);
      console.error('❌ [FIRESTORE] Mensagem:', error.message);
      console.error('❌ [FIRESTORE] Stack:', error.stack);
      
      // Melhorar mensagem de erro baseada no código
      if (error.code === 'permission-denied') {
        throw new Error('Permissão negada. Verifique se você está logado e se as regras do Firestore estão configuradas corretamente.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore temporariamente indisponível. Verifique sua conexão e tente novamente.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Você precisa estar logado para criar posts.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error(`Erro ao salvar post: ${error.code || 'Erro desconhecido'}`);
      }
    }
  }

  carregarPosts(
    onPostsUpdate: (posts: BasicPost[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      console.log('🔄 [FIRESTORE] Configurando listener de posts em tempo real...');
      console.log('🔄 [FIRESTORE] DB disponível?', !!db);

      if (!db) {
        console.error('❌ [FIRESTORE] Firestore não está disponível');
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 [FIRESTORE] Firestore disponível, criando query...');
      const postsCollection = collection(db, 'posts');
      console.log('🔄 [FIRESTORE] Coleção criada:', postsCollection);
      
      const q = query(postsCollection);
      console.log('🔄 [FIRESTORE] Query criada:', q);

      console.log('🔄 [FIRESTORE] Configurando listener onSnapshot...');
      
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          console.log('📱 [FIRESTORE] ===== SNAPSHOT RECEBIDO =====');
          console.log('📱 [FIRESTORE] Tamanho do snapshot:', snapshot.size);
          console.log('📱 [FIRESTORE] Snapshot vazio?', snapshot.empty);
          console.log('📱 [FIRESTORE] From cache?', snapshot.metadata.fromCache);
          console.log('📱 [FIRESTORE] Has pending writes?', snapshot.metadata.hasPendingWrites);

          const posts: BasicPost[] = [];

          if (snapshot.empty) {
            console.log('⚠️ [FIRESTORE] Snapshot está vazio - nenhum post encontrado');
            onPostsUpdate([]);
            return;
          }

          snapshot.forEach((doc) => {
            const postData = doc.data();
            console.log('🔄 [FIRESTORE] Processando documento:', doc.id);

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
            console.log('✅ [FIRESTORE] Post processado:', post.id);
          });

          posts.sort((a, b) => {
            try {
              const aTime = a.dataCriacao?.toDate ? a.dataCriacao.toDate().getTime() : (a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0);
              const bTime = b.dataCriacao?.toDate ? b.dataCriacao.toDate().getTime() : (b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0);
              return bTime - aTime; // Ordem decrescente (mais recente primeiro)
            } catch {
              return 0;
            }
          });

          console.log(`📱 [FIRESTORE] ===== LINHA DO CAMPUS ATUALIZADA =====`);
          console.log(`📱 [FIRESTORE] Total de posts: ${posts.length}`);
          onPostsUpdate(posts);
        },
        (error: any) => {
          console.error('❌ [FIRESTORE] ===== ERRO NO LISTENER =====');
          console.error('❌ [FIRESTORE] Erro:', error);
          console.error('❌ [FIRESTORE] Código do erro:', error.code);
          console.error('❌ [FIRESTORE] Mensagem:', error.message);
          if (onError) {
            onError(error);
          }
        }
      );
      
      console.log('✅ [FIRESTORE] onSnapshot configurado com sucesso');
      
      return () => {
        console.log('🔄 [FIRESTORE] Parando listener...');
        unsubscribe();
      };
    } catch (error: any) {
      console.error('❌ [FIRESTORE] ===== ERRO AO CONFIGURAR LISTENER =====');
      console.error('❌ [FIRESTORE] Erro:', error);
      console.error('❌ [FIRESTORE] Mensagem:', error.message);
      if (onError) {
        onError(error);
      }
      return () => {};
    }
  }

  async apoiarPost(postId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log(`🔄 Curtindo post ${postId} para usuário ${userId}`);

      const postRef = doc(db, 'posts', postId);
      
      await updateDoc(postRef, {
        curtidasPor: arrayUnion(userId)
      });

      console.log('✅ Post apoiado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao apoiar post:', error);
      throw error;
    }
  }

  async desapoiarPost(postId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }

      console.log(`🔄 Descurtindo post ${postId} para usuário ${userId}`);

      const postRef = doc(db, 'posts', postId);
      
      await updateDoc(postRef, {
        curtidasPor: arrayRemove(userId)
      });

      console.log('✅ Post desapoiado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao desapoiar post:', error);
      throw error;
    }
  }

  async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
      await this.desapoiarPost(postId, userId);
    } else {
      await this.apoiarPost(postId, userId);
    }
  }

  private extrairHashtags(texto: string): string[] {
    const hashtagRegex = /#\w+/g;
    const matches = texto.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }
}

export const basicFirestoreService = new BasicFirestoreService();
export default basicFirestoreService;
