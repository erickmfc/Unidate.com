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

  private readonly BOT_PROFILE_ID = 'unidate-ai-bot';

  constructor() {
    this.loadSavedConfig();
  }

  
  private async loadSavedConfig() {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = await botPersistenceService.loadScheduleConfig();
      if (config && config.isActive) {
        const botProfile = config.profiles.find(p => p.profileId === this.BOT_PROFILE_ID);
        if (botProfile) {
          console.log('🔄 [BotScheduler] Carregando configuração:', botProfile);
          
          this.schedule.intervalMinutes = botProfile.intervalMinutes;
          this.schedule.isActive = true;
          this.schedule.lastPostTime = botProfile.lastPostTime;
          
          const now = new Date();
          if (botProfile.nextPostTime) {
            const nextPostDate = botProfile.nextPostTime;
            if (now >= nextPostDate) {
              console.log('⏰ [BotScheduler] Horário passou, criando post imediatamente...');
              this.createScheduledPost();
            } else {
              const timeUntilNext = nextPostDate.getTime() - now.getTime();
              console.log(`⏰ [BotScheduler] Próximo post em ${Math.floor(timeUntilNext / 60000)} minutos`);
            }
          }
          
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

  
  async startSchedule(intervalMinutes: number = 60, userId: string = 'system') {
    if (this.schedule.isActive) {
      await this.stopSchedule(userId);
    }

    this.schedule.intervalMinutes = intervalMinutes;
    this.schedule.isActive = true;

    await this.saveConfig(userId);

    this.startScheduleInternal(intervalMinutes);

    console.log(`🤖 Bot iniciado: posts a cada ${intervalMinutes} minutos`);
  }

  
  private startScheduleInternal(intervalMinutes: number) {
    if (this.schedule.intervalId) {
      clearInterval(this.schedule.intervalId);
    }

    this.schedule.intervalId = setInterval(() => {
      this.createScheduledPost();
    }, intervalMinutes * 60 * 1000);
  }

  
  async stopSchedule(userId: string = 'system') {
    if (this.schedule.intervalId) {
      clearInterval(this.schedule.intervalId);
      this.schedule.intervalId = null;
    }
    this.schedule.isActive = false;

    await this.saveConfig(userId);

    console.log('🤖 Bot parado');
  }

  
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

  
  private async createScheduledPost() {
    try {
      console.log('🤖 Criando post automático...');
      const postId = await AIBotService.createAIPost();
      this.schedule.lastPostTime = new Date();
      
      await this.saveConfig('system');
      
      console.log(`✅ Post automático criado: ${postId}`);
    } catch (error) {
      console.error('❌ Erro ao criar post automático:', error);
    }
  }

  
  getScheduleStatus(): BotSchedule {
    return { ...this.schedule };
  }

  
  async updateInterval(intervalMinutes: number, userId: string = 'system') {
    this.schedule.intervalMinutes = intervalMinutes;
    if (this.schedule.isActive) {
      this.startScheduleInternal(intervalMinutes);
      await this.saveConfig(userId);
    }
  }

  
  async createPostNow(): Promise<string> {
    return await AIBotService.createAIPost();
  }
}

export const botScheduler = new BotSchedulerService();
