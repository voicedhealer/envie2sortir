import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { getRailwayProject, getRailwayServiceMetrics } from '@/lib/railway-api';
import { getCloudflareDetailedMetrics, verifyCloudflareZone, CloudflareDetailedMetrics } from '@/lib/cloudflare-api';

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

    // Métriques Cloudflare (via API GraphQL Cloudflare)
    // Note: L'API REST Analytics est deprecated, on utilise maintenant GraphQL
    // Vous devrez configurer CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID dans vos variables d'environnement
    let cloudflareMetrics: CloudflareDetailedMetrics | null = null;
    
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
    
    if (cloudflareApiToken && cloudflareZoneId) {
      try {
        // Vérifier que la zone existe et que le token est valide
        const zoneCheckResult = await verifyCloudflareZone(cloudflareZoneId, cloudflareApiToken);

        if (!zoneCheckResult.success) {
          console.error('❌ Erreur API Cloudflare (zone check):', zoneCheckResult.error);
          
          if (zoneCheckResult.error?.includes('401') || zoneCheckResult.error?.includes('unauthorized')) {
            console.error('💡 Le token Cloudflare est invalide ou n\'a pas les bonnes permissions');
          }
        } else {
          console.log(`✅ Zone Cloudflare vérifiée: ${zoneCheckResult.zoneName || cloudflareZoneId}`);
          
          // Récupérer les métriques détaillées des dernières 7 jours via GraphQL
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 jours
          
          const metricsResult = await getCloudflareDetailedMetrics(
            cloudflareZoneId,
            cloudflareApiToken,
            startDate,
            endDate
          );
          
          if (metricsResult.success && metricsResult.data) {
            cloudflareMetrics = metricsResult.data;
            console.log('✅ Métriques Cloudflare détaillées récupérées avec succès via GraphQL');
            console.log(`   ${metricsResult.data.dailyData.length} jours de données`);
            console.log(`   ${metricsResult.data.hourlyData.length} heures de données`);
            console.log(`   ${Object.keys(metricsResult.data.httpStatusCodes).length} codes HTTP différents`);
            console.log(`   ${metricsResult.data.countries.length} pays`);
          } else {
            console.error('❌ Erreur API Cloudflare (GraphQL analytics):', metricsResult.error);
            
            if (metricsResult.error?.includes('403') || metricsResult.error?.includes('permission')) {
              console.error('💡 Le token Cloudflare n\'a pas les permissions pour accéder aux analytics.');
              console.error('💡 Assurez-vous que le token a la permission "Zone:Analytics:Read"');
            } else if (metricsResult.error?.includes('GraphQL')) {
              console.error('💡 Erreur GraphQL - Vérifiez que votre compte Cloudflare a accès à l\'API GraphQL Analytics');
            }
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des métriques Cloudflare:', error);
      }
    } else {
      console.log('⚠️ Cloudflare non configuré: Token ou Zone ID manquant');
    }

    // Métriques Railway (via API GraphQL Railway)
    // Note: Vous devrez configurer RAILWAY_API_TOKEN et RAILWAY_PROJECT_ID dans vos variables d'environnement
    let railwayMetrics: RailwayMetrics | null = null;
    
    const railwayApiToken = process.env.RAILWAY_API_TOKEN;
    const railwayProjectId = process.env.RAILWAY_PROJECT_ID;
    
    if (railwayApiToken && railwayProjectId) {
      try {
        // Récupérer le projet via GraphQL
        const projectResult = await getRailwayProject(railwayProjectId, railwayApiToken);
        
        if (!projectResult.success) {
          console.error('❌ Erreur API Railway (GraphQL):', projectResult.error);
          console.error('💡 Project ID utilisé:', railwayProjectId);
          
          if (projectResult.error?.includes('404') || projectResult.error?.includes('not found')) {
            console.error('💡 Le Project ID Railway est incorrect ou le projet n\'existe pas');
            console.error('💡 Vérifiez que le Project ID correspond bien à l\'ID du projet dans Railway');
            console.error('💡 Le Project ID doit être l\'UUID complet du projet (ex: 732fe205-469c-4297-84e0-6ffa45e04589)');
            console.error('💡 Vérifiez aussi que le token a accès à ce projet');
          } else if (projectResult.error?.includes('401') || projectResult.error?.includes('unauthorized')) {
            console.error('💡 Le token Railway est invalide ou n\'a pas accès à ce projet');
          }
        } else if (projectResult.data) {
          const project = projectResult.data;
          console.log('✅ Projet Railway trouvé:', project.name);
          
          const services = project.services?.edges || [];
          console.log(`📦 ${services.length} service(s) trouvé(s) dans le projet`);
          
          if (services.length > 0) {
            const serviceId = services[0].node.id;
            const serviceName = services[0].node.name;
            console.log(`📊 Récupération des métriques pour le service: ${serviceName} (${serviceId})`);
            
            // Récupérer les métriques du service via l'API REST
            // (Les métriques ne sont pas disponibles via GraphQL)
            const metricsResult = await getRailwayServiceMetrics(serviceId, railwayApiToken);
            
            if (metricsResult.success && metricsResult.data) {
              const data = metricsResult.data;
              
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
              
              console.log('✅ Métriques Railway récupérées avec succès');
            } else {
              console.error('❌ Erreur API Railway (metrics):', metricsResult.error);
            }
          } else {
            console.log('⚠️ Aucun service trouvé dans le projet Railway');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des métriques Railway:', error);
      }
    } else {
      console.log('⚠️ Railway non configuré: Token ou Project ID manquant');
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
    
    // Retourner une réponse partielle même en cas d'erreur pour ne pas bloquer l'interface
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return NextResponse.json({
      cloudflare: null,
      railway: null,
      system: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percentage: memoryUsage.heapTotal > 0 
            ? Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 * 10) / 10 
            : 0
        },
        uptime: Math.round(uptime),
        timestamp: new Date().toISOString()
      },
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 200 }); // Retourner 200 pour ne pas bloquer l'interface, même en cas d'erreur partielle
  }
}

