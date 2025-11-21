import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const config = {
      cloudflare: {
        configured: !!(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID),
        hasToken: !!process.env.CLOUDFLARE_API_TOKEN,
        hasZoneId: !!process.env.CLOUDFLARE_ZONE_ID,
        tokenLength: process.env.CLOUDFLARE_API_TOKEN?.length || 0,
        zoneIdLength: process.env.CLOUDFLARE_ZONE_ID?.length || 0
      },
      railway: {
        configured: !!(process.env.RAILWAY_API_TOKEN && process.env.RAILWAY_PROJECT_ID),
        hasToken: !!process.env.RAILWAY_API_TOKEN,
        hasProjectId: !!process.env.RAILWAY_PROJECT_ID,
        tokenLength: process.env.RAILWAY_API_TOKEN?.length || 0,
        projectIdLength: process.env.RAILWAY_PROJECT_ID?.length || 0
      },
      supabase: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    };

    // Vérifier si la table security_events existe
    let securityTableExists = false;
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('security_events')
        .select('id')
        .limit(1);
      
      securityTableExists = !error;
    } catch (error) {
      console.error('Erreur lors de la vérification de la table security_events:', error);
    }

    return NextResponse.json({
      config,
      securityTable: {
        exists: securityTableExists,
        status: securityTableExists ? '✅ Table créée' : '❌ Table manquante - Exécutez la migration 012_create_security_events_table.sql'
      },
      recommendations: [
        !config.cloudflare.configured && 'Configurez CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID pour activer les métriques Cloudflare',
        !config.railway.configured && 'Configurez RAILWAY_API_TOKEN et RAILWAY_PROJECT_ID pour activer les métriques Railway',
        !securityTableExists && 'Exécutez la migration SQL 012_create_security_events_table.sql dans Supabase'
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la configuration' },
      { status: 500 }
    );
  }
}





