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
const email = process.argv[2] || 'maxime.garnier@testmail.com';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyUserEmail() {
  try {
    console.log(`🔍 Recherche de l'utilisateur: ${email}\n`);
    
    // Récupérer tous les utilisateurs
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError);
      process.exit(1);
    }
    
    // Trouver l'utilisateur par email
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      console.log('\n📋 Utilisateurs disponibles:');
      users.slice(0, 10).forEach(u => {
        console.log(`   - ${u.email} (${u.email_confirmed_at ? '✅ vérifié' : '❌ non vérifié'})`);
      });
      if (users.length > 10) {
        console.log(`   ... et ${users.length - 10} autres`);
      }
      process.exit(1);
    }
    
    console.log('📧 Informations utilisateur:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Créé le: ${user.created_at}`);
    console.log(`   Email vérifié: ${user.email_confirmed_at ? '✅ Oui' : '❌ Non'}`);
    
    if (user.email_confirmed_at) {
      console.log('\n✅ L\'email est déjà vérifié!');
      return;
    }
    
    console.log('\n🔄 Vérification de l\'email...');
    
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    
    if (updateError) {
      console.error('❌ Erreur lors de la vérification:', updateError.message);
      process.exit(1);
    }
    
    console.log('✅ Email vérifié avec succès!');
    console.log(`\n📧 L'utilisateur ${email} peut maintenant se connecter.`);
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message || error);
    process.exit(1);
  }
}

verifyUserEmail();

