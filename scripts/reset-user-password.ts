/**
 * Script pour réinitialiser le mot de passe d'un utilisateur dans Supabase
 * Usage: tsx scripts/reset-user-password.ts <email> <nouveau-mot-de-passe>
 */

import { createClient } from '@supabase/supabase-js';

async function resetPassword(email: string, newPassword: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables manquantes. Vérifiez .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`🔐 Réinitialisation du mot de passe pour: ${email}\n`);

  // Trouver l'utilisateur
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users.find(u => u.email === email);

  if (!authUser) {
    console.error(`❌ Utilisateur ${email} non trouvé dans auth.users`);
    process.exit(1);
  }

  console.log(`✅ Utilisateur trouvé: ${authUser.id}`);
  console.log(`   Email confirmé: ${authUser.email_confirmed_at ? 'Oui' : 'Non'}\n`);

  // Réinitialiser le mot de passe
  const { data, error } = await supabase.auth.admin.updateUserById(
    authUser.id,
    {
      password: newPassword,
      email_confirm: true // Confirmer l'email en même temps
    }
  );

  if (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }

  console.log('✅ Mot de passe réinitialisé avec succès!');
  console.log(`   Vous pouvez maintenant vous connecter avec le nouveau mot de passe.\n`);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: tsx scripts/reset-user-password.ts <email> <nouveau-mot-de-passe>');
  console.error('Exemple: tsx scripts/reset-user-password.ts vivien.bernardot@gmail.com MonNouveauMotDePasse123');
  process.exit(1);
}

if (password.length < 6) {
  console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
  process.exit(1);
}

resetPassword(email, password);

