interface CacheOptions {
  ttl?: number; // Time to live en secondes
  maxSize?: number; // Taille maximale du cache
}

interface CacheItem<T> {
  value: T;
  expires: number;
  createdAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.ttl || 300; // 5 minutes par défaut
  }

  set<T>(key: string, value: T, ttl?: number): void {
    // Nettoyer le cache si nécessaire
    this.cleanup();
    
    // Vérifier la taille maximale
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const expires = Date.now() + (ttl || this.defaultTTL) * 1000;
    this.cache.set(key, {
      value,
      expires,
      createdAt: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Statistiques du cache
  getStats() {
    this.cleanup();
    const now = Date.now();
    let totalAge = 0;
    let expiredCount = 0;

    for (const item of this.cache.values()) {
      totalAge += now - item.createdAt;
      if (now > item.expires) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // À implémenter avec un compteur
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
      expiredItems: expiredCount
    };
  }
}

// Cache Redis simulé (pour la production)
class RedisCache {
  private connected = false;
  
  async connect(): Promise<void> {
    // Simulation de connexion Redis
    this.connected = true;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }
    
    // En production, utiliser redis.setex()
    console.log(`Redis SET ${key} with TTL ${ttl || 'default'}`);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }
    
    // En production, utiliser redis.get()
    console.log(`Redis GET ${key}`);
    return null;
  }

  async delete(key: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }
    
    // En production, utiliser redis.del()
    console.log(`Redis DEL ${key}`);
    return true;
  }

  async clear(): Promise<void> {
    if (!this.connected) {
      throw new Error('Redis not connected');
    }
    
    // En production, utiliser redis.flushall()
    console.log('Redis FLUSHALL');
  }
}

// Cache principal avec fallback
export class CacheManager {
  private memoryCache: MemoryCache;
  private redisCache: RedisCache;
  private useRedis: boolean;

  constructor(options: CacheOptions & { useRedis?: boolean } = {}) {
    this.memoryCache = new MemoryCache(options);
    this.redisCache = new RedisCache();
    this.useRedis = options.useRedis || false;
  }

  async initialize(): Promise<void> {
    if (this.useRedis) {
      await this.redisCache.connect();
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Toujours mettre en cache mémoire
    this.memoryCache.set(key, value, ttl);
    
    // Si Redis est activé, mettre aussi en Redis
    if (this.useRedis) {
      try {
        await this.redisCache.set(key, value, ttl);
      } catch (error) {
        console.warn('Redis cache failed, falling back to memory:', error);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Essayer d'abord le cache mémoire
    let value = this.memoryCache.get<T>(key);
    
    if (value !== null) {
      return value;
    }

    // Si Redis est activé, essayer Redis
    if (this.useRedis) {
      try {
        value = await this.redisCache.get<T>(key);
        if (value !== null) {
          // Mettre en cache mémoire pour les prochaines fois
          this.memoryCache.set(key, value);
          return value;
        }
      } catch (error) {
        console.warn('Redis cache failed:', error);
      }
    }

    return null;
  }

  async delete(key: string): Promise<boolean> {
    const memoryResult = this.memoryCache.delete(key);
    
    if (this.useRedis) {
      try {
        await this.redisCache.delete(key);
      } catch (error) {
        console.warn('Redis delete failed:', error);
      }
    }

    return memoryResult;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.useRedis) {
      try {
        await this.redisCache.clear();
      } catch (error) {
        console.warn('Redis clear failed:', error);
      }
    }
  }

  has(key: string): boolean {
    return this.memoryCache.has(key);
  }

  size(): number {
    return this.memoryCache.size();
  }

  getStats() {
    return this.memoryCache.getStats();
  }
}

// Instances globales configurées
export const categoriesCache = new CacheManager({
  ttl: 3600, // 1 heure pour les catégories
  maxSize: 100,
  useRedis: process.env.NODE_ENV === 'production'
});

export const establishmentsCache = new CacheManager({
  ttl: 1800, // 30 minutes pour les établissements
  maxSize: 500,
  useRedis: process.env.NODE_ENV === 'production'
});

export const randomEstablishmentsCache = new CacheManager({
  ttl: 600, // 10 minutes pour les établissements aléatoires
  maxSize: 200,
  useRedis: process.env.NODE_ENV === 'production'
});

// Fonctions utilitaires
export async function withCache<T>(
  cache: CacheManager,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Essayer de récupérer depuis le cache
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Si pas en cache, exécuter la fonction et mettre en cache
  const result = await fetcher();
  await cache.set(key, result, ttl);
  
  return result;
}

// Générateurs de clés de cache
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}
