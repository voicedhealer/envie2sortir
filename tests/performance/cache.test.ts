import { CacheManager, withCache, generateCacheKey } from '../../src/lib/performance/cache';

describe('Cache System', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager({
      ttl: 60, // 1 minute pour les tests
      maxSize: 10
    });
  });

  afterEach(async () => {
    await cache.clear();
  });

  describe('Basic Operations', () => {
    test('should set and get values', async () => {
      await cache.set('test-key', 'test-value');
      const value = await cache.get('test-key');
      
      expect(value).toBe('test-value');
    });

    test('should return null for non-existent keys', async () => {
      const value = await cache.get('non-existent');
      expect(value).toBeNull();
    });

    test('should check if key exists', async () => {
      await cache.set('exists', 'value');
      
      expect(cache.has('exists')).toBe(true);
      expect(cache.has('not-exists')).toBe(false);
    });

    test('should delete keys', async () => {
      await cache.set('delete-me', 'value');
      expect(cache.has('delete-me')).toBe(true);
      
      await cache.delete('delete-me');
      expect(cache.has('delete-me')).toBe(false);
    });
  });

  describe('TTL and Expiration', () => {
    test('should respect TTL', async () => {
      await cache.set('short-lived', 'value', 1); // 1 second
      
      expect(await cache.get('short-lived')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(await cache.get('short-lived')).toBeNull();
    });

    test('should not expire before TTL', async () => {
      await cache.set('long-lived', 'value', 10); // 10 seconds
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(await cache.get('long-lived')).toBe('value');
    });
  });

  describe('Cache Size Management', () => {
    test('should respect max size', async () => {
      // Fill cache to max size
      for (let i = 0; i < 10; i++) {
        await cache.set(`key-${i}`, `value-${i}`);
      }
      
      expect(cache.size()).toBe(10);
      
      // Add one more - should evict oldest
      await cache.set('new-key', 'new-value');
      
      expect(cache.size()).toBe(10);
      expect(cache.has('key-0')).toBe(false); // Should be evicted
      expect(cache.has('new-key')).toBe(true);
    });
  });

  describe('Cache Statistics', () => {
    test('should provide cache statistics', async () => {
      await cache.set('stat1', 'value1');
      await cache.set('stat2', 'value2');
      
      const stats = cache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
      expect(stats.averageAge).toBeGreaterThanOrEqual(0);
    });
  });

  describe('withCache Helper', () => {
    test('should cache function results', async () => {
      let callCount = 0;
      const expensiveFunction = async () => {
        callCount++;
        return `result-${callCount}`;
      };

      // First call should execute function
      const result1 = await withCache(cache, 'expensive', expensiveFunction);
      expect(result1).toBe('result-1');
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await withCache(cache, 'expensive', expensiveFunction);
      expect(result2).toBe('result-1');
      expect(callCount).toBe(1); // Should not increase
    });

    test('should handle function errors', async () => {
      const failingFunction = async () => {
        throw new Error('Function failed');
      };

      await expect(
        withCache(cache, 'failing', failingFunction)
      ).rejects.toThrow('Function failed');
      
      // Cache should not contain failed result
      expect(await cache.get('failing')).toBeNull();
    });
  });

  describe('Cache Key Generation', () => {
    test('should generate consistent cache keys', () => {
      const key1 = generateCacheKey('test', { param1: 'value1', param2: 'value2' });
      const key2 = generateCacheKey('test', { param2: 'value2', param1: 'value1' });
      
      expect(key1).toBe(key2); // Should be same regardless of param order
    });

    test('should generate different keys for different params', () => {
      const key1 = generateCacheKey('test', { param1: 'value1' });
      const key2 = generateCacheKey('test', { param1: 'value2' });
      
      expect(key1).not.toBe(key2);
    });
  });
});
