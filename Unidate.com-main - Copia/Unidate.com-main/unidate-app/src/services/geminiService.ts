const GEMINI_API_KEY = 'AIzaSyB55CBvbYRBq9YN1PgbHaJNbZpRVZBLEzU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface PhilosophicalThought {
  id: string;
  content: string;
  theme: string;
  author?: string;
  timestamp: Date;
  category: 'stoic' | 'existential' | 'wisdom' | 'reflection' | 'motivation';
  hash: string; // Para verificação de duplicatas
}

interface DailyThoughts {
  date: string; // YYYY-MM-DD
  thoughts: string[]; // Array de hashes das frases do dia
}

export class GeminiService {
  private static readonly STORAGE_KEY = 'philosophical_thoughts_daily';
  private static readonly MAX_ATTEMPTS = 10; // Máximo de tentativas para evitar duplicata

  /**
   * Gera um pensamento filosófico único (não repetido no dia)
   */
  static async generateUniquePhilosophicalThought(
    theme?: string,
    context?: string
  ): Promise<PhilosophicalThought> {
    const today = this.getTodayString();
    const dailyThoughts = this.getDailyThoughts();
    
    // Se não é o mesmo dia, limpar histórico
    if (dailyThoughts.date !== today) {
      this.clearDailyThoughts();
      dailyThoughts.date = today;
      dailyThoughts.thoughts = [];
    }

    let attempts = 0;
    let thought: PhilosophicalThought | null = null;

    // Tentar gerar até conseguir uma frase única
    while (attempts < this.MAX_ATTEMPTS && !thought) {
      const generatedThought = await this.generatePhilosophicalThought(theme, context);
      const thoughtHash = this.hashContent(generatedThought.content);

      // Verificar se já foi gerada hoje
      if (!dailyThoughts.thoughts.includes(thoughtHash)) {
        // Adicionar ao histórico do dia
        dailyThoughts.thoughts.push(thoughtHash);
        this.saveDailyThoughts(dailyThoughts);
        
        thought = {
          ...generatedThought,
          hash: thoughtHash
        };
        break;
      }

      attempts++;
      
      // Pequeno delay entre tentativas
      if (attempts < this.MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Se não conseguiu gerar uma única após várias tentativas, usar fallback
    if (!thought) {
      const fallbackThought = this.getUniqueFallbackThought(dailyThoughts.thoughts);
      const thoughtHash = this.hashContent(fallbackThought.content);
      dailyThoughts.thoughts.push(thoughtHash);
      this.saveDailyThoughts(dailyThoughts);
      
      thought = {
        ...fallbackThought,
        hash: thoughtHash
      };
    }

    return thought;
  }

  /**
   * Gera um pensamento filosófico (sem verificação de duplicata)
   */
  private static async generatePhilosophicalThought(
    theme?: string,
    context?: string
  ): Promise<Omit<PhilosophicalThought, 'hash'>> {
    try {
      const prompt = this.buildPhilosophicalPrompt(theme, context);
      
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 200,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na API Gemini:', errorData);
        throw new Error('Erro ao gerar pensamento filosófico');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        this.getDefaultThought().content;

      return {
        id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: this.cleanGeneratedText(generatedText),
        theme: theme || 'reflexão',
        timestamp: new Date(),
        category: this.categorizeThought(generatedText)
      };
    } catch (error) {
      console.error('Erro ao gerar pensamento filosófico:', error);
      return this.getDefaultThought();
    }
  }

  /**
   * Gera hash MD5 simples do conteúdo para verificação de duplicatas
   */
  private static hashContent(content: string): string {
    // Hash simples baseado no conteúdo normalizado
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Usar um hash simples (em produção, usar crypto.subtle)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Obtém pensamentos do dia atual
   */
  private static getDailyThoughts(): DailyThoughts {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Verificar se é do dia atual
        if (parsed.date === this.getTodayString()) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Erro ao ler pensamentos do dia:', error);
    }

    return {
      date: this.getTodayString(),
      thoughts: []
    };
  }

  /**
   * Salva pensamentos do dia
   */
  private static saveDailyThoughts(dailyThoughts: DailyThoughts): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dailyThoughts));
    } catch (error) {
      console.error('Erro ao salvar pensamentos do dia:', error);
    }
  }

  /**
   * Limpa pensamentos do dia
   */
  private static clearDailyThoughts(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar pensamentos do dia:', error);
    }
  }

  /**
   * Retorna string do dia atual (YYYY-MM-DD)
   */
  private static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Gera um pensamento fallback único
   */
  private static getUniqueFallbackThought(existingHashes: string[]): Omit<PhilosophicalThought, 'hash'> {
    const fallbackThoughts = [
      'O conhecimento é a única riqueza que cresce quando compartilhada.',
      'A sabedoria não vem da quantidade de informações, mas da profundidade da compreensão.',
      'Cada erro é uma oportunidade disfarçada de aprendizado.',
      'A excelência não é um ato, mas um hábito cultivado diariamente.',
      'O verdadeiro aprendizado acontece quando questionamos o que já sabemos.',
      'A persistência transforma obstáculos em degraus para o sucesso.',
      'A mente que se abre a uma nova ideia jamais retorna ao seu tamanho original.',
      'O conhecimento sem sabedoria é como uma árvore sem raízes.',
      'Aprender é a única coisa que a mente nunca se cansa, nunca teme e nunca se arrepende.',
      'A educação é a arma mais poderosa que você pode usar para mudar o mundo.',
      'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
      'A curiosidade é o motor do aprendizado contínuo.',
      'Quem para de aprender, para de viver.',
      'O conhecimento é poder, mas a sabedoria é liberdade.',
      'Aprender é descobrir que algo é possível.',
      'A mente é como um paraquedas: só funciona quando está aberta.',
      'O aprendizado é uma jornada, não um destino.',
      'Investir em conhecimento sempre paga os melhores juros.',
      'A única pessoa que você está destinado a se tornar é a pessoa que você decide ser.',
      'O futuro pertence àqueles que aprendem mais habilidades e as combinam de formas criativas.',
      'Aprender nunca esgota a mente.',
      'A educação não é preparação para a vida; a educação é a própria vida.',
      'O conhecimento é como um jardim: se não for cultivado, não pode ser colhido.',
      'A sabedoria começa na admiração.',
      'Quem não quer pensar é um fanático; quem não pode pensar é um idiota; quem não ousa pensar é um covarde.',
      'Aprender sem pensar é tempo perdido; pensar sem aprender é perigoso.',
      'O conhecimento verdadeiro é saber que você não sabe nada.',
      'A educação é aprender o que você nem sabia que não sabia.',
      'O aprendizado contínuo é o mínimo requisito para o sucesso em qualquer campo.',
      'A mente que se estende a uma nova ideia jamais retorna às suas dimensões originais.'
    ];

    // Filtrar pensamentos já usados hoje
    const availableThoughts = fallbackThoughts.filter(thought => {
      const hash = this.hashContent(thought);
      return !existingHashes.includes(hash);
    });

    // Se todos foram usados, usar um aleatório mesmo assim
    const selectedThought = availableThoughts.length > 0
      ? availableThoughts[Math.floor(Math.random() * availableThoughts.length)]
      : fallbackThoughts[Math.floor(Math.random() * fallbackThoughts.length)];

    return {
      id: `thought-fallback-${Date.now()}`,
      content: selectedThought,
      theme: 'sabedoria',
      timestamp: new Date(),
      category: 'wisdom'
    };
  }

  private static buildPhilosophicalPrompt(theme?: string, context?: string): string {
    const themes = [
      'aprendizado e conhecimento',
      'persistência e esforço',
      'sabedoria e reflexão',
      'crescimento pessoal',
      'excelência acadêmica',
      'curiosidade intelectual',
      'resiliência e superação',
      'busca pela verdade',
      'desenvolvimento contínuo',
      'transformação através do conhecimento'
    ];

    const selectedTheme = theme || themes[Math.floor(Math.random() * themes.length)];
    
    const basePrompt = `Você é um filósofo estoico moderno inspirado em Sêneca, Marco Aurélio e Epicteto. 

Gere UM ÚNICO pensamento filosófico profundo e original sobre "${selectedTheme}".

REGRAS OBRIGATÓRIAS:
- Apenas UMA frase ou no máximo DUAS frases curtas
- Seja profundo, mas conciso
- Use linguagem poética e inspiradora
- Tome inspiração no estoicismo, mas seja original
- Escreva em português brasileiro
- Não use aspas ou formatação
- O pensamento deve ser único e não genérico

${context ? `Contexto adicional: ${context}` : ''}

Gere APENAS o pensamento, sem explicações, sem título, sem formatação.`;

    return basePrompt;
  }

  private static cleanGeneratedText(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/```/g, '')
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/^["']|["']$/g, '')
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ')
      .substring(0, 300); // Limitar tamanho
  }

  private static categorizeThought(text: string): PhilosophicalThought['category'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('estoic') || lowerText.includes('virtude') || lowerText.includes('sabedoria') || lowerText.includes('sêneca') || lowerText.includes('marco aurélio')) {
      return 'stoic';
    }
    
    if (lowerText.includes('existência') || lowerText.includes('sentido') || lowerText.includes('propósito') || lowerText.includes('ser')) {
      return 'existential';
    }
    
    if (lowerText.includes('motivação') || lowerText.includes('persistência') || lowerText.includes('esforço') || lowerText.includes('superação')) {
      return 'motivation';
    }
    
    if (lowerText.includes('sabedoria') || lowerText.includes('conhecimento') || lowerText.includes('aprender') || lowerText.includes('educação')) {
      return 'wisdom';
    }
    
    return 'reflection';
  }

  private static getDefaultThought(): Omit<PhilosophicalThought, 'hash'> {
    const defaultThoughts = [
      {
        content: 'O conhecimento não é um destino, mas uma jornada contínua de descoberta e crescimento.',
        category: 'wisdom' as const
      },
      {
        content: 'A sabedoria verdadeira está em reconhecer que sempre há mais a aprender.',
        category: 'reflection' as const
      },
      {
        content: 'Cada lição aprendida é um passo em direção à excelência pessoal.',
        category: 'motivation' as const
      }
    ];

    const randomThought = defaultThoughts[Math.floor(Math.random() * defaultThoughts.length)];
    
    return {
      id: `thought-default-${Date.now()}`,
      content: randomThought.content,
      theme: 'sabedoria',
      timestamp: new Date(),
      category: randomThought.category
    };
  }

  /**
   * Obtém estatísticas do dia
   */
  static getDailyStats(): { count: number; date: string } {
    const dailyThoughts = this.getDailyThoughts();
    return {
      count: dailyThoughts.thoughts.length,
      date: dailyThoughts.date
    };
  }

  /**
   * Gera conteúdo detalhado sobre um tema
   */
  static async generateDetailedContent(
    theme: string,
    type: 'lesson' | 'philosophy' | 'research' | 'doubt' | 'module'
  ): Promise<string> {
    try {
      const prompt = `Crie um conteúdo detalhado sobre "${theme}" do tipo ${type}.

      O conteúdo deve:
      - Ser profundo e educativo
      - Ter 3-4 parágrafos
      - Ser em português brasileiro
      - Ser inspirador e útil para estudantes
      - Incluir exemplos práticos quando relevante`;

      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 500,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar conteúdo detalhado');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        `Conteúdo sobre ${theme} em desenvolvimento...`;
    } catch (error) {
      console.error('Erro ao gerar conteúdo detalhado:', error);
      return `Uma exploração profunda sobre ${theme}. Este tema oferece oportunidades únicas de aprendizado e reflexão, conectando conceitos fundamentais com aplicações práticas no mundo real.`;
    }
  }
}
