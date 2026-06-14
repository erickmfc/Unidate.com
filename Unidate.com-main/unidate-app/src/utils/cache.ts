interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class AppCache {
  private static cache = new Map<string, CacheEntry<any>>();

  /**
   * Armazena um valor no cache com um TTL (Time-To-Live) em milissegundos.
   * @param key Chave de busca do cache
   * @param value O valor a ser armazenado
   * @param ttlMs Tempo de expiração em milissegundos (padrão: 60 segundos)
   */
  static set<T>(key: string, value: T, ttlMs: number = 60000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Recupera um valor do cache. Retorna null se expirar ou não existir.
   * @param key Chave de busca do cache
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Remove uma chave específica do cache.
   * @param key Chave do cache a ser removida
   */
  static remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Remove chaves do cache que contêm um determinado padrão/substring.
   * @param pattern Padrão de texto a procurar nas chaves
   */
  static clearPattern(pattern: string): void {
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Limpa todo o cache em memória.
   */
  static clear(): void {
    this.cache.clear();
  }
}
