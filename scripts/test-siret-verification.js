#!/usr/bin/env node

/**
 * Script de test pour la vérification SIRET avec l'API INSEE
 * Usage: node scripts/test-siret-verification.js [SIRET]
 */

const https = require('https');

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_INSEE_API_URL || 'https://api.insee.fr/entreprises/sirene/V3',
  consumerKey: process.env.INSEE_CONSUMER_KEY || '',
  consumerSecret: process.env.INSEE_CONSUMER_SECRET || ''
};

// SIRET de test par défaut (McDonald's France)
const DEFAULT_SIRET = '34342013500019';

/**
 * Valide le format d'un numéro SIRET
 */
function validateSiretFormat(siret) {
  const cleanSiret = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleanSiret)) {
    return false;
  }

  // Vérification de la clé de contrôle (algorithme de Luhn)
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanSiret.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanSiret[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Obtient un token d'accès OAuth2
 */
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const credentials = Buffer.from(`${CONFIG.consumerKey}:${CONFIG.consumerSecret}`).toString('base64');
    
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname: 'api.insee.fr',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const tokenData = JSON.parse(data);
          resolve(tokenData.access_token);
        } catch (error) {
          reject(new Error(`Erreur parsing token: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Vérifie un numéro SIRET
 */
async function verifySiret(siret) {
  try {
    console.log(`🔍 Vérification du SIRET: ${siret}`);
    
    // Validation du format
    if (!validateSiretFormat(siret)) {
      console.log('❌ Format SIRET invalide');
      return;
    }
    
    console.log('✅ Format SIRET valide');
    
    // Obtenir le token
    console.log('🔑 Obtention du token d\'accès...');
    const token = await getAccessToken();
    console.log('✅ Token obtenu');
    
    // Appel à l'API INSEE
    console.log('🌐 Appel à l\'API INSEE...');
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.insee.fr',
        port: 443,
        path: `/entreprises/sirene/V3/siret/${siret}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 404) {
            resolve({ error: 'SIRET non trouvé' });
          } else if (res.statusCode === 200) {
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
    
    if (result.error) {
      console.log(`❌ ${result.error}`);
      return;
    }
    
    // Afficher les résultats
    console.log('\n📋 Informations de l\'entreprise:');
    console.log('================================');
    
    const etablissement = result.etablissement;
    const uniteLegale = result.uniteLegale;
    
    console.log(`SIRET: ${etablissement.siret}`);
    console.log(`SIREN: ${etablissement.siren}`);
    console.log(`Raison sociale: ${uniteLegale.denominationUniteLegale || uniteLegale.denominationUsuelle1UniteLegale || 'Non disponible'}`);
    console.log(`Statut juridique: ${uniteLegale.libelleCategorieJuridiqueUniteLegale || 'Non disponible'}`);
    
    // Adresse
    const adresse = [];
    if (etablissement.numeroVoieEtablissement) adresse.push(etablissement.numeroVoieEtablissement);
    if (etablissement.typeVoieEtablissement) adresse.push(etablissement.typeVoieEtablissement);
    if (etablissement.libelleVoieEtablissement) adresse.push(etablissement.libelleVoieEtablissement);
    if (etablissement.codePostalEtablissement) adresse.push(etablissement.codePostalEtablissement);
    if (etablissement.libelleCommuneEtablissement) adresse.push(etablissement.libelleCommuneEtablissement);
    
    console.log(`Adresse: ${adresse.join(' ')}`);
    
    if (etablissement.libelleActivitePrincipaleEtablissement) {
      console.log(`Activité: ${etablissement.libelleActivitePrincipaleEtablissement}`);
    }
    
    if (uniteLegale.dateCreationUniteLegale) {
      console.log(`Date de création: ${uniteLegale.dateCreationUniteLegale}`);
    }
    
    console.log('\n✅ Vérification réussie !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Main
async function main() {
  const siret = process.argv[2] || DEFAULT_SIRET;
  
  console.log('🧪 Test de vérification SIRET avec l\'API INSEE');
  console.log('===============================================\n');
  
  if (!CONFIG.consumerKey || !CONFIG.consumerSecret) {
    console.log('❌ Configuration manquante:');
    console.log('   INSEE_CONSUMER_KEY et INSEE_CONSUMER_SECRET doivent être définis');
    console.log('   Ajoutez-les à votre fichier .env.local');
    process.exit(1);
  }
  
  await verifySiret(siret);
}

main().catch(console.error);
