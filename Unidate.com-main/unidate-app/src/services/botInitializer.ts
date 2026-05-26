import { multiBotScheduler } from './multiBotScheduler';
import { botPersistenceService } from './botPersistenceService';


class BotInitializer {
  private initialized = false;

  
  async initialize() {
    if (this.initialized) return;

    try {
      await multiBotScheduler.initialize();
      
      console.log('✅ Sistema de bots inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar bots:', error);
    }

    this.initialized = true;
  }
}

export const botInitializer = new BotInitializer();
