import { supabase } from '../supabaseClient';
import { HumorCandidate, HumorGeneratorService } from './humorGeneratorService';

export interface AIPost { id: string; content: string; author: { uid: string; name: string; handle: string; avatar: string; course: string; university: string }; timestamp: Date; source: string; isAIBot: boolean; }

export class AIBotService {
  private static readonly BOT_PROFILE = { uid: 'ai-bot-unidate', name: 'UniDate sem contexto', handle: '@unidatesemcontexto', avatar: 'https://ui-avatars.com/api/?name=UniDate+sem+contexto&background=8b5cf6&color=fff&size=128', course: 'vida universitária', university: 'UniDate', bio: 'um universitário cansado observando o caos acadêmico' };
  static async generateAIPost(): Promise<string> { return (await this.generateCandidate()).text; }
  static async generateCandidate(): Promise<HumorCandidate> { return HumorGeneratorService.generatePost(); }
  static async createAIPost(): Promise<string> { return this.publishCandidate(await this.generateCandidate()); }
  static async publishCandidate(candidate: HumorCandidate): Promise<string> {
    const { data: byHandle } = await supabase.from('bot_profiles').select('id').eq('handle', this.BOT_PROFILE.handle).maybeSingle();
    const { data: byKey } = byHandle ? { data: null } : await supabase.from('bot_profiles').select('id').eq('bot_key', 'unidate-ai-bot').maybeSingle();
    const botProfile = byHandle || byKey;
    if (!botProfile) throw new Error('Perfil "UniDate sem contexto" ainda não foi criado no painel de bots.');
    const { data, error } = await supabase.rpc('publish_bot_post', { p_bot_profile_id: botProfile.id, p_content: candidate.text, p_topic: candidate.topic, p_format: candidate.format, p_keywords: candidate.keywords });
    if (error) throw new Error(`Erro ao criar post: ${error.message}`);
    if (!data) throw new Error('O Supabase não retornou o id da publicação.');
    return data as string;
  }
  static getBotProfile() { return this.BOT_PROFILE; }
}
