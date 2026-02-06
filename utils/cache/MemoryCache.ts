/**
 * Sistema de caché en memoria con TTL
 * Almacena respuestas de API para evitar requests repetidos
 */

class MemoryCache {
  private cache: Map<string, any>;
  private defaultTTL: number;

  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  /**
   * Generar key único para el caché
   */
  generateKey(prefix: string, params: any) {
    const sortedParams = Object.keys(params || {})
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Obtener valor del caché
   */
  get(key: string) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar si expiró
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Guardar valor en caché
   */
  set(key: string, value: any, ttl: number = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Verificar si existe en caché y no ha expirado
   */
  has(key: string) {
    return this.get(key) !== null;
  }

  /**
   * Eliminar un elemento específico
   */
  delete(key: string) {
    this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Limpiar elementos expirados
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia singleton
const memoryCache = new MemoryCache();

// Limpiar caché expirado cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 10 * 60 * 1000);
}

export default memoryCache;
