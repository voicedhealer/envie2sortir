// Export de tous les modules de monitoring
export * from './metrics-collector';
export * from './health-check';
export * from './logger';

// Configuration de monitoring centralisée
export const MONITORING_CONFIG = {
  // Métriques
  METRICS: {
    MAX_HISTORY: 1000,
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 heures
    COLLECTION_INTERVAL: 5000 // 5 secondes
  },
  
  // Health Checks
  HEALTH: {
    TIMEOUT: 5000, // 5 secondes
    CRITICAL_SERVICES: ['database'],
    NON_CRITICAL_SERVICES: ['redis', 'external_apis']
  },
  
  // Logging
  LOGGING: {
    LEVEL: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    MAX_FILES: 5,
    ENABLE_CONSOLE: true,
    ENABLE_FILE: process.env.NODE_ENV === 'production'
  }
} as const;

// Instances globales
export { 
  metricsCollector
} from './metrics-collector';

export { 
  logger,
  securityLogger,
  performanceLogger
} from './logger';

export { 
  createHealthChecker,
  createHealthMiddleware
} from './health-check';

export { 
  createRequestLogger,
  generateRequestId
} from './logger';
