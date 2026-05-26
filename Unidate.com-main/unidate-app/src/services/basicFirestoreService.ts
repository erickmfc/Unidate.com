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

const API_URL = 'http://localhost:3001/api';

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
      console.log('🔄 [SQLite] Adicionando post...');
      
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar post no servidor SQLite');
      }

      const { id } = await response.json();
      window.dispatchEvent(new Event('local-posts-updated'));
      return id;
    } catch (error: any) {
      console.error('❌ [SQLite] Erro ao adicionar post:', error);
      throw error;
    }
  }

  carregarPosts(
    onPostsUpdate: (posts: BasicPost[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      console.log('🔄 [SQLite] Configurando carregamento de posts...');
      
      const fetchPosts = async () => {
        try {
          const response = await fetch(`${API_URL}/posts`);
          if (!response.ok) {
            throw new Error('Erro ao buscar posts do SQLite');
          }
          const posts = await response.json();
          onPostsUpdate(posts);
        } catch (err: any) {
          console.error(err);
          if (onError) onError(err);
        }
      };

      fetchPosts();

      window.addEventListener('local-posts-updated', fetchPosts);
      
      const interval = setInterval(fetchPosts, 3000);

      return () => {
        window.removeEventListener('local-posts-updated', fetchPosts);
        clearInterval(interval);
      };
    } catch (error: any) {
      console.error('❌ Erro no listener SQLite:', error);
      if (onError) {
        onError(error);
      }
      return () => {};
    }
  }

  async apoiarPost(postId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) {
        throw new Error('Erro ao curtir post no SQLite');
      }
      window.dispatchEvent(new Event('local-posts-updated'));
    } catch (error) {
      console.error('❌ Erro ao curtir post:', error);
      throw error;
    }
  }

  async desapoiarPost(postId: string, userId: string): Promise<void> {
    await this.apoiarPost(postId, userId);
  }

  async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    await this.apoiarPost(postId, userId);
  }

  private extrairHashtags(texto: string): string[] {
    const hashtagRegex = /#\w+/g;
    const matches = texto.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }
}

export const basicFirestoreService = new BasicFirestoreService();
export default basicFirestoreService;
