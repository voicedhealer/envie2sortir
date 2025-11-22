/**
 * Script de test pour l'API Railway GraphQL
 * 
 * Usage: npx tsx scripts/test-railway-api.ts
 */

// Charger les variables d'environnement AVANT tout
import { config } from 'dotenv';
import { resolve } from 'path';

// Essayer plusieurs fichiers .env
const envFiles = ['.env.local', '.env'];
let envLoaded = false;
for (const file of envFiles) {
  const result = config({ path: resolve(process.cwd(), file) });
  if (!result.error) {
    console.log(`📄 Variables chargées depuis ${file}\n`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️ Aucun fichier .env trouvé, utilisation des variables système\n');
}

import { getRailwayProject, getRailwayServiceMetrics } from '../src/lib/railway-api';

async function testRailwayAPI() {
  console.log('🚀 Test de l\'API Railway GraphQL\n');
  console.log('=' .repeat(60));

  // Vérifier les variables d'environnement
  const railwayApiToken = process.env.RAILWAY_API_TOKEN;
  const railwayProjectId = process.env.RAILWAY_PROJECT_ID;

  console.log('\n📋 Vérification des variables d\'environnement:');
  console.log(`  RAILWAY_API_TOKEN: ${railwayApiToken ? '✅ Présent' : '❌ Manquant'}`);
  console.log(`  RAILWAY_PROJECT_ID: ${railwayProjectId ? '✅ Présent' : '❌ Manquant'}`);
  
  if (railwayApiToken) {
    const tokenPreview = railwayApiToken.substring(0, 20) + '...';
    console.log(`  Token preview: ${tokenPreview}`);
  }
  
  if (railwayProjectId) {
    console.log(`  Project ID: ${railwayProjectId}`);
  }

  if (!railwayApiToken || !railwayProjectId) {
    console.error('\n❌ Erreur: Variables d\'environnement manquantes');
    console.error('💡 Assurez-vous d\'avoir configuré RAILWAY_API_TOKEN et RAILWAY_PROJECT_ID dans votre .env.local');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📡 Test 1: Récupération du projet via GraphQL\n');

  try {
    const projectResult = await getRailwayProject(railwayProjectId, railwayApiToken);

    if (!projectResult.success) {
      console.error('❌ Échec de la récupération du projet');
      console.error(`   Erreur: ${projectResult.error}`);
      
      if (projectResult.error?.includes('401') || projectResult.error?.includes('unauthorized')) {
        console.error('\n💡 Le token Railway est invalide ou n\'a pas accès à ce projet');
        console.error('💡 Vérifiez que le token est correct et qu\'il a accès au projet');
      } else if (projectResult.error?.includes('404') || projectResult.error?.includes('not found')) {
        console.error('\n💡 Le Project ID est incorrect ou le projet n\'existe pas');
        console.error('💡 Vérifiez que le Project ID correspond bien à l\'UUID du projet dans Railway');
      }
      process.exit(1);
    }

    if (!projectResult.data) {
      console.error('❌ Aucune donnée retournée');
      process.exit(1);
    }

    const project = projectResult.data;
    console.log('✅ Projet récupéré avec succès!\n');
    console.log('📦 Informations du projet:');
    console.log(`   ID: ${project.id}`);
    console.log(`   Nom: ${project.name}`);
    
    const services = project.services?.edges || [];
    console.log(`   Services: ${services.length}`);
    
    if (services.length > 0) {
      console.log('\n📋 Liste des services:');
      services.forEach((edge, index) => {
        console.log(`   ${index + 1}. ${edge.node.name} (${edge.node.id})`);
      });

      console.log('\n' + '='.repeat(60));
      console.log('\n📡 Test 2: Récupération des métriques du premier service\n');

      const firstService = services[0].node;
      console.log(`📊 Test avec le service: ${firstService.name} (${firstService.id})\n`);

      const metricsResult = await getRailwayServiceMetrics(firstService.id, railwayApiToken);

      if (!metricsResult.success) {
        if (metricsResult.error?.includes('404')) {
          console.log('⚠️ Métriques non disponibles (404)');
          console.log('   Cela est normal si le service n\'est pas actif ou si les métriques ne sont pas encore disponibles');
          console.log('   Les métriques apparaissent généralement après quelques minutes d\'activité du service');
        } else {
          console.error('❌ Échec de la récupération des métriques');
          console.error(`   Erreur: ${metricsResult.error}`);
        }
      } else if (metricsResult.data) {
        console.log('✅ Métriques récupérées avec succès!\n');
        console.log('📊 Métriques du service:');
        const data = metricsResult.data;
        
        if (data.cpu) {
          console.log(`   CPU: ${data.cpu.percentage || 0}%`);
        }
        if (data.memory) {
          console.log(`   Mémoire: ${data.memory.percentage || 0}%`);
        }
        if (data.network) {
          console.log(`   Réseau (ingress): ${data.network.ingress || 0}`);
          console.log(`   Réseau (egress): ${data.network.egress || 0}`);
        }
        if (data.uptime !== undefined) {
          console.log(`   Uptime: ${data.uptime}s`);
        }
        
        // Afficher toutes les données si disponibles
        if (Object.keys(data).length > 0) {
          console.log('\n📄 Données complètes:');
          console.log(JSON.stringify(data, null, 2));
        }
      } else {
        console.log('⚠️ Aucune métrique disponible pour ce service');
      }
    } else {
      console.log('\n⚠️ Aucun service trouvé dans le projet');
      console.log('💡 Assurez-vous qu\'au moins un service est déployé dans votre projet Railway');
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
testRailwayAPI().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});

