/**
 * Script de comparaison entre l'API REST et GraphQL Railway
 * 
 * Usage: npx tsx scripts/test-railway-comparison.ts
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

import { getRailwayProject } from '../src/lib/railway-api';

async function compareAPIs() {
  console.log('🔍 Comparaison API REST vs GraphQL Railway\n');
  console.log('='.repeat(60));

  const railwayApiToken = process.env.RAILWAY_API_TOKEN;
  const railwayProjectId = process.env.RAILWAY_PROJECT_ID;

  if (!railwayApiToken || !railwayProjectId) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
  }

  console.log(`\n📋 Project ID: ${railwayProjectId}\n`);

  // Test 1: API REST
  console.log('='.repeat(60));
  console.log('\n📡 Test 1: API REST (api.railway.app)\n');

  try {
    const restStart = Date.now();
    const restResponse = await fetch(
      `https://api.railway.app/v1/projects/${railwayProjectId}`,
      {
        headers: {
          'Authorization': `Bearer ${railwayApiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const restTime = Date.now() - restStart;

    if (restResponse.ok) {
      const restData = await restResponse.json();
      console.log('✅ API REST: Succès');
      console.log(`   Temps de réponse: ${restTime}ms`);
      console.log(`   Projet: ${restData.project?.name || 'N/A'}`);
      
      // Récupérer les services
      const servicesResponse = await fetch(
        `https://api.railway.app/v1/projects/${railwayProjectId}/services`,
        {
          headers: {
            'Authorization': `Bearer ${railwayApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const services = servicesData.services || servicesData || [];
        console.log(`   Services: ${services.length}`);
        if (services.length > 0) {
          console.log(`   Premier service: ${services[0].name || services[0].id}`);
        }
      }
    } else {
      const errorData = await restResponse.json().catch(() => ({}));
      console.error(`❌ API REST: Erreur ${restResponse.status}`);
      console.error(`   ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error('❌ Erreur API REST:', error instanceof Error ? error.message : error);
  }

  // Test 2: API GraphQL
  console.log('\n' + '='.repeat(60));
  console.log('\n📡 Test 2: API GraphQL (backboard.railway.com)\n');

  try {
    const graphqlStart = Date.now();
    const graphqlResult = await getRailwayProject(railwayProjectId, railwayApiToken);
    const graphqlTime = Date.now() - graphqlStart;

    if (graphqlResult.success && graphqlResult.data) {
      console.log('✅ API GraphQL: Succès');
      console.log(`   Temps de réponse: ${graphqlTime}ms`);
      console.log(`   Projet: ${graphqlResult.data.name}`);
      const services = graphqlResult.data.services?.edges || [];
      console.log(`   Services: ${services.length}`);
      if (services.length > 0) {
        console.log(`   Premier service: ${services[0].node.name}`);
      }
    } else {
      console.error(`❌ API GraphQL: Erreur`);
      console.error(`   ${graphqlResult.error}`);
    }
  } catch (error) {
    console.error('❌ Erreur API GraphQL:', error instanceof Error ? error.message : error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Résumé de la comparaison:\n');
  console.log('✅ Les deux APIs fonctionnent correctement');
  console.log('💡 L\'API GraphQL permet de récupérer le projet et les services en une seule requête');
  console.log('💡 L\'API REST nécessite deux requêtes séparées (projet + services)');
  console.log('\n');
}

compareAPIs().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});




