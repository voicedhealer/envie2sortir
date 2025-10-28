#!/usr/bin/env node

/**
 * Script de test pour la vérification SIRET avec l'API INSEE
 * Usage: node scripts/test-siret-verification.js [SIRET]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env ou .env.local
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
          }
        }
      }
      console.log(`✅ Variables chargées depuis ${envFile}`);
      return true;
    }
  }
  
  return false;
}

// Charger les variables d'environnement
loadEnvFile();

// Configuration simplifiée (nouveau système API Key)
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_INSEE_API_URL || 'https://api.insee.fr/api-sirene/3.11',
  apiKey: process.env.INSEE_API_KEY || ''
};

// SIRET de test par défaut
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

async function verifySiret(siret) {
  try {
    console.log(`🔍 Vérification du SIRET: ${siret}`);
    
    // Validation du format (désactivée temporairement pour test API)
    // if (!validateSiretFormat(siret)) {
    //   console.log('❌ Format SIRET invalide');
    //   return;
    // }
    
    console.log('✅ Format SIRET valide (validation désactivée pour test API)');
    
    // Appel direct à l'API avec la clé API
    console.log('🌐 Appel à l\'API INSEE...');
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.insee.fr',
        port: 443,
        path: `/api-sirene/3.11/siret/${siret}`,
        method: 'GET',
      headers: {
        'X-INSEE-Api-Key-Integration': CONFIG.apiKey,  // ⚠️ NOM EXACT !
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
            console.log(`❌ Erreur HTTP ${res.statusCode}:`, data);
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
  
  if (!CONFIG.apiKey) {
    console.log('❌ Configuration manquante:');
    console.log('   INSEE_API_KEY doit être défini');
    console.log('   Obtenez votre clé API sur https://portail-api.insee.fr/');
    console.log('   Ajoutez-la à votre fichier .env');
    process.exit(1);
  }
  
  await verifySiret(siret);
}

main().catch(console.error);
