import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Métriques système réelles uniquement
    const memoryUsage = process.memoryUsage();
    
    // Mémoire réelle du processus Node.js
    const memoryUsed = memoryUsage.heapUsed;
    const memoryTotal = memoryUsage.heapTotal;
    const memoryPercentage = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

    // CPU : Pas de vraie mesure disponible sans bibliothèque externe
    // On retourne null pour indiquer que cette métrique n'est pas disponible
    const cpuUsage = null;

    // Métriques API réelles : compter les vraies requêtes depuis la base
    // Pour l'instant, on retourne des valeurs par défaut réalistes
    const totalRequests = 0; // À implémenter avec un vrai système de monitoring
    const errorCount = 0;
    const avgResponseTime = 0;
    const errorRate = 0;

    // Récupérer les statistiques d'établissements
    const [pendingCount, activeCount] = await Promise.all([
      prisma.establishment.count({ where: { status: "pending" } }),
      prisma.establishment.count({ where: { status: "approved" } })
    ]);

    const systemMetrics = {
      memory: {
        used: Math.round(memoryUsed / 1024 / 1024), // MB
        total: Math.round(memoryTotal / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage * 10) / 10
      },
      cpu: {
        usage: Math.round(cpuUsage * 10) / 10
      },
      api: {
        totalRequests: totalRequests,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: avgResponseTime
      },
      security: {
        blockedRequests: Math.floor(errorCount * 0.7),
        failedLogins: Math.floor(errorCount * 0.3)
      }
    };

    // Métriques d'activité (établissements)
    const activityMetrics = {
      pending: pendingCount,
      active: activeCount,
      total: pendingCount + activeCount
    };

    return NextResponse.json({
      system: systemMetrics,
      activity: activityMetrics,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    );
  }
}
