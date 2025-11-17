import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';

interface CloudflareMetrics {
  requests: number;
  bandwidth: number;
  errors: number;
  cacheHitRate: number;
  lastUpdate: string;
}

interface RailwayMetrics {
  cpu: number;
  memory: number;
  network: {
    ingress: number;
    egress: number;
  };
  uptime: number;
  lastUpdate: string;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Métriques Cloudflare (via API Cloudflare)
    // Note: Vous devrez configurer CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID dans vos variables d'environnement
    let cloudflareMetrics: CloudflareMetrics | null = null;
    
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
    
    if (cloudflareApiToken && cloudflareZoneId) {
      try {
        // Récupérer les métriques des dernières 24h
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/analytics/dashboard?since=${startDate.toISOString()}&until=${endDate.toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${cloudflareApiToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const result = data.result;
          
          cloudflareMetrics = {
            requests: result.totals?.requests?.all || 0,
            bandwidth: result.totals?.bandwidth?.all || 0,
            errors: result.totals?.errors?.all || 0,
            cacheHitRate: result.totals?.requests?.cached 
              ? (result.totals.requests.cached / result.totals.requests.all) * 100 
              : 0,
            lastUpdate: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des métriques Cloudflare:', error);
      }
    }

    // Métriques Railway (via API Railway)
    // Note: Vous devrez configurer RAILWAY_API_TOKEN dans vos variables d'environnement
    let railwayMetrics: RailwayMetrics | null = null;
    
    const railwayApiToken = process.env.RAILWAY_API_TOKEN;
    const railwayProjectId = process.env.RAILWAY_PROJECT_ID;
    
    if (railwayApiToken && railwayProjectId) {
      try {
        // Récupérer les métriques du service
        const response = await fetch(
          `https://api.railway.app/v1/projects/${railwayProjectId}/metrics`,
          {
            headers: {
              'Authorization': `Bearer ${railwayApiToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          railwayMetrics = {
            cpu: data.cpu?.percentage || 0,
            memory: data.memory?.percentage || 0,
            network: {
              ingress: data.network?.ingress || 0,
              egress: data.network?.egress || 0
            },
            uptime: data.uptime || 0,
            lastUpdate: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des métriques Railway:', error);
      }
    }

    // Métriques système Node.js en temps réel
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const systemMetrics = {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: memoryUsage.heapTotal > 0 
          ? Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 * 10) / 10 
          : 0
      },
      uptime: Math.round(uptime),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      cloudflare: cloudflareMetrics,
      railway: railwayMetrics,
      system: systemMetrics
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques temps réel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques temps réel' },
      { status: 500 }
    );
  }
}

