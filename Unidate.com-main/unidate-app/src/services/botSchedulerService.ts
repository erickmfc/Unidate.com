import { AIBotService } from './aiBotService';
import { botPersistenceService } from './botPersistenceService';

export interface BotSchedule {
  intervalMinutes: number;
  isActive: boolean;
  lastPostTime: Date | null;
  intervalId: NodeJS.Timeout | null;
}

class BotSchedulerService {
  private schedule: BotSchedule = {
    intervalMinutes: 60,
    isActive: false,
    lastPostTime: null,
    intervalId: null
  };

  private readonly BOT_PROFILE_ID = 'unidate-ai-bot'; // ID fixo para o bot simples

  constructor() {
    // Carregar configuração salva ao inicializar
    this.loadSavedConfig();
  }

  /**
   * Carrega configuração salva do Firestore
   * ETAPA 2: Garantir que o bot reinicia automaticamente
   */
  private async loadSavedConfig() {
    try {
      // Aguardar um pouco para garantir que Firebase está pronto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = await botPersistenceService.loadScheduleConfig();
      if (config && config.isActive) {
        // Verificar se há um perfil para o bot simples
        const botProfile = config.profiles.find(p => p.profileId === this.BOT_PROFILE_ID);
        if (botProfile) {
          console.log('🔄 [BotScheduler] Carregando configuração:', botProfile);
          
          this.schedule.intervalMinutes = botProfile.intervalMinutes;
          this.schedule.isActive = true;
          this.schedule.lastPostTime = botProfile.lastPostTime;
          
          // Reiniciar agendamento se estiver ativo
          const now = new Date();
          if (botProfile.nextPostTime) {
            const nextPostDate = botProfile.nextPostTime;
            if (now >= nextPostDate) {
              // Já passou o horário, criar post imediatamente
              console.log('⏰ [BotScheduler] Horário passou, criando post imediatamente...');
              this.createScheduledPost();
            } else {
              // Calcular tempo até próximo post
              const timeUntilNext = nextPostDate.getTime() - now.getTime();
              console.log(`⏰ [BotScheduler] Próximo post em ${Math.floor(timeUntilNext / 60000)} minutos`);
            }
          }
          
          // Agendar próximo post
          this.startScheduleInternal(botProfile.intervalMinutes);
          
          console.log('✅ [BotScheduler] Bot carregado do Firestore e reiniciado');
        } else {
          console.log('ℹ️ [BotScheduler] Nenhum perfil encontrado na configuração');
        }
      } else {
        console.log('ℹ️ [BotScheduler] Bot não está ativo na configuração');
      }
    } catch (error) {
      console.error('❌ [BotScheduler] Erro ao carregar configuração salva:', error);
    }
  }

  /**
   * Inicia o agendamento de posts automáticos (com persistência)
   */
  async startSchedule(intervalMinutes: number = 60, userId: string = 'system') {
    if (this.schedule.isActive) {
      await this.stopSchedule(userId);
    }

    this.schedule.intervalMinutes = intervalMinutes;
    this.schedule.isActive = true;

    // Salvar no Firestore
    await this.saveConfig(userId);

    // Iniciar agendamento interno
    this.startScheduleInternal(intervalMinutes);

    console.log(`🤖 Bot iniciado: posts a cada ${intervalMinutes} minutos`);
  }

  /**
   * Inicia o agendamento interno (sem salvar)
   */
  private startScheduleInternal(intervalMinutes: number) {
    // Parar agendamento existente
    if (this.schedule.intervalId) {
      clearInterval(this.schedule.intervalId);
    }

    // Agendar posts periódicos
    this.schedule.intervalId = setInterval(() => {
      this.createScheduledPost();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Para o agendamento (com persistência)
   */
  async stopSchedule(userId: string = 'system') {
    if (this.schedule.intervalId) {
      clearInterval(this.schedule.intervalId);
      this.schedule.intervalId = null;
    }
    this.schedule.isActive = false;

    // Salvar no Firestore
    await this.saveConfig(userId);

    console.log('🤖 Bot parado');
  }

  /**
   * Salva configuração no Firestore
   */
  private async saveConfig(userId: string) {
    try {
      const config = await botPersistenceService.loadScheduleConfig();
      const profiles = config?.profiles || [];

      const botProfileIndex = profiles.findIndex(p => p.profileId === this.BOT_PROFILE_ID);
      const nextPostTime = this.schedule.lastPostTime
        ? new Date(this.schedule.lastPostTime.getTime() + this.schedule.intervalMinutes * 60 * 1000)
        : new Date(Date.now() + this.schedule.intervalMinutes * 60 * 1000);

      if (botProfileIndex >= 0) {
        profiles[botProfileIndex] = {
          profileId: this.BOT_PROFILE_ID,
          intervalMinutes: this.schedule.intervalMinutes,
          lastPostTime: this.schedule.lastPostTime,
          nextPostTime: this.schedule.isActive ? nextPostTime : null
        };
      } else {
        profiles.push({
          profileId: this.BOT_PROFILE_ID,
          intervalMinutes: this.schedule.intervalMinutes,
          lastPostTime: this.schedule.lastPostTime,
          nextPostTime: this.schedule.isActive ? nextPostTime : null
        });
      }

      await botPersistenceService.saveScheduleConfig({
        isActive: this.schedule.isActive,
        profiles
      }, userId);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }

  /**
   * Cria um post agendado
   */
  private async createScheduledPost() {
    try {
      console.log('🤖 Criando post automático...');
      const postId = await AIBotService.createAIPost();
      this.schedule.lastPostTime = new Date();
      
      // Atualizar no Firestore
      await this.saveConfig('system');
      
      console.log(`✅ Post automático criado: ${postId}`);
    } catch (error) {
      console.error('❌ Erro ao criar post automático:', error);
    }
  }

  /**
   * Retorna o status atual do agendamento
   */
  getScheduleStatus(): BotSchedule {
    return { ...this.schedule };
  }

  /**
   * Atualiza o intervalo sem reiniciar (com persistência)
   */
  async updateInterval(intervalMinutes: number, userId: string = 'system') {
    this.schedule.intervalMinutes = intervalMinutes;
    if (this.schedule.isActive) {
      this.startScheduleInternal(intervalMinutes);
      await this.saveConfig(userId);
    }
  }

  /**
   * Cria um post manualmente (para teste)
   */
  async createPostNow(): Promise<string> {
    return await AIBotService.createAIPost();
  }
}

export const botScheduler = new BotSchedulerService();
