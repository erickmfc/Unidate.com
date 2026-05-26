import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface BotScheduleConfig {
  isActive: boolean;
  profiles: Array<{
    profileId: string;
    intervalMinutes: number;
    lastPostTime: Date | null;
    nextPostTime: Date | null;
  }>;
  updatedAt: Date;
  updatedBy: string;
}

class BotPersistenceService {
  private readonly CONFIG_DOC_ID = 'bot-schedule-config';

  
  async saveScheduleConfig(config: Partial<BotScheduleConfig>, userId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firebase não inicializado');

      const configRef = doc(db, 'botSchedules', this.CONFIG_DOC_ID);
      
      await setDoc(configRef, {
        ...config,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      }, { merge: true });

      console.log('✅ Configuração de bot salva no Firestore');
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      throw error;
    }
  }

  
  async loadScheduleConfig(): Promise<BotScheduleConfig | null> {
    try {
      if (!db) throw new Error('Firebase não inicializado');

      const configRef = doc(db, 'botSchedules', this.CONFIG_DOC_ID);
      const snapshot = await getDoc(configRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        isActive: data.isActive || false,
        profiles: (data.profiles || []).map((p: any) => ({
          ...p,
          lastPostTime: p.lastPostTime?.toDate?.() || null,
          nextPostTime: p.nextPostTime?.toDate?.() || null
        })),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        updatedBy: data.updatedBy || ''
      };
    } catch (error) {
      console.error('❌ Erro ao carregar configuração:', error);
      return null;
    }
  }

  
  async updateProfileSchedule(
    profileId: string, 
    updates: {
      lastPostTime?: Date;
      nextPostTime?: Date;
      intervalMinutes?: number;
    }
  ): Promise<void> {
    try {
      if (!db) throw new Error('Firebase não inicializado');

      const config = await this.loadScheduleConfig();
      if (!config) return;

      const profileIndex = config.profiles.findIndex(p => p.profileId === profileId);
      
      if (profileIndex >= 0) {
        config.profiles[profileIndex] = {
          ...config.profiles[profileIndex],
          ...updates
        };
      } else {
        config.profiles.push({
          profileId,
          intervalMinutes: updates.intervalMinutes || 60,
          lastPostTime: updates.lastPostTime || null,
          nextPostTime: updates.nextPostTime || null
        });
      }

      await this.saveScheduleConfig(config, 'system');
    } catch (error) {
      console.error('❌ Erro ao atualizar agendamento do perfil:', error);
    }
  }

  
  watchScheduleConfig(callback: (config: BotScheduleConfig | null) => void): () => void {
    if (!db) {
      console.error('Firebase não inicializado');
      return () => {};
    }

    const configRef = doc(db, 'botSchedules', this.CONFIG_DOC_ID);
    
    const unsubscribe = onSnapshot(configRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      const config: BotScheduleConfig = {
        isActive: data.isActive || false,
        profiles: (data.profiles || []).map((p: any) => ({
          ...p,
          lastPostTime: p.lastPostTime?.toDate?.() || null,
          nextPostTime: p.nextPostTime?.toDate?.() || null
        })),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        updatedBy: data.updatedBy || ''
      };

      callback(config);
    }, (error) => {
      console.error('Erro ao observar configuração:', error);
      callback(null);
    });

    return unsubscribe;
  }
}

export const botPersistenceService = new BotPersistenceService();
