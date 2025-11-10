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
      console.log('🔄 [FIRESTORE] DB disponível?', !!db);
      
      // Verificar se o usuário está autenticado
      import('../firebase/config').then(({ auth }) => {
        console.log('🔐 [FIRESTORE] Usuário autenticado?', !!auth?.currentUser);
        console.log('🔐 [FIRESTORE] UID do usuário:', auth?.currentUser?.uid);
        
        // Teste direto de acesso à coleção
        if (auth?.currentUser && db) {
          console.log('🧪 [FIRESTORE] Testando acesso direto à coleção...');
          import('firebase/firestore').then(({ getDocs, collection }) => {
            getDocs(collection(db!, 'posts'))
              .then((snapshot) => {
                console.log('🧪 [FIRESTORE] Teste direto - Tamanho:', snapshot.size);
                console.log('🧪 [FIRESTORE] Teste direto - Vazio?', snapshot.empty);
                if (!snapshot.empty) {
                  snapshot.forEach((doc) => {
                    console.log('🧪 [FIRESTORE] Documento encontrado:', doc.id, doc.data());
                  });
                }
              })
              .catch((error) => {
                console.error('🧪 [FIRESTORE] Erro no teste direto:', error);
              });
          });
        }
      });

      if (!db) {
        console.error('❌ [FIRESTORE] Firestore não está disponível');
        throw new Error('Firestore não está disponível');
      }

      console.log('🔄 [FIRESTORE] Firestore disponível, criando query...');
      const postsCollection = collection(db, 'posts');
      console.log('🔄 [FIRESTORE] Coleção criada:', postsCollection);
      
      // Tentar query mais simples primeiro
      const q = query(postsCollection);
      console.log('🔄 [FIRESTORE] Query criada:', q);

      console.log('🔄 [FIRESTORE] Configurando listener...');
      
      // Teste: usar getDocs primeiro para verificar se funciona
      console.log('🧪 [FIRESTORE] Testando getDocs antes do onSnapshot...');
      
      let unsubscribe: (() => void) | null = null;
      
      import('firebase/firestore').then(({ getDocs }) => {
        getDocs(q).then((snapshot) => {
          console.log('🧪 [FIRESTORE] getDocs funcionou! Tamanho:', snapshot.size);
          console.log('🧪 [FIRESTORE] getDocs vazio?', snapshot.empty);
          
          // Se getDocs funcionou, configurar onSnapshot
          console.log('🔄 [FIRESTORE] Configurando onSnapshot...');
          unsubscribe = onSnapshot(q,
            (snapshot) => {
              console.log('📱 [FIRESTORE] ===== SNAPSHOT RECEBIDO =====');
              console.log('📱 [FIRESTORE] Tamanho do snapshot:', snapshot.size);
              console.log('📱 [FIRESTORE] Snapshot vazio?', snapshot.empty);
              console.log('📱 [FIRESTORE] Metadata:', snapshot.metadata);
              console.log('📱 [FIRESTORE] From cache?', snapshot.metadata.fromCache);
              console.log('📱 [FIRESTORE] Has pending writes?', snapshot.metadata.hasPendingWrites);

              const posts: BasicPost[] = [];

              if (snapshot.empty) {
                console.log('⚠️ [FIRESTORE] Snapshot está vazio - nenhum post encontrado');
                console.log('⚠️ [FIRESTORE] Verificando se há posts na coleção...');
                onPostsUpdate([]);
                return;
              }

              snapshot.forEach((doc) => {
                const postData = doc.data();
                console.log('🔄 [FIRESTORE] Processando documento:', doc.id);
                console.log('🔄 [FIRESTORE] Dados brutos:', postData);

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

              console.log(`📱 [FIRESTORE] ===== LINHA DO CAMPUS ATUALIZADA =====`);
              console.log(`📱 [FIRESTORE] Total de posts: ${posts.length}`);
              console.log('📱 [FIRESTORE] Posts finais:', posts);
              onPostsUpdate(posts);
            },
            (error: any) => {
              console.error('❌ [FIRESTORE] ===== ERRO NO LISTENER =====');
              console.error('❌ [FIRESTORE] Erro:', error);
              console.error('❌ [FIRESTORE] Código do erro:', error.code);
              console.error('❌ [FIRESTORE] Mensagem:', error.message);
              console.error('❌ [FIRESTORE] Stack:', error.stack);
              if (onError) {
                onError(error);
              }
            }
          );
          
          console.log('✅ [FIRESTORE] onSnapshot configurado com sucesso');
        }).catch((error) => {
          console.error('🧪 [FIRESTORE] Erro no getDocs:', error);
          throw error;
        });
      });

      console.log('✅ [FIRESTORE] Listener configurado com sucesso');
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error: any) {
      console.error('❌ [FIRESTORE] ===== ERRO AO CONFIGURAR LISTENER =====');
      console.error('❌ [FIRESTORE] Erro:', error);
      console.error('❌ [FIRESTORE] Mensagem:', error.message);
      throw error;
    }
  }

  // 3. FUNCIONALIDADE DE LIKES
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
