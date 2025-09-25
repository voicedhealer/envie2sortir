import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier la santé de la base de données
    let databaseHealth = false;
    let databaseError = null;
    
    try {
      // Test simple de connexion à la base de données
      await prisma.$queryRaw`SELECT 1`;
      databaseHealth = true;
    } catch (error) {
      databaseError = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur de santé DB:', databaseError);
    }

    // Vérifier la santé de Redis (simulé pour l'instant)
    let redisHealth = false;
    let redisError = null;
    
    try {
      // Dans un vrai environnement, tester la connexion Redis
      // const redis = new Redis(process.env.REDIS_URL);
      // await redis.ping();
      
      // Pour l'instant, simuler Redis comme non configuré
      redisHealth = false;
      redisError = 'Redis non configuré en développement';
    } catch (error) {
      redisError = error instanceof Error ? error.message : 'Erreur Redis inconnue';
    }

    // Statut global
    const overallHealth = databaseHealth; // Redis n'est pas critique pour le fonctionnement

    const healthStatus = {
      database: databaseHealth,
      redis: redisHealth,
      overall: overallHealth,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime ? process.uptime() : 0,
      details: {
        database: {
          status: databaseHealth ? 'healthy' : 'unhealthy',
          error: databaseError
        },
        redis: {
          status: redisHealth ? 'healthy' : 'unhealthy',
          error: redisError
        }
      }
    };

    return NextResponse.json(healthStatus);

  } catch (error) {
    console.error('Erreur lors de la vérification de santé:', error);
    return NextResponse.json(
      { 
        database: false,
        redis: false,
        overall: false,
        error: 'Erreur lors de la vérification de santé',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}