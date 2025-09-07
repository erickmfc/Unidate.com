import { db } from '../firebase/config';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export class FirebaseTestService {
  // Testar conexão com Firebase
  static async testConnection(): Promise<boolean> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return false;
      }

      console.log('🔄 Testando conexão com Firebase...');
      
      // Tentar fazer uma operação simples
      const testRef = await addDoc(collection(db, 'test'), {
        message: 'Teste de conexão',
        timestamp: serverTimestamp()
      });

      console.log('✅ Firebase funcionando! Teste ID:', testRef.id);
      return true;
    } catch (error: any) {
      console.error('❌ Erro no teste do Firebase:', error);
      return false;
    }
  }

  // Testar criação de post
  static async testCreatePost(): Promise<boolean> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return false;
      }

      console.log('🔄 Testando criação de post...');
      
      const testPost = {
        author: {
          uid: 'test-user-123',
          name: 'Usuário Teste',
          course: 'Engenharia de Software',
          university: 'UFRJ',
          avatar: '/api/placeholder/40/40'
        },
        content: 'Este é um post de teste para verificar se o Firebase está funcionando!',
        type: 'text',
        likes: 0,
        comments: 0,
        isLiked: false,
        hashtags: ['#teste', '#firebase']
      };

      // Filtrar campos undefined para evitar erro no Firebase
      const cleanTestPost = {
        author: testPost.author,
        authorId: testPost.author.uid,
        content: testPost.content,
        type: testPost.type,
        likes: testPost.likes,
        comments: testPost.comments,
        isLiked: testPost.isLiked,
        hashtags: testPost.hashtags,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const postRef = await addDoc(collection(db, 'posts'), cleanTestPost);

      console.log('✅ Post de teste criado com sucesso! ID:', postRef.id);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao criar post de teste:', error);
      return false;
    }
  }

  // Testar leitura de posts
  static async testReadPosts(): Promise<boolean> {
    try {
      if (!db) {
        console.error('❌ Firebase não inicializado');
        return false;
      }

      console.log('🔄 Testando leitura de posts...');
      
      const querySnapshot = await getDocs(collection(db, 'posts'));
      console.log(`✅ ${querySnapshot.size} posts encontrados no Firebase`);
      
      querySnapshot.forEach((doc) => {
        console.log('📄 Post:', doc.id, doc.data());
      });

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao ler posts:', error);
      return false;
    }
  }
}
