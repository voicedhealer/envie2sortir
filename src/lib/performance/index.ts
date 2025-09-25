// Export de tous les modules de performance
export * from './cache';
export * from './image-optimization';
export * from './response-optimization';
export * from './database-optimization';

// Configuration de performance centralisée
export const PERFORMANCE_CONFIG = {
  // Cache
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    MAX_SIZE: 1000,
    USE_REDIS: process.env.NODE_ENV === 'production'
  },
  
  // Images
  IMAGES: {
    DEFAULT_QUALITY: 85,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    SUPPORTED_FORMATS: ['jpeg', 'png', 'webp', 'avif'],
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
  },
  
  // Responses
  RESPONSES: {
    COMPRESSION_THRESHOLD: 1024, // 1KB
    DEFAULT_CACHE_TTL: 300, // 5 minutes
    MAX_PAGINATION_LIMIT: 100
  },
  
  // Database
  DATABASE: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    QUERY_TIMEOUT: 30000, // 30 seconds
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// Instances globales de cache
export { 
  categoriesCache, 
  establishmentsCache, 
  randomEstablishmentsCache 
} from './cache';

// Presets d'images
export { IMAGE_PRESETS } from './image-optimization';

// Configurations de réponses
export { RESPONSE_CONFIGS } from './response-optimization';
