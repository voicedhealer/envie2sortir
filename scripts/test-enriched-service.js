#!/usr/bin/env node

/**
 * Script de test pour le service SIRET enrichi avec les nomenclatures
 * Usage: node scripts/test-enriched-service.js [SIRET]
 */

const https = require('https');

// Import des nomenclatures (simulation côté serveur)
const formesJuridiques = {
  "1000": "Entrepreneur individuel",
  "1100": "Entrepreneur individuel à responsabilité limitée",
  "5200": "SARL",
  "5710": "SAS, société par actions simplifiée",
  "9220": "Association déclarée"
};

const codesNAF = {
  "56.10A": "Restauration traditionnelle",
  "56.10B": "Cafétérias et autres libres-services", 
  "56.10C": "Restauration de type rapide",
  "56.30Z": "Débits de boissons",
  "62.02A": "Conseil en systèmes et logiciels informatiques",
  "93.11Z": "Gestion d'installations sportives"
};

async function testEnrichedService() {
  const siret = process.argv[2] || '44306184100047';
  
  console.log('🧪 Test du service SIRET enrichi avec nomenclatures');
  console.log('==================================================\n');
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
    
    console.log('\n📋 Résultat enrichi:');
    console.log('====================');
    
    if (result.results && result.results.length > 0) {
      const etablissement = result.results[0];
      
      // Construire l'adresse complète
      const adresseParts = [];
      if (etablissement.siege?.adresse) adresseParts.push(etablissement.siege.adresse);
      if (etablissement.siege?.code_postal) adresseParts.push(etablissement.siege.code_postal);
      if (etablissement.siege?.commune) adresseParts.push(etablissement.siege.commune);
      const adresseComplete = adresseParts.join(' ');
      
      // Enrichir avec les nomenclatures
      const legalStatusCode = etablissement.nature_juridique || '';
      const legalStatusLabel = formesJuridiques[legalStatusCode] || 'Forme juridique inconnue';
      
      const activityCode = etablissement.activite_principale || '';
      const activityLabel = codesNAF[activityCode] || 'Activité inconnue';
      
      console.log('✅ SIRET trouvé et enrichi !');
      console.log('============================');
      console.log('📊 Données de base:');
      console.log(`   Nom: ${etablissement.nom_complet}`);
      console.log(`   SIREN: ${etablissement.siren}`);
      console.log(`   SIRET: ${etablissement.siret}`);
      console.log(`   Adresse: ${adresseComplete}`);
      console.log('');
      console.log('🏢 Données enrichies:');
      console.log(`   Statut juridique: ${legalStatusLabel} (${legalStatusCode})`);
      console.log(`   Activité: ${activityLabel} (${activityCode})`);
      console.log(`   Date création: ${etablissement.date_creation || 'Non disponible'}`);
      console.log(`   Effectifs: Tranche ${etablissement.tranche_effectif_salarie || 'Non disponible'}`);
      console.log(`   Statut admin: ${etablissement.etat_administratif || 'Non disponible'}`);
      
    } else {
      console.log('❌ SIRET non trouvé ou établissement fermé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEnrichedService();
