import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifier la santé de la base de données
    let databaseHealth = false;
    let databaseError = null;
    
    try {
      // Test simple de connexion à la base de données Supabase
      const supabase = await createClient();
      const { error } = await supabase.from('users').select('id').limit(1);
      // Si l'erreur est "table not found", c'est normal si les migrations ne sont pas appliquées
      // Mais si c'est une erreur de connexion, c'est un problème
      if (error && !error.message.includes('does not exist') && !error.message.includes('not found')) {
        throw error;
      }
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