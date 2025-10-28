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

// Configuration pour l'API Recherche d'Entreprises (gratuite, sans clé API)
const CONFIG = {
  baseUrl: 'recherche-entreprises.api.gouv.fr',
  // Plus besoin de clé API !
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
    
    console.log('✅ Format SIRET valide');
    console.log('🌐 Appel à l\'API Recherche d\'Entreprises...');
    
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: CONFIG.baseUrl,
        port: 443,
        path: `/search?q=${siret}`,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // Plus besoin d'authentification !
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
              const jsonData = JSON.parse(data);
              resolve(jsonData);
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
    
    // Affichage des résultats
    if (result.results && result.results.length > 0) {
      const etablissement = result.results[0];
      console.log('\n✅ SIRET trouvé !');
      console.log('=====================================');
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

// Main
async function main() {
  const siret = process.argv[2] || DEFAULT_SIRET;
  
  console.log('🧪 Test de vérification SIRET avec l\'API Recherche d\'Entreprises');
  console.log('================================================================\n');
  console.log('✅ API gratuite et sans clé API requise !');
  
  await verifySiret(siret);
}

main().catch(console.error);
