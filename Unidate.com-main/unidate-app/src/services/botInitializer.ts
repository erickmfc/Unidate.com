import { multiBotScheduler } from './multiBotScheduler';
import { botPersistenceService } from './botPersistenceService';

/**
 * Inicializa o sistema de bots quando a aplicação carrega
 * Isso garante que os bots continuem funcionando mesmo após recarregar a página
 */
class BotInitializer {
  private initialized = false;

  /**
   * Inicializa o sistema de bots
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Inicializar o scheduler primeiro
      await multiBotScheduler.initialize();
      
      console.log('✅ Sistema de bots inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar bots:', error);
    }

    this.initialized = true;
  }
}

export const botInitializer = new BotInitializer();

