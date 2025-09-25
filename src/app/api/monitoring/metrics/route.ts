import { NextRequest, NextResponse } from 'next/server';
import { metricsCollector } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les métriques actuelles
    const apiRequestsMetric = metricsCollector.getMetric('http_requests_total');
    
    // Calculer les métriques système simulées
    const memoryUsage = process.memoryUsage ? process.memoryUsage() : {
      heapUsed: 50 * 1024 * 1024, // 50MB simulé
      rss: 100 * 1024 * 1024, // 100MB simulé
      heapTotal: 80 * 1024 * 1024, // 80MB simulé
      external: 10 * 1024 * 1024 // 10MB simulé
    };

    const totalMemory = 512 * 1024 * 1024; // 512MB simulé (taille typique d'un conteneur)
    const memoryPercentage = (memoryUsage.heapUsed / totalMemory) * 100;

    // CPU simulé (dans un vrai environnement, utiliser pidusage ou similaire)
    const cpuUsage = Math.random() * 30 + 10; // Entre 10% et 40%

    // Métriques API simulées
    const totalRequests = apiRequestsMetric?.values[0]?.value || Math.floor(Math.random() * 1000) + 500;
    const errorRate = Math.random() * 5; // Entre 0% et 5%
    const avgResponseTime = Math.floor(Math.random() * 200) + 50; // Entre 50ms et 250ms

    // Métriques de sécurité simulées
    const blockedRequests = Math.floor(Math.random() * 10);
    const failedLogins = Math.floor(Math.random() * 5);

    const systemMetrics = {
      memory: {
        used: memoryUsage.heapUsed,
        total: totalMemory,
        percentage: memoryPercentage
      },
      cpu: {
        usage: cpuUsage
      },
      api: {
        totalRequests,
        errorRate,
        avgResponseTime
      },
      security: {
        blockedRequests,
        failedLogins
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() : 0
    };

    return NextResponse.json(systemMetrics);

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    );
  }
}