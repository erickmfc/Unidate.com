import { AIBotProfilesService, BotProfile } from './aiBotProfilesService';
import { botPersistenceService, BotScheduleConfig } from './botPersistenceService';

interface ProfileSchedule {
  profileId: string;
  intervalId: NodeJS.Timeout | null;
  lastPostTime: Date | null;
  nextPostTime: Date | null;
}

class MultiBotScheduler {
  private schedules: Map<string, ProfileSchedule> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private persistenceWatcher: (() => void) | null = null;
  private initialized = false;

  constructor() {
  }

  
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadAndStartSchedules();

      this.persistenceWatcher = botPersistenceService.watchScheduleConfig((config) => {
        if (config) {
          this.syncWithPersistence(config);
        }
      });

      this.startPeriodicCheck();
      
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar scheduler:', error);
    }
  }

  
  private async loadAndStartSchedules() {
    try {
      const config = await botPersistenceService.loadScheduleConfig();
      if (!config || !config.isActive) {
        console.log('🤖 Nenhum agendamento ativo encontrado');
        return;
      }

      const profiles = await AIBotProfilesService.getProfiles();
      
      for (const profileSchedule of config.profiles) {
        const profile = profiles.find(p => p.id === profileSchedule.profileId);
        if (profile && profile.status === 'active') {
          await this.startProfileScheduleFromConfig(profile, profileSchedule);
        }
      }

      console.log(`🤖 ${config.profiles.length} agendamentos carregados e iniciados`);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  }

  
  private async syncWithPersistence(config: BotScheduleConfig) {
    if (!config.isActive) {
      this.stopAllProfiles();
      return;
    }

    const profiles = await AIBotProfilesService.getProfiles();
    
    this.schedules.forEach((schedule, profileId) => {
      const stillActive = config.profiles.some(p => p.profileId === profileId);
      if (!stillActive) {
        this.stopProfileScheduleLocal(profileId);
      }
    });

    for (const profileSchedule of config.profiles) {
      const profile = profiles.find(p => p.id === profileSchedule.profileId);
      if (profile && profile.status === 'active') {
        if (!this.schedules.has(profileSchedule.profileId)) {
          await this.startProfileScheduleFromConfig(profile, profileSchedule);
        }
      }
    }
  }

  
  private startPeriodicCheck() {
    this.checkInterval = setInterval(async () => {
      await this.checkAndCreatePendingPosts();
    }, 60000);
  }

  
  private async checkAndCreatePendingPosts() {
    try {
      const config = await botPersistenceService.loadScheduleConfig();
      if (!config || !config.isActive) return;

      const profiles = await AIBotProfilesService.getProfiles();
      const now = new Date();

      for (const profileSchedule of config.profiles) {
        const profile = profiles.find(p => p.id === profileSchedule.profileId);
        if (!profile || profile.status !== 'active') continue;

        const nextPostTime = profileSchedule.nextPostTime;
        if (nextPostTime && now >= nextPostTime) {
          await this.createPostForProfile(profile);
          
          const newNextPostTime = new Date(now.getTime() + profileSchedule.intervalMinutes * 60 * 1000);
          await botPersistenceService.updateProfileSchedule(profile.id, {
            lastPostTime: now,
            nextPostTime: newNextPostTime
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar posts pendentes:', error);
    }
  }

  
  private async startProfileScheduleFromConfig(
    profile: BotProfile, 
    config: { intervalMinutes: number; lastPostTime: Date | null; nextPostTime: Date | null }
  ) {
    this.stopProfileScheduleLocal(profile.id);

    const schedule: ProfileSchedule = {
      profileId: profile.id,
      intervalId: null,
      lastPostTime: config.lastPostTime,
      nextPostTime: config.nextPostTime || this.calculateNextPostTime(config.lastPostTime, config.intervalMinutes)
    };

    if (schedule.nextPostTime && new Date() >= schedule.nextPostTime) {
      await this.createPostForProfile(profile);
      schedule.lastPostTime = new Date();
      schedule.nextPostTime = this.calculateNextPostTime(schedule.lastPostTime, config.intervalMinutes);
    }

    const timeUntilNext = schedule.nextPostTime 
      ? Math.max(0, schedule.nextPostTime.getTime() - new Date().getTime())
      : config.intervalMinutes * 60 * 1000;

    schedule.intervalId = setTimeout(async () => {
      await this.createPostForProfile(profile);
      schedule.lastPostTime = new Date();
      schedule.nextPostTime = this.calculateNextPostTime(schedule.lastPostTime, config.intervalMinutes);
      
      await botPersistenceService.updateProfileSchedule(profile.id, {
        lastPostTime: schedule.lastPostTime,
        nextPostTime: schedule.nextPostTime
      });

      this.scheduleNextPost(profile, schedule);
    }, timeUntilNext);

    this.schedules.set(profile.id, schedule);
    console.log(`🤖 Agendamento iniciado para ${profile.name}`);
  }

  
  private scheduleNextPost(profile: BotProfile, schedule: ProfileSchedule) {
    if (schedule.intervalId) {
      clearTimeout(schedule.intervalId);
    }
    
    schedule.intervalId = setInterval(async () => {
      await this.createPostForProfile(profile);
      schedule.lastPostTime = new Date();
      schedule.nextPostTime = this.calculateNextPostTime(schedule.lastPostTime, profile.postingFrequency.intervalMinutes);
      
      await botPersistenceService.updateProfileSchedule(profile.id, {
        lastPostTime: schedule.lastPostTime,
        nextPostTime: schedule.nextPostTime
      });
    }, profile.postingFrequency.intervalMinutes * 60 * 1000);
  }

  
  private calculateNextPostTime(lastPostTime: Date | null, intervalMinutes: number): Date {
    const now = new Date();
    if (!lastPostTime) {
      return new Date(now.getTime() + intervalMinutes * 60 * 1000);
    }
    return new Date(lastPostTime.getTime() + intervalMinutes * 60 * 1000);
  }

  
  async startProfileSchedule(profile: BotProfile, userId: string = 'system') {
    if (!profile.postingFrequency.enabled || profile.status !== 'active') {
      return;
    }

    const config = await botPersistenceService.loadScheduleConfig();
    const profiles = config?.profiles || [];
    
    const existingIndex = profiles.findIndex(p => p.profileId === profile.id);
    const nextPostTime = this.calculateNextPostTime(null, profile.postingFrequency.intervalMinutes);

    if (existingIndex >= 0) {
      profiles[existingIndex] = {
        profileId: profile.id,
        intervalMinutes: profile.postingFrequency.intervalMinutes,
        lastPostTime: null,
        nextPostTime
      };
    } else {
      profiles.push({
        profileId: profile.id,
        intervalMinutes: profile.postingFrequency.intervalMinutes,
        lastPostTime: null,
        nextPostTime
      });
    }

    await botPersistenceService.saveScheduleConfig({
      isActive: true,
      profiles
    }, userId);

    await this.startProfileScheduleFromConfig(profile, {
      intervalMinutes: profile.postingFrequency.intervalMinutes,
      lastPostTime: null,
      nextPostTime
    });
  }

  
  async stopProfileSchedule(profileId: string, userId: string = 'system') {
    this.stopProfileScheduleLocal(profileId);

    const config = await botPersistenceService.loadScheduleConfig();
    if (config) {
      config.profiles = config.profiles.filter(p => p.profileId !== profileId);
      
      if (config.profiles.length === 0) {
        config.isActive = false;
      }

      await botPersistenceService.saveScheduleConfig(config, userId);
    }
  }

  
  private stopProfileScheduleLocal(profileId: string) {
    const schedule = this.schedules.get(profileId);
    if (schedule?.intervalId) {
      clearTimeout(schedule.intervalId);
      clearInterval(schedule.intervalId as any);
      this.schedules.delete(profileId);
      console.log(`🤖 Agendamento parado para perfil ${profileId}`);
    }
  }

  
  async stopAllProfiles(userId: string = 'system') {
    this.schedules.forEach((_, profileId) => {
      this.stopProfileScheduleLocal(profileId);
    });

    await botPersistenceService.saveScheduleConfig({
      isActive: false,
      profiles: []
    }, userId);
  }

  
  private async createPostForProfile(profile: BotProfile) {
    try {
      console.log(`🤖 Criando post para ${profile.name}...`);
      const postId = await AIBotProfilesService.createPostForProfile(profile);
      
      const schedule = this.schedules.get(profile.id);
      if (schedule) {
        schedule.lastPostTime = new Date();
        schedule.nextPostTime = this.calculateNextPostTime(
          schedule.lastPostTime, 
          profile.postingFrequency.intervalMinutes
        );
      }
      
      await botPersistenceService.updateProfileSchedule(profile.id, {
        lastPostTime: schedule?.lastPostTime || new Date(),
        nextPostTime: schedule?.nextPostTime ? schedule.nextPostTime : undefined
      });
      
      console.log(`✅ Post criado para ${profile.name}: ${postId}`);
    } catch (error) {
      console.error(`❌ Erro ao criar post para ${profile.name}:`, error);
    }
  }

  
  async updateProfileSchedule(profile: BotProfile, userId: string = 'system') {
    this.stopProfileScheduleLocal(profile.id);
    
    if (profile.status === 'active' && profile.postingFrequency.enabled) {
      await this.startProfileSchedule(profile, userId);
    } else {
      await this.stopProfileSchedule(profile.id, userId);
    }
  }

  
  getSchedulesStatus(): Array<{ profileId: string; isActive: boolean; lastPostTime: Date | null }> {
    return Array.from(this.schedules.entries()).map(([profileId, schedule]) => ({
      profileId,
      isActive: true,
      lastPostTime: schedule.lastPostTime
    }));
  }

  
  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.persistenceWatcher) {
      this.persistenceWatcher();
    }
    this.stopAllProfiles();
  }
}

export const multiBotScheduler = new MultiBotScheduler();
