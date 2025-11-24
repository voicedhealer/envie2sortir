/**
 * Script de test pour vérifier la connexion à Supabase
 * 
 * Usage: npx tsx scripts/test-supabase-connection.ts
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
  console.log('⚠️  Aucun fichier .env trouvé, utilisation des variables système\n');
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Test de connexion Supabase...\n');

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl) {
  console.error('❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL n\'est pas définie dans .env.local');
  console.log('💡 Ajoutez: NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ ERREUR: NEXT_PUBLIC_SUPABASE_ANON_KEY n\'est pas définie dans .env.local');
  console.log('💡 Ajoutez: NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

console.log('✅ Variables d\'environnement trouvées:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Vérifier la connexion
async function testConnection() {
  console.log('📡 Test 1: Connexion à Supabase...');
  
  try {
    // Tester une requête simple (liste des tables)
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      // Si l'erreur est "relation does not exist" ou "table not found", c'est normal (tables pas encore créées)
      if (error.message.includes('does not exist') || 
          error.message.includes('not found') ||
          error.code === 'PGRST116' || 
          error.code === 'PGRST205') {
        console.log('⚠️  Les tables n\'existent pas encore (normal si migrations pas appliquées)');
        console.log('💡 Prochaine étape: Appliquez les migrations SQL dans Supabase Dashboard > SQL Editor');
        console.log('   Fichiers à exécuter dans l\'ordre:');
        console.log('   1. supabase/migrations/001_initial_schema.sql');
        console.log('   2. supabase/migrations/002_rls_policies.sql');
        console.log('   3. supabase/migrations/003_storage_setup.sql\n');
        return true;
      }
      
      console.error('❌ Erreur de connexion:', error.message);
      console.error('   Code:', error.code);
      return false;
    }
    
    console.log('✅ Connexion réussie !\n');
    return true;
  } catch (err: any) {
    console.error('❌ Erreur:', err.message);
    return false;
  }
}

// Test 2: Vérifier l'authentification
async function testAuth() {
  console.log('🔐 Test 2: Service d\'authentification...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur auth:', error.message);
      return false;
    }
    
    console.log('✅ Service d\'authentification accessible\n');
    return true;
  } catch (err: any) {
    console.error('❌ Erreur:', err.message);
    return false;
  }
}

// Test 3: Vérifier le storage
async function testStorage() {
  console.log('📦 Test 3: Service de stockage...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      // Si l'erreur est liée aux permissions, c'est normal
      if (error.message.includes('permission') || error.message.includes('JWT')) {
        console.log('⚠️  Permissions storage non configurées (normal si buckets pas créés)');
        console.log('💡 Créez les buckets via la migration 003_storage_setup.sql\n');
        return true;
      }
      
      console.error('❌ Erreur storage:', error.message);
      return false;
    }
    
    console.log(`✅ Service de stockage accessible (${data.length} buckets trouvés)\n`);
    return true;
  } catch (err: any) {
    console.error('❌ Erreur:', err.message);
    return false;
  }
}

// Exécuter tous les tests
async function runTests() {
  const results = {
    connection: await testConnection(),
    auth: await testAuth(),
    storage: await testStorage(),
  };
  
  console.log('📊 Résumé des tests:');
  console.log(`   Connexion: ${results.connection ? '✅' : '❌'}`);
  console.log(`   Auth: ${results.auth ? '✅' : '❌'}`);
  console.log(`   Storage: ${results.storage ? '✅' : '❌'}\n`);
  
  if (results.connection && results.auth) {
    console.log('🎉 Configuration Supabase valide !');
    console.log('💡 Prochaines étapes:');
    console.log('   1. Appliquer les migrations SQL dans Supabase Dashboard > SQL Editor');
    console.log('   2. Tester la création d\'un utilisateur');
    console.log('   3. Commencer la migration du code\n');
    return 0;
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez votre configuration.\n');
    return 1;
  }
}

// Exécuter
runTests().then(code => process.exit(code));

