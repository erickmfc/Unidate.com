import { supabase } from '../supabaseClient';

export type HumorFormat = 'frase' | 'expectativa_realidade' | 'dialogo' | 'situacao_resposta' | 'narrador' | 'grupo' | 'horario';
export type HumorTopic = 'prova' | 'trabalho' | 'professor' | 'grupo' | 'tcc' | 'estagio' | 'nota' | 'sono' | 'cafe' | 'portal' | 'transporte' | 'biblioteca' | 'aula' | 'matematica' | 'programacao';

export interface HumorCandidate { text: string; topic: HumorTopic; format: HumorFormat; keywords: string[]; score: number; }

const TOPICS: HumorTopic[] = ['prova', 'trabalho', 'professor', 'grupo', 'tcc', 'estagio', 'nota', 'sono', 'cafe', 'portal', 'transporte', 'biblioteca', 'aula', 'matematica', 'programacao'];
const TEMPLATES: Array<{ format: HumorFormat; topic: HumorTopic; lines: string[] }> = [
  { format: 'expectativa_realidade', topic: 'prova', lines: ['entrei na faculdade pra construir meu futuro\natualmente estou tentando recuperar 0,3', 'vou estudar cedo hoje\n23:48: abrindo o material pela primeira vez'] },
  { format: 'dialogo', topic: 'professor', lines: ['professor: alguma dúvida?\neu: várias mas nenhuma relacionada à matéria', 'professor: é só uma questão simples\neu: então estamos falando de matérias diferentes'] },
  { format: 'grupo', topic: 'grupo', lines: ['grupo criado há 17 dias\nmensagem 1: galera vamos organizar\nmensagem 2: é pra amanhã?', 'trabalho em grupo\num faz\ndois somem\num pergunta se já entregou'] },
  { format: 'narrador', topic: 'portal', lines: ['ele abriu o portal do aluno\na partir daqui ninguém sabe o que aconteceu', 'entrei só pra ver uma nota\nagora estou matriculado em quatro matérias novas'] },
  { format: 'frase', topic: 'sono', lines: ['meu desempenho acadêmico está ótimo\nsó falta a parte do desempenho', 'vamos galera neurônios', 'faculdade é o lugar onde o café vira planejamento estratégico'] },
  { format: 'situacao_resposta', topic: 'nota', lines: ['fiquei com 5,9\nevento canônico', 'professor cancelou\ndeus trabalha', 'qual foi a matéria mais difícil?\nsim'] },
  { format: 'horario', topic: 'aula', lines: ['18:40\nvou chegar cedo hoje\n19:17\neu entrando discretamente'] },
  { format: 'frase', topic: 'trabalho', lines: ['o trabalho vale 2 pontos\nminha ansiedade vale 40', 'a matéria passou por mim\neu também passei por ela sem entender'] },
  { format: 'frase', topic: 'cafe', lines: ['café: caro\nsono: grátis\nminha escolha: café', 'não estou atrasado\nestou chegando no horário alternativo'] },
  { format: 'frase', topic: 'programacao', lines: ['meu código funciona\nnão sei por quê\nvou fingir que foi planejado', 'debugando desde ontem\no bug já faz parte da família'] },
];

const blockedPatterns = [/suicid/i, /matar/i, /ameaç/i, /racis/i, /homofob/i, /estupro/i, /menor de idade/i, /cpf|telefone|email/i];
const words = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\W+/).filter(Boolean);
const similarity = (a: string, b: string) => { const aa = new Set(words(a)); const bb = new Set(words(b)); const intersection = Array.from(aa).filter(word => bb.has(word)).length; return intersection / Math.max(1, new Set([...Array.from(aa), ...Array.from(bb)]).size); };

export class HumorGeneratorService {
  static async getMemory(limit = 50): Promise<Array<{ text: string; topic: string; format: string }>> {
    const { data, error } = await supabase.from('bot_posts_memory').select('text, topic, format').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  static async generatePost(): Promise<HumorCandidate> {
    let memory: Array<{ text: string; topic: string; format: string }> = [];
    try { memory = await this.getMemory(); } catch { /* preview still works if the memory table is not reachable */ }
    const recentTopics = new Set(memory.slice(0, 12).map(item => item.topic));
    const recentTexts = memory.map(item => item.text);
    const now = new Date();
    const dayContext = now.getDay() === 1 ? 'segunda-feira' : now.getDay() === 5 ? 'sexta-feira' : '';
    const candidates: HumorCandidate[] = Array.from({ length: 10 }, (_, index) => {
      const template = TEMPLATES[(index + now.getDate() + now.getHours()) % TEMPLATES.length];
      let text = template.lines[(index + now.getMinutes()) % template.lines.length];
      if (dayContext && index === 0) text = `${dayContext}:\n${text}`;
      const repeatedTopicPenalty = recentTopics.has(template.topic) ? 18 : 0;
      const repeatedTextPenalty = recentTexts.reduce((max, oldText) => Math.max(max, similarity(text, oldText)), 0) * 45;
      const naturalLength = text.length <= 180 ? 12 : -Math.min(12, (text.length - 180) / 10);
      const score = 70 + naturalLength - repeatedTopicPenalty - repeatedTextPenalty + (index % 3);
      return { text, topic: template.topic, format: template.format, keywords: words(text).slice(0, 8), score };
    });
    const safe = candidates.filter(candidate => !blockedPatterns.some(pattern => pattern.test(candidate.text)) && candidate.text.trim().length > 0 && candidate.text.length <= 300);
    if (!safe.length) throw new Error('Não foi possível gerar conteúdo seguro');
    return safe.sort((a, b) => b.score - a.score)[0];
  }

  static async generateReply(context: string): Promise<string> {
    const normalized = context.toLowerCase().trim();
    if (!normalized) return 'Pode me contar um pouco mais?';
    // A IA remota só é chamada quando explicitamente habilitada no ambiente.
    // Sem chave, o modo local é imediato e não envia mensagens para terceiros.
    if (process.env.REACT_APP_ENABLE_REMOTE_AI === 'true') {
      try {
        const { data, error } = await supabase.functions.invoke('ai-bot-reply', { body: { message: context, botName: 'UniDate sem contexto', personality: 'acolhedora e bem-humorada' } });
        if (!error && typeof data?.content === 'string' && data.content.trim()) return data.content.trim();
      } catch {
        // A resposta local continua disponível quando a função de IA não está configurada.
      }
    }
    if (normalized.includes('prova') || normalized.includes('estudar')) return 'Entendi. Se puder, separa a matéria em blocos pequenos e combina uma revisão com alguém da turma. Qual disciplina está pegando mais?';
    if (normalized.includes('nota') || normalized.includes('5,9')) return 'Nota apertada dá ansiedade mesmo. Vale conferir o critério da avaliação e conversar com o professor sobre a revisão. Você quer ajuda para organizar esse pedido?';
    if (normalized.includes('evento') || normalized.includes('campus')) return 'Boa! Vou procurar o contexto do campus na conversa. Você já sabe a data ou o local para a gente organizar a informação?';
    if (normalized.includes('cancel')) return 'Poxa, isso atrapalha o planejamento. Confere se a coordenação publicou uma nova data e avisa a turma por aqui.';
    if (normalized.includes('administra')) return 'Posso ajudar a organizar isso. Qual é a situação e qual resultado você precisa alcançar?';
    if (normalized.endsWith('?')) return 'Boa pergunta. Não quero inventar uma resposta: me diga o curso, campus ou data envolvidos para eu responder com contexto.';
    return `Entendi: “${context.slice(0, 120)}”. Quer conversar melhor sobre isso ou transformar em uma publicação para a timeline?`;
  }

  static async generateThread(): Promise<HumorCandidate[]> { const post = await this.generatePost(); return [{ ...post, format: 'frase' }, { ...post, text: `${post.text}\n\ncontinua amanhã`, format: 'frase' }]; }
  static async generateComment(context: string): Promise<string> { return this.generateReply(context); }
  static async generateContextualPost(context: string): Promise<HumorCandidate> { const post = await this.generatePost(); return { ...post, text: `${context.trim()}\n${post.text}`.slice(0, 300) }; }
}
