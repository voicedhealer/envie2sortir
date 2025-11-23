/**
 * Script pour définir le rôle admin dans les métadonnées JWT Supabase
 * 
 * Usage:
 *   npx tsx scripts/set-admin-role.ts <email>
 * 
 * Exemple:
 *   npx tsx scripts/set-admin-role.ts envie2sortir.fr@gmail.com
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: npx tsx scripts/set-admin-role.ts <email>');
  console.error('   Exemple: npx tsx scripts/set-admin-role.ts envie2sortir.fr@gmail.com');
  process.exit(1);
}

async function setAdminRole() {
  try {
    console.log(`🔧 Configuration du rôle admin pour: ${email}`);
    
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Récupérer l'utilisateur par email
    console.log('📋 Récupération de l\'utilisateur...');
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError);
      process.exit(1);
    }

    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      console.error(`❌ Utilisateur avec l'email ${email} non trouvé`);
      console.log('📋 Utilisateurs disponibles:');
      users.slice(0, 10).forEach(u => {
        console.log(`   - ${u.email} (${u.id})`);
      });
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${targetUser.email} (${targetUser.id})`);
    console.log(`   Rôle actuel dans app_metadata: ${targetUser.app_metadata?.role || 'non défini'}`);

    // Mettre à jour app_metadata avec le rôle admin
    console.log('🔧 Mise à jour du rôle admin dans app_metadata...');
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      {
        app_metadata: {
          ...targetUser.app_metadata,
          role: 'admin'
        }
      }
    );

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du rôle:', updateError);
      process.exit(1);
    }

    console.log(`✅ Rôle admin défini avec succès dans app_metadata`);
    console.log(`   Nouveau rôle: ${updatedUser.user.app_metadata?.role}`);

    // Mettre à jour aussi la table users pour cohérence
    console.log('🔧 Mise à jour de la table users...');
    const { createClient: createClientNormal } = await import('@supabase/supabase-js');
    const normalClient = createClientNormal(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    const { error: tableUpdateError } = await normalClient
      .from('users')
      .update({ role: 'admin' })
      .eq('id', targetUser.id);

    if (tableUpdateError) {
      console.warn('⚠️  Erreur lors de la mise à jour de la table users:', tableUpdateError.message);
      console.warn('   (Ce n\'est pas critique, app_metadata est la source de vérité)');
    } else {
      console.log('✅ Table users mise à jour avec succès');
    }

    console.log('\n✅ Configuration terminée !');
    console.log(`   L'utilisateur ${email} a maintenant le rôle admin.`);
    console.log('   Vous devez vous déconnecter et vous reconnecter pour que les changements prennent effet.');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setAdminRole();

