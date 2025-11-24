/**
 * Script de test pour l'API Cloudflare GraphQL Analytics
 * 
 * Usage: npx tsx scripts/test-cloudflare-api.ts
 */

// Charger les variables d'environnement AVANT tout
import { config } from 'dotenv';
import { resolve } from 'path';

const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const result = config({ path: resolve(process.cwd(), file) });
  if (!result.error) {
    console.log(`📄 Variables chargées depuis ${file}\n`);
    break;
  }
}

import { getCloudflareMetrics, verifyCloudflareZone } from '../src/lib/cloudflare-api';

async function testCloudflareAPI() {
  console.log('🚀 Test de l\'API Cloudflare GraphQL Analytics\n');
  console.log('='.repeat(60));

  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
  const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;

  console.log('\n📋 Vérification des variables d\'environnement:');
  console.log(`  CLOUDFLARE_API_TOKEN: ${cloudflareApiToken ? '✅ Présent' : '❌ Manquant'}`);
  console.log(`  CLOUDFLARE_ZONE_ID: ${cloudflareZoneId ? '✅ Présent' : '❌ Manquant'}`);
  
  if (cloudflareApiToken) {
    const tokenPreview = cloudflareApiToken.substring(0, 20) + '...';
    console.log(`  Token preview: ${tokenPreview}`);
  }
  
  if (cloudflareZoneId) {
    console.log(`  Zone ID: ${cloudflareZoneId}`);
  }

  if (!cloudflareApiToken || !cloudflareZoneId) {
    console.error('\n❌ Erreur: Variables d\'environnement manquantes');
    console.error('💡 Assurez-vous d\'avoir configuré CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID dans votre .env.local');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📡 Test 1: Vérification de la zone Cloudflare\n');

  try {
    const zoneResult = await verifyCloudflareZone(cloudflareZoneId, cloudflareApiToken);

    if (!zoneResult.success) {
      console.error('❌ Échec de la vérification de la zone');
      console.error(`   Erreur: ${zoneResult.error}`);
      
      if (zoneResult.error?.includes('401') || zoneResult.error?.includes('unauthorized')) {
        console.error('\n💡 Le token Cloudflare est invalide ou n\'a pas les bonnes permissions');
        console.error('💡 Vérifiez que le token est correct et qu\'il a accès à la zone');
      } else if (zoneResult.error?.includes('404') || zoneResult.error?.includes('not found')) {
        console.error('\n💡 La Zone ID est incorrecte ou la zone n\'existe pas');
        console.error('💡 Vérifiez que la Zone ID correspond bien à votre zone dans Cloudflare');
      }
      process.exit(1);
    }

    console.log('✅ Zone vérifiée avec succès!');
    console.log(`   Nom de la zone: ${zoneResult.zoneName || 'N/A'}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n📡 Test 2: Récupération des métriques via GraphQL\n');

    // Récupérer les métriques des dernières 24h
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

    console.log(`📅 Période: ${startDate.toISOString()} → ${endDate.toISOString()}\n`);

    const metricsResult = await getCloudflareMetrics(
      cloudflareZoneId,
      cloudflareApiToken,
      startDate,
      endDate
    );

    if (!metricsResult.success) {
      console.error('❌ Échec de la récupération des métriques');
      console.error(`   Erreur: ${metricsResult.error}`);
      
      if (metricsResult.error?.includes('403') || metricsResult.error?.includes('permission')) {
        console.error('\n💡 Le token Cloudflare n\'a pas les permissions pour accéder aux analytics');
        console.error('💡 Assurez-vous que le token a la permission "Zone:Analytics:Read"');
        console.error('💡 Vous pouvez créer un nouveau token avec cette permission sur: https://dash.cloudflare.com/profile/api-tokens');
      } else if (metricsResult.error?.includes('GraphQL')) {
        console.error('\n💡 Erreur GraphQL - Vérifiez que votre compte Cloudflare a accès à l\'API GraphQL Analytics');
        console.error('💡 L\'API GraphQL Analytics est disponible pour tous les comptes Cloudflare');
      }
    } else if (metricsResult.data) {
      console.log('✅ Métriques récupérées avec succès!\n');
      console.log('📊 Métriques Cloudflare (24h):');
      console.log(`   Requêtes: ${metricsResult.data.requests.toLocaleString()}`);
      console.log(`   Bande passante: ${(metricsResult.data.bandwidth / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Erreurs: ${metricsResult.data.errors}`);
      console.log(`   Taux de cache: ${metricsResult.data.cacheHitRate.toFixed(2)}%`);
      console.log(`   Dernière mise à jour: ${metricsResult.data.lastUpdate}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Tous les tests sont terminés!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Exécuter les tests
testCloudflareAPI().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});




