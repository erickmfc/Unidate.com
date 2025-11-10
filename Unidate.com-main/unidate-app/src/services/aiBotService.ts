import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const GEMINI_API_KEY = 'AIzaSyB64td1KPT4Y-ENAhGzwusiChhpwQ_VY-Q';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Credenciais do admin para autenticação (usar variáveis de ambiente em produção)
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@unidate.com';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

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
  // Perfil fixo do bot
  private static readonly BOT_PROFILE = {
    uid: 'ai-bot-unidate',
    name: 'UniDate AI',
    handle: '@unidateai',
    avatar: 'https://ui-avatars.com/api/?name=UniDate+AI&background=8b5cf6&color=fff&size=128',
    course: 'Inteligência Artificial',
    university: 'UniDate'
  };

  /**
   * Garante que o admin está autenticado no Firebase Auth
   * Necessário para que as regras do Firestore permitam criar posts
   */
  private static async ensureAdminAuthenticated(): Promise<void> {
    try {
      // Verificar se já está autenticado
      if (auth?.currentUser) {
        console.log('✅ [AIBotService] Admin já autenticado:', auth.currentUser.uid);
        return;
      }

      if (!auth) {
        console.warn('⚠️ [AIBotService] Firebase Auth não está disponível');
        return;
      }

      // Autenticar admin no Firebase Auth
      console.log('🔐 [AIBotService] Autenticando admin no Firebase Auth...');
      try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ [AIBotService] Admin autenticado com sucesso');
      } catch (authError: any) {
        // Se falhar, pode ser que o admin não exista no Firebase Auth
        // Tentar criar ou usar outra estratégia
        console.warn('⚠️ [AIBotService] Erro ao autenticar admin:', authError.message);
        // Não lançar erro - tentar criar post mesmo assim (pode funcionar se as regras permitirem)
      }
    } catch (error: any) {
      console.error('❌ [AIBotService] Erro ao verificar autenticação:', error);
      // Não lançar erro - tentar criar post mesmo assim
    }
  }

  /**
   * Gera um post no estilo Twitter sobre vida universitária
   */
  static async generateAIPost(): Promise<string> {
    const prompts = [
      `Crie um tweet curto e relatable sobre vida universitária. O tweet deve:
- Ter no máximo 280 caracteres
- Ser sarcástico, engraçado ou reflexivo
- Falar sobre experiências comuns de estudantes (estudar, provas, trabalhos, sono, café, etc)
- Ser em português brasileiro
- Ter um tom casual e descontraído
- Pode incluir um comentário entre parênteses para adicionar contexto ou humor

Exemplos de estilo:
- "estudando com brilhos nos olhos (lágrimas)"
- "se eu gostasse de estudar igual eu gosto de dormir, eu tava era em harvard"
- "vou fechar esse semestre com chave de choro"
- "Não bastava as neuras internas que a gente tinha que ignorar pra estudar decentemente, agora tem só uma pandemia rolando pra facilitar a fixação do conteúdo."

Responda APENAS com o texto do tweet, sem aspas, sem explicações.`,

      `Crie um tweet universitário no estilo brasileiro. Deve ser:
- Máximo 280 caracteres
- Sobre estudos, provas, trabalhos, vida acadêmica
- Tom sarcástico ou relatable
- Em português brasileiro
- Pode ter comentário entre parênteses

Responda só o texto do tweet.`,

      `Gere um tweet de estudante universitário brasileiro. Máximo 280 caracteres. Tom casual, sarcástico ou reflexivo. Sobre vida acadêmica. Em português. Pode ter parênteses para contexto. Apenas o texto.`
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: randomPrompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 150,
              topP: 0.95,
              topK: 40
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error('❌ [AIBotService] Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro ao gerar post: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('🤖 [AIBotService] Resposta da API Gemini:', data);
      
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Se não houver conteúdo na resposta, tentar outros formatos
      if (!content) {
        content = data.candidates?.[0]?.text || 
                 data.text || 
                 data.content || 
                 '';
      }
      
      // Limpar o texto
      content = content.trim();
      content = content.replace(/^["']|["']$/g, '');
      content = content.replace(/\n/g, ' ');
      
      // Limitar a 280 caracteres
      if (content.length > 280) {
        content = content.substring(0, 277) + '...';
      }

      // Se estiver vazio, usar fallback
      if (!content || content.length < 10) {
        console.log('⚠️ [AIBotService] Conteúdo vazio, usando fallback');
        return this.getFallbackPost();
      }

      console.log('✅ [AIBotService] Conteúdo gerado:', content);
      return content;
    } catch (error) {
      console.error('Erro ao gerar post com AI:', error);
      return this.getFallbackPost();
    }
  }

  /**
   * Posts de fallback caso a API falhe
   */
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

  /**
   * Cria um post do bot no Firebase
   */
  static async createAIPost(): Promise<string> {
    try {
      console.log('🤖 [AIBotService] Iniciando criação de post...');
      
      // AUTENTICAR ADMIN ANTES DE CRIAR POST
      await this.ensureAdminAuthenticated();
      
      const content = await this.generateAIPost();
      console.log('🤖 [AIBotService] Conteúdo gerado:', content);
      
      if (!content || content.trim().length === 0) {
        throw new Error('Conteúdo do post está vazio');
      }
      
      // Usar PostsService para criar o post no formato correto
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
      
      // Validação: verificar se o post foi criado
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

  /**
   * Extrai hashtags do conteúdo (opcional)
   */
  private static extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  /**
   * Retorna o perfil do bot
   */
  static getBotProfile() {
    return this.BOT_PROFILE;
  }
}

