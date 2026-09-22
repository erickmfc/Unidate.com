
export interface AIPost {
  id: string;
  content: string;
  author: {
    uid: string;
    name: string;
    handle: string;
    avatar: string;
    course: string;
    university: string;
  };
  timestamp: Date;
  source: string;
  isAIBot: boolean;
}

export class AIBotService {
  private static readonly BOT_PROFILE = {
    uid: 'ai-bot-unidate',
    name: 'UniDate AI',
    handle: '@unidateai',
    avatar: 'https://ui-avatars.com/api/?name=UniDate+AI&background=8b5cf6&color=fff&size=128',
    course: 'Inteligência Artificial',
    university: 'UniDate'
  };

  
  static async generateAIPost(): Promise<string> {
    return this.getFallbackPost();
  }

  
  private static getFallbackPost(): string {
    const fallbackPosts = [
      'estudando com brilhos nos olhos (lágrimas)',
      'se eu gostasse de estudar igual eu gosto de dormir, eu tava era em harvard',
      'vou fechar esse semestre com chave de choro',
      'professora não entendi vc poderia encerrar o semestre por gentileza',
      'não bastava as neuras internas que a gente tinha que ignorar pra estudar decentemente, agora tem só uma pandemia rolando pra facilitar a fixação do conteúdo',
      'meu cérebro: vamos estudar! também meu cérebro: mas e se a gente pensasse em absolutamente tudo menos estudar?',
      'café: 3 reais | sono: gratuito | minha escolha: café (porque preciso passar de ano)',
      'quando você finalmente entende a matéria mas a prova já foi ontem',
      'estudar às 3h da manhã não é produtividade, é desespero',
      'a diferença entre estudar e revisar: estudar é quando você não sabe nada, revisar é quando você esqueceu tudo'
    ];
    return fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
  }

  
  static async createAIPost(): Promise<string> {
    try {
      console.log('🤖 [AIBotService] Iniciando criação de post...');
      
      const content = await this.generateAIPost();
      console.log('🤖 [AIBotService] Conteúdo gerado:', content);
      
      if (!content || content.trim().length === 0) {
        throw new Error('Conteúdo do post está vazio');
      }
      
      const { PostsService } = await import('./postsService');
      
      const postData = {
        author: {
          uid: this.BOT_PROFILE.uid,
          name: this.BOT_PROFILE.name,
          avatar: this.BOT_PROFILE.avatar,
          course: this.BOT_PROFILE.course,
          university: this.BOT_PROFILE.university
        },
        content: content,
        type: 'text' as const,
        likes: 0,
        comments: 0,
        isLiked: false,
        hashtags: this.extractHashtags(content)
      };

      console.log('🤖 [AIBotService] Dados do post preparados:', postData);
      
      const postId = await PostsService.createPost(postData);
      
      if (!postId || postId.trim().length === 0) {
        throw new Error('Post não foi criado: postId vazio ou inválido');
      }
      
      console.log('✅ [AIBotService] Post criado com sucesso:', postId);
      
      return postId;
    } catch (error: any) {
      console.error('❌ [AIBotService] Erro ao criar post:', error);
      throw new Error(`Erro ao criar post: ${error.message || 'Erro desconhecido'}`);
    }
  }

  
  private static extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  
  static getBotProfile() {
    return this.BOT_PROFILE;
  }
}
