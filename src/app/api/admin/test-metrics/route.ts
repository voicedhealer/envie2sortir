import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { getRailwayProject } from '@/lib/railway-api';
import { verifyCloudflareZone, getCloudflareMetrics } from '@/lib/cloudflare-api';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const results: any = {
      cloudflare: { configured: false, error: null, data: null },
      railway: { configured: false, error: null, data: null }
    };

    // Test Cloudflare (via GraphQL)
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
    
    if (cloudflareApiToken && cloudflareZoneId) {
      try {
        // Vérifier la zone
        const zoneResult = await verifyCloudflareZone(cloudflareZoneId, cloudflareApiToken);

        if (zoneResult.success) {
          // Tester la récupération des métriques (dernières 24h)
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          
          const metricsResult = await getCloudflareMetrics(
            cloudflareZoneId,
            cloudflareApiToken,
            startDate,
            endDate
          );

          if (metricsResult.success) {
            results.cloudflare = {
              configured: true,
              error: null,
              data: {
                zoneName: zoneResult.zoneName,
                requests: metricsResult.data?.requests || 0,
                bandwidth: metricsResult.data?.bandwidth || 0,
                cacheHitRate: metricsResult.data?.cacheHitRate || 0
              }
            };
          } else {
            results.cloudflare = {
              configured: false,
              error: `Erreur GraphQL: ${metricsResult.error}`,
              data: {
                zoneName: zoneResult.zoneName
              }
            };
          }
        } else {
          results.cloudflare = {
            configured: false,
            error: zoneResult.error || 'Erreur inconnue',
            data: null
          };
        }
      } catch (error: any) {
        results.cloudflare = {
          configured: false,
          error: error.message,
          data: null
        };
      }
    } else {
      results.cloudflare.error = 'Variables d\'environnement manquantes';
    }

    // Test Railway (via GraphQL)
    const railwayApiToken = process.env.RAILWAY_API_TOKEN;
    const railwayProjectId = process.env.RAILWAY_PROJECT_ID;
    
    if (railwayApiToken && railwayProjectId) {
      try {
        // Récupérer le projet via GraphQL
        const projectResult = await getRailwayProject(railwayProjectId, railwayApiToken);

        if (projectResult.success && projectResult.data) {
          const project = projectResult.data;
          const services = project.services?.edges || [];
          
          results.railway = {
            configured: true,
            error: null,
            data: {
              projectName: project.name,
              projectId: project.id,
              servicesCount: services.length,
              services: services.map((edge: any) => ({ 
                id: edge.node.id, 
                name: edge.node.name 
              }))
            }
          };
        } else {
          let errorMessage = projectResult.error || 'Erreur inconnue';
          
          if (projectResult.error?.includes('401') || projectResult.error?.includes('unauthorized')) {
            errorMessage = `Token invalide (401) - Vérifiez que le token Railway est correct`;
          } else if (projectResult.error?.includes('404') || projectResult.error?.includes('not found')) {
            errorMessage = `Project ID incorrect (404) - Le projet "${railwayProjectId}" n'existe pas ou le token n'y a pas accès`;
          }
          
          results.railway = {
            configured: false,
            error: errorMessage,
            data: {
              projectId: railwayProjectId
            }
          };
        }
      } catch (error: any) {
        results.railway = {
          configured: false,
          error: `Erreur réseau: ${error.message}`,
          data: null
        };
      }
    } else {
      results.railway.error = 'Variables d\'environnement manquantes';
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

