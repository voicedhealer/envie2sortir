import { PrismaClient } from '@prisma/client';
import { metricsCollector } from './metrics-collector';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: Record<string, {
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
    details?: any;
  }>;
  uptime: number;
  version: string;
  environment: string;
}

interface DependencyCheck {
  name: string;
  check: () => Promise<boolean>;
  timeout?: number;
  critical?: boolean;
}

export class HealthChecker {
  private prisma: PrismaClient;
  private startTime: number;
  private dependencies: DependencyCheck[] = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.startTime = Date.now();
    this.initializeDependencies();
  }

  private initializeDependencies(): void {
    // Base de données
    this.dependencies.push({
      name: 'database',
      check: this.checkDatabase.bind(this),
      timeout: 5000,
      critical: true
    });

    // Cache Redis (si configuré)
    this.dependencies.push({
      name: 'redis',
      check: this.checkRedis.bind(this),
      timeout: 3000,
      critical: false
    });

    // Stockage de fichiers
    this.dependencies.push({
      name: 'file_storage',
      check: this.checkFileStorage.bind(this),
      timeout: 3000,
      critical: false
    });

    // APIs externes
    this.dependencies.push({
      name: 'external_apis',
      check: this.checkExternalAPIs.bind(this),
      timeout: 5000,
      critical: false
    });
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      // Enregistrer la métrique
      metricsCollector.recordGauge('health_check_database_response_time', responseTime);
      
      return responseTime < 1000; // Considéré comme healthy si < 1 seconde
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      // Simulation de check Redis
      // En production, utiliser le client Redis réel
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  private async checkFileStorage(): Promise<boolean> {
    try {
      // Vérifier l'accès au dossier d'upload
      const fs = require('fs');
      const path = require('path');
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Test d'écriture
      const testFile = path.join(uploadDir, 'health-check-test.txt');
      fs.writeFileSync(testFile, 'health check');
      fs.unlinkSync(testFile);
      
      return true;
    } catch (error) {
      console.error('File storage health check failed:', error);
      return false;
    }
  }

  private async checkExternalAPIs(): Promise<boolean> {
    try {
      // Vérifier les APIs externes critiques
      const checks = [
        this.checkGoogleMapsAPI(),
        this.checkEmailService()
      ];

      const results = await Promise.allSettled(checks);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      return successCount >= results.length * 0.5; // Au moins 50% des APIs doivent fonctionner
    } catch (error) {
      console.error('External APIs health check failed:', error);
      return false;
    }
  }

  private async checkGoogleMapsAPI(): Promise<boolean> {
    try {
      // Vérifier si l'API Google Maps est accessible
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return false;
      }

      // Test simple (en production, faire un appel réel)
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkEmailService(): Promise<boolean> {
    try {
      // Vérifier la configuration email
      const emailConfig = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER
      };

      return Object.values(emailConfig).every(value => value !== undefined);
    } catch (error) {
      return false;
    }
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = Date.now();
    const checks: Record<string, any> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Exécuter tous les checks
    const checkPromises = this.dependencies.map(async (dependency) => {
      const startTime = Date.now();
      
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), dependency.timeout || 5000);
        });

        const checkPromise = dependency.check();
        const result = await Promise.race([checkPromise, timeoutPromise]);
        
        const responseTime = Date.now() - startTime;
        const status = result ? 'healthy' : 'unhealthy';

        checks[dependency.name] = {
          status,
          responseTime,
          critical: dependency.critical
        };

        // Déterminer le statut global
        if (dependency.critical && !result) {
          overallStatus = 'unhealthy';
        } else if (!result && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }

      } catch (error) {
        const responseTime = Date.now() - startTime;
        checks[dependency.name] = {
          status: 'unhealthy',
          responseTime,
          error: error.message,
          critical: dependency.critical
        };

        if (dependency.critical) {
          overallStatus = 'unhealthy';
        } else if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    });

    await Promise.allSettled(checkPromises);

    // Métriques système
    const memoryUsage = process.memoryUsage();
    const uptime = Date.now() - this.startTime;

    checks.system = {
      status: 'healthy',
      details: {
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        uptime,
        nodeVersion: process.version,
        platform: process.platform
      }
    };

    // Enregistrer la métrique de health check
    metricsCollector.recordGauge('health_check_status', 
      overallStatus === 'healthy' ? 1 : overallStatus === 'degraded' ? 0.5 : 0
    );

    return {
      status: overallStatus,
      timestamp,
      checks,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  async getDetailedHealthCheck(): Promise<HealthCheckResult & {
    metrics: {
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
  }> {
    const basicCheck = await this.performHealthCheck();
    const apiSummary = metricsCollector.getAPIMetricsSummary();
    const memoryUsage = process.memoryUsage();

    return {
      ...basicCheck,
      metrics: {
        totalRequests: apiSummary.totalRequests,
        averageResponseTime: apiSummary.averageResponseTime,
        errorRate: apiSummary.errorRate,
        memoryUsage: memoryUsage.heapUsed
      }
    };
  }

  // Endpoint de readiness
  async isReady(): Promise<boolean> {
    const criticalDependencies = this.dependencies.filter(dep => dep.critical);
    
    for (const dependency of criticalDependencies) {
      try {
        const result = await Promise.race([
          dependency.check(),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), dependency.timeout || 5000)
          )
        ]);
        
        if (!result) {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  // Endpoint de liveness
  async isAlive(): Promise<boolean> {
    // Un service est "alive" s'il peut répondre aux requêtes
    // Ici, on vérifie juste que le processus est en cours d'exécution
    return process.uptime() > 0;
  }
}

// Fonction utilitaire pour créer une instance
export function createHealthChecker(prisma: PrismaClient): HealthChecker {
  return new HealthChecker(prisma);
}

// Middleware pour les endpoints de health
export function createHealthMiddleware(healthChecker: HealthChecker) {
  return {
    async liveness() {
      const isAlive = await healthChecker.isAlive();
      return {
        status: isAlive ? 'healthy' : 'unhealthy',
        timestamp: Date.now(),
        uptime: process.uptime()
      };
    },

    async readiness() {
      const isReady = await healthChecker.isReady();
      return {
        status: isReady ? 'ready' : 'not_ready',
        timestamp: Date.now(),
        checks: await healthChecker.performHealthCheck()
      };
    },

    async health() {
      return await healthChecker.getDetailedHealthCheck();
    }
  };
}
