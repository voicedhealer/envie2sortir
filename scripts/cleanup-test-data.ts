/**
 * Script pour nettoyer les données de test dans Supabase
 * 
 * Usage: npx tsx scripts/cleanup-test-data.ts
 * 
 * ⚠️ ATTENTION : Ce script supprime des données !
 * Il est conçu pour nettoyer uniquement les données de test
 * 
 * Ce qui est supprimé :
 * - Utilisateurs avec email contenant "test" ou "demo"
 * - Établissements de test
 * - Tags et images associés
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const result = config({ path: resolve(process.cwd(), file) });
  if (!result.error) {
    console.log(`📄 Variables chargées depuis ${file}\n`);
    break;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL manquante');
  console.error('   Ajoutez-la dans .env.local ou .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ ERREUR: SUPABASE_SERVICE_ROLE_KEY manquante');
  console.error('');
  console.error('💡 Pour trouver cette clé :');
  console.error('   1. Aller sur https://supabase.com/dashboard');
  console.error('   2. Sélectionner votre projet');
  console.error('   3. Settings > API');
  console.error('   4. Section "service_role" (⚠️ gardez-la secrète !)');
  console.error('');
  console.error('   Ajoutez-la dans .env.local :');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Nettoie les utilisateurs de test
 */
async function cleanupTestUsers() {
  console.log('🧹 Nettoyage des utilisateurs de test...');
  
  // Trouver les utilisateurs de test
  const { data: testUsers, error: findError } = await supabase
    .from('users')
    .select('id, email')
    .or('email.ilike.%test%,email.ilike.%demo%,email.ilike.%example.com%');
  
  if (findError) {
    console.error('   ❌ Erreur lors de la recherche:', findError.message);
    return;
  }
  
  if (!testUsers || testUsers.length === 0) {
    console.log('   ✅ Aucun utilisateur de test trouvé\n');
    return;
  }
  
  console.log(`   📋 ${testUsers.length} utilisateur(s) de test trouvé(s)`);
  testUsers.forEach(user => {
    console.log(`      - ${user.email} (${user.id})`);
  });
  
  // Supprimer les utilisateurs de test
  const userIds = testUsers.map(u => u.id);
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .in('id', userIds);
  
  if (deleteError) {
    console.error('   ❌ Erreur lors de la suppression:', deleteError.message);
  } else {
    console.log(`   ✅ ${testUsers.length} utilisateur(s) de test supprimé(s)\n`);
  }
}

/**
 * Nettoie les professionnels de test
 */
async function cleanupTestProfessionals() {
  console.log('🧹 Nettoyage des professionnels de test...');
  
  const { data: testPros, error: findError } = await supabase
    .from('professionals')
    .select('id, email, company_name')
    .or('email.ilike.%test%,email.ilike.%demo%,email.ilike.%example.com%,company_name.ilike.%test%');
  
  if (findError) {
    console.error('   ❌ Erreur lors de la recherche:', findError.message);
    return;
  }
  
  if (!testPros || testPros.length === 0) {
    console.log('   ✅ Aucun professionnel de test trouvé\n');
    return;
  }
  
  console.log(`   📋 ${testPros.length} professionnel(s) de test trouvé(s)`);
  testPros.forEach(pro => {
    console.log(`      - ${pro.email} (${pro.company_name})`);
  });
  
  const proIds = testPros.map(p => p.id);
  const { error: deleteError } = await supabase
    .from('professionals')
    .delete()
    .in('id', proIds);
  
  if (deleteError) {
    console.error('   ❌ Erreur lors de la suppression:', deleteError.message);
  } else {
    console.log(`   ✅ ${testPros.length} professionnel(s) de test supprimé(s)\n`);
  }
  
  return proIds;
}

/**
 * Nettoie les établissements de test
 */
async function cleanupTestEstablishments() {
  console.log('🧹 Nettoyage des établissements de test...');
  
  const { data: testEsts, error: findError } = await supabase
    .from('establishments')
    .select('id, name, slug')
    .or('name.ilike.%test%,name.ilike.%demo%,slug.ilike.%test%,slug.ilike.%demo%');
  
  if (findError) {
    console.error('   ❌ Erreur lors de la recherche:', findError.message);
    return;
  }
  
  if (!testEsts || testEsts.length === 0) {
    console.log('   ✅ Aucun établissement de test trouvé\n');
    return [];
  }
  
  console.log(`   📋 ${testEsts.length} établissement(s) de test trouvé(s)`);
  testEsts.forEach(est => {
    console.log(`      - ${est.name} (${est.slug})`);
  });
  
  const estIds = testEsts.map(e => e.id);
  
  // Supprimer les données associées d'abord
  await supabase.from('etablissement_tags').delete().in('etablissement_id', estIds);
  await supabase.from('images').delete().in('establishment_id', estIds);
  
  // Puis supprimer les établissements
  const { error: deleteError } = await supabase
    .from('establishments')
    .delete()
    .in('id', estIds);
  
  if (deleteError) {
    console.error('   ❌ Erreur lors de la suppression:', deleteError.message);
  } else {
    console.log(`   ✅ ${testEsts.length} établissement(s) de test supprimé(s)\n`);
  }
  
  return estIds;
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧹 Nettoyage des données de test dans Supabase\n');
  console.log('⚠️  ATTENTION: Ce script va supprimer des données !');
  console.log('   Il ne supprime que les données de test (test, demo, example.com)\n');
  
  // Demander confirmation (en mode interactif)
  if (process.env.CI !== 'true') {
    console.log('💡 Pour exécuter sans confirmation, utilisez:');
    console.log('   CI=true npx tsx scripts/cleanup-test-data.ts\n');
  }
  
  try {
    await cleanupTestUsers();
    await cleanupTestProfessionals();
    await cleanupTestEstablishments();
    
    console.log('✅ Nettoyage terminé !');
    console.log('\n💡 Vérifiez dans Supabase Dashboard > Table Editor que les données de test ont été supprimées');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

main();

