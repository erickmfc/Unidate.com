export interface BotScheduleConfig { isActive: boolean; profiles: Array<{ profileId: string; intervalMinutes: number; lastPostTime: Date|null; nextPostTime: Date|null }>; updatedAt: Date; updatedBy: string; }

const key = 'unidate.bot.schedule';
const normalize = (value: any): BotScheduleConfig => ({ isActive: Boolean(value?.isActive), profiles: (value?.profiles || []).map((profile: any) => ({ ...profile, lastPostTime: profile.lastPostTime ? new Date(profile.lastPostTime) : null, nextPostTime: profile.nextPostTime ? new Date(profile.nextPostTime) : null })), updatedAt: value?.updatedAt ? new Date(value.updatedAt) : new Date(), updatedBy: value?.updatedBy || '' });

class BotPersistenceService {
  async saveScheduleConfig(config: Partial<BotScheduleConfig>, userId: string): Promise<void> { const current = await this.loadScheduleConfig(); const next = normalize({ ...current, ...config, updatedAt: new Date(), updatedBy: userId }); localStorage.setItem(key, JSON.stringify(next)); window.dispatchEvent(new Event('unidate-bot-schedule-updated')); }
  async loadScheduleConfig(): Promise<BotScheduleConfig | null> { const value = localStorage.getItem(key); return value ? normalize(JSON.parse(value)) : null; }
  async updateProfileSchedule(profileId: string, updates: { lastPostTime?: Date; nextPostTime?: Date; intervalMinutes?: number }): Promise<void> { const config = (await this.loadScheduleConfig()) || { isActive: false, profiles: [], updatedAt: new Date(), updatedBy: '' }; const index = config.profiles.findIndex(profile => profile.profileId === profileId); const next = { profileId, intervalMinutes: 60, lastPostTime: null, nextPostTime: null, ...(index >= 0 ? config.profiles[index] : {}), ...updates }; if (index >= 0) config.profiles[index] = next; else config.profiles.push(next); await this.saveScheduleConfig(config, 'system'); }
  watchScheduleConfig(callback: (config: BotScheduleConfig|null) => void): () => void { const load = () => { void this.loadScheduleConfig().then(callback); }; load(); window.addEventListener('unidate-bot-schedule-updated', load); return () => window.removeEventListener('unidate-bot-schedule-updated', load); }
}

export const botPersistenceService = new BotPersistenceService();
