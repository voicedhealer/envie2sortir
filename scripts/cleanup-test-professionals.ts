/**
 * Script pour nettoyer les comptes professionnels de test
 * Usage: npx tsx scripts/cleanup-test-professionals.ts
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERREUR: Variables Supabase manquantes');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupTestProfessionals() {
  try {
    console.log('🔍 Recherche des comptes professionnels de test...\n');

    // Rechercher les professionnels avec l'email de test
    const testEmails = [
      'maxime.garnier@testmail.com',
      'cavesabbaye@gmail.com'
    ];

    for (const email of testEmails) {
      console.log(`📧 Recherche de: ${email}`);
      
      // Chercher dans professionals
      const { data: professionals, error: proError } = await supabase
        .from('professionals')
        .select('id, email, first_name, last_name, created_at')
        .eq('email', email);

      if (proError) {
        console.error(`❌ Erreur lors de la recherche (professionals):`, proError);
        continue;
      }

      if (professionals && professionals.length > 0) {
        console.log(`   ✅ Trouvé ${professionals.length} professionnel(s)`);
        
        for (const prof of professionals) {
          console.log(`   📋 ID: ${prof.id}`);
          console.log(`   👤 Nom: ${prof.first_name} ${prof.last_name}`);
          console.log(`   📅 Créé le: ${prof.created_at}`);
          
          // Chercher les établissements associés
          const { data: establishments, error: estError } = await supabase
            .from('establishments')
            .select('id, name, slug')
            .eq('owner_id', prof.id);

          if (estError) {
            console.error(`   ❌ Erreur lors de la recherche d'établissements:`, estError);
          } else if (establishments && establishments.length > 0) {
            console.log(`   🏢 Établissements associés: ${establishments.length}`);
            establishments.forEach(est => {
              console.log(`      - ${est.name} (${est.slug})`);
            });
          }

          // Demander confirmation avant suppression
          console.log(`\n   ⚠️  Voulez-vous supprimer ce compte ?`);
          console.log(`   💡 Pour supprimer, utilisez le script avec --delete`);
        }
      } else {
        console.log(`   ℹ️  Aucun professionnel trouvé`);
      }

      // Chercher dans auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers) {
        const matchingAuthUser = authUsers.users.find(u => u.email === email);
        if (matchingAuthUser) {
          console.log(`   🔐 Compte Auth trouvé: ${matchingAuthUser.id}`);
          console.log(`   📅 Créé le: ${matchingAuthUser.created_at}`);
        }
      }
      
      console.log('');
    }

    console.log('✅ Recherche terminée');
    console.log('\n💡 Pour supprimer ces comptes, utilisez:');
    console.log('   npx tsx scripts/cleanup-test-professionals.ts --delete');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

async function deleteTestProfessionals() {
  try {
    console.log('🗑️  Suppression des comptes de test...\n');

    const testEmails = [
      'maxime.garnier@testmail.com',
      'cavesabbaye@gmail.com'
    ];

    for (const email of testEmails) {
      console.log(`📧 Traitement de: ${email}`);
      
      // 1. Chercher le professionnel
      const { data: professionals, error: proError } = await supabase
        .from('professionals')
        .select('id')
        .eq('email', email);

      if (proError) {
        console.error(`   ❌ Erreur:`, proError);
        continue;
      }

      if (!professionals || professionals.length === 0) {
        console.log(`   ℹ️  Aucun professionnel trouvé`);
        continue;
      }

      for (const prof of professionals) {
        console.log(`   🗑️  Suppression du professionnel ${prof.id}...`);

        // 2. Supprimer les établissements associés
        const { data: establishments } = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', prof.id);

        if (establishments && establishments.length > 0) {
          for (const est of establishments) {
            console.log(`      🗑️  Suppression de l'établissement ${est.id}...`);
            await supabase.from('establishments').delete().eq('id', est.id);
          }
        }

        // 3. Supprimer le professionnel
        await supabase.from('professionals').delete().eq('id', prof.id);

        // 4. Supprimer le compte Auth
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const matchingAuthUser = authUsers?.users.find(u => u.email === email);
        
        if (matchingAuthUser) {
          console.log(`      🗑️  Suppression du compte Auth ${matchingAuthUser.id}...`);
          await supabase.auth.admin.deleteUser(matchingAuthUser.id);
        }

        console.log(`   ✅ Compte supprimé avec succès\n`);
      }
    }

    console.log('✅ Nettoyage terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
const shouldDelete = process.argv.includes('--delete');

if (shouldDelete) {
  deleteTestProfessionals();
} else {
  cleanupTestProfessionals();
}

