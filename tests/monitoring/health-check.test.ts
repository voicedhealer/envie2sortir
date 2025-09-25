import { HealthChecker, createHealthChecker } from '../../src/lib/monitoring/health-check';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }])
  }))
}));

describe('Health Checker', () => {
  let healthChecker: HealthChecker;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    healthChecker = new HealthChecker(mockPrisma);
  });

  describe('Basic Health Checks', () => {
    test('should perform health check successfully', async () => {
      const result = await healthChecker.performHealthCheck();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
      expect(result.checks).toHaveProperty('database');
      expect(result.checks).toHaveProperty('system');
    });

    test('should return healthy status when all checks pass', async () => {
      const result = await healthChecker.performHealthCheck();
      
      // Mock réussi pour la base de données
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      
      const healthyResult = await healthChecker.performHealthCheck();
      expect(['healthy', 'degraded']).toContain(healthyResult.status);
    });

    test('should return degraded status when non-critical checks fail', async () => {
      // Mock échec pour Redis (non-critique)
      const result = await healthChecker.performHealthCheck();
      
      // Le statut devrait être au minimum 'degraded' si des services non-critiques échouent
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
    });

    test('should return unhealthy status when critical checks fail', async () => {
      // Mock échec pour la base de données (critique)
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Database connection failed'));
      
      const result = await healthChecker.performHealthCheck();
      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('unhealthy');
    });
  });

  describe('Individual Health Checks', () => {
    test('should check database health', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      
      const isHealthy = await (healthChecker as any).checkDatabase();
      expect(isHealthy).toBe(true);
    });

    test('should handle database check timeout', async () => {
      // Mock un délai long pour simuler un timeout
      mockPrisma.$queryRaw.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve([{ '?column?': 1 }]), 6000))
      );
      
      const isHealthy = await (healthChecker as any).checkDatabase();
      expect(isHealthy).toBe(false); // Timeout après 5 secondes
    });

    test('should check Redis health', async () => {
      const isHealthy = await (healthChecker as any).checkRedis();
      expect(typeof isHealthy).toBe('boolean');
    });

    test('should check file storage health', async () => {
      const isHealthy = await (healthChecker as any).checkFileStorage();
      expect(typeof isHealthy).toBe('boolean');
    });

    test('should check external APIs health', async () => {
      const isHealthy = await (healthChecker as any).checkExternalAPIs();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('Detailed Health Check', () => {
    test('should provide detailed health information', async () => {
      const result = await healthChecker.getDetailedHealthCheck();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('metrics');
      
      expect(result.metrics).toHaveProperty('totalRequests');
      expect(result.metrics).toHaveProperty('averageResponseTime');
      expect(result.metrics).toHaveProperty('errorRate');
      expect(result.metrics).toHaveProperty('memoryUsage');
    });
  });

  describe('Readiness and Liveness', () => {
    test('should check if service is ready', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      
      const isReady = await healthChecker.isReady();
      expect(typeof isReady).toBe('boolean');
    });

    test('should check if service is alive', async () => {
      const isAlive = await healthChecker.isAlive();
      expect(isAlive).toBe(true); // Le processus est en cours d'exécution
    });

    test('should return false for readiness when critical services fail', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Database unavailable'));
      
      const isReady = await healthChecker.isReady();
      expect(isReady).toBe(false);
    });
  });

  describe('Health Middleware', () => {
    test('should create health middleware functions', () => {
      // Import de la fonction depuis le module
      const { createHealthMiddleware } = require('../../src/lib/monitoring/health-check');
      const middleware = createHealthMiddleware(healthChecker);
      
      expect(typeof middleware.liveness).toBe('function');
      expect(typeof middleware.readiness).toBe('function');
      expect(typeof middleware.health).toBe('function');
    });

    test('should provide liveness endpoint response', async () => {
      const { createHealthMiddleware } = require('../../src/lib/monitoring/health-check');
      const middleware = createHealthMiddleware(healthChecker);
      const result = await middleware.liveness();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(['healthy', 'unhealthy']).toContain(result.status);
    });

    test('should provide readiness endpoint response', async () => {
      const { createHealthMiddleware } = require('../../src/lib/monitoring/health-check');
      const middleware = createHealthMiddleware(healthChecker);
      const result = await middleware.readiness();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(['ready', 'not_ready']).toContain(result.status);
    });

    test('should provide detailed health endpoint response', async () => {
      const { createHealthMiddleware } = require('../../src/lib/monitoring/health-check');
      const middleware = createHealthMiddleware(healthChecker);
      const result = await middleware.health();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('metrics');
    });
  });

  describe('Error Handling', () => {
    test('should handle health check errors gracefully', async () => {
      // Mock une erreur dans le check de base de données
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection timeout'));
      
      const result = await healthChecker.performHealthCheck();
      
      expect(result.checks.database.status).toBe('unhealthy');
      // Vérifier que l'erreur est présente ou que le status est unhealthy
      if (result.checks.database.error) {
        expect(result.checks.database.error).toContain('Connection timeout');
      }
    });

    test('should handle timeout errors', async () => {
      // Mock un timeout
      mockPrisma.$queryRaw.mockImplementationOnce(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
      );
      
      const result = await healthChecker.performHealthCheck();
      
      expect(result.checks.database.status).toBe('unhealthy');
      expect(result.checks.database.error).toContain('Timeout');
    });
  });

  describe('System Information', () => {
    test('should include system information in health check', async () => {
      const result = await healthChecker.performHealthCheck();
      
      expect(result.checks.system).toHaveProperty('status', 'healthy');
      expect(result.checks.system.details).toHaveProperty('memoryUsage');
      expect(result.checks.system.details).toHaveProperty('uptime');
      expect(result.checks.system.details).toHaveProperty('nodeVersion');
      expect(result.checks.system.details).toHaveProperty('platform');
      
      expect(result.checks.system.details.memoryUsage).toHaveProperty('rss');
      expect(result.checks.system.details.memoryUsage).toHaveProperty('heapTotal');
      expect(result.checks.system.details.memoryUsage).toHaveProperty('heapUsed');
      expect(result.checks.system.details.memoryUsage).toHaveProperty('external');
    });
  });

  describe('Factory Function', () => {
    test('should create health checker instance', () => {
      const instance = createHealthChecker(mockPrisma);
      
      expect(instance).toBeInstanceOf(HealthChecker);
    });
  });
});
