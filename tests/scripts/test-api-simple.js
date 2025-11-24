#!/usr/bin/env node

/**
 * Script de test simple pour l'API Recherche d'Entreprises
 * Usage: node scripts/test-api-simple.js [SIRET]
 */

const https = require('https');

async function testAPI() {
  const siret = process.argv[2] || '44306184100047';
  
  console.log('🧪 Test direct de l\'API Recherche d\'Entreprises');
  console.log('================================================\n');
  console.log('SIRET testé:', siret);
  
  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'recherche-entreprises.api.gouv.fr',
        port: 443,
        path: `/search?q=${siret}`,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error(`Erreur parsing: ${error.message}`));
            }
          } else {
            reject(new Error(`Erreur HTTP: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
    
    console.log('\n📋 Résultat:');
    console.log('============');
    
    if (result.results && result.results.length > 0) {
      const etablissement = result.results[0];
      console.log('✅ SIRET trouvé !');
      console.log('Nom:', etablissement.nom_complet);
      console.log('SIREN:', etablissement.siren);
      console.log('SIRET:', etablissement.siret);
      console.log('Adresse:', etablissement.siege?.adresse);
      console.log('Code postal:', etablissement.siege?.code_postal);
      console.log('Ville:', etablissement.siege?.commune);
      console.log('Code NAF:', etablissement.activite_principale);
      console.log('Statut:', etablissement.etat_administratif);
    } else {
      console.log('❌ SIRET non trouvé ou établissement fermé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAPI();
