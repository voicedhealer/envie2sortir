/**
 * Script pour vérifier si un utilisateur existe dans auth.users
 */

import { createClient } from '@supabase/supabase-js';

async function checkUserAuth(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables manquantes. Vérifiez .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`🔍 Vérification: ${email}\n`);

  // Vérifier dans auth.users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users.find(u => u.email === email);
  
  if (authUser) {
    console.log('✅ Trouvé dans auth.users');
    console.log(`   Email confirmé: ${authUser.email_confirmed_at ? 'Oui' : 'Non'}`);
  } else {
    console.log('❌ NON trouvé dans auth.users');
  }

  // Vérifier dans users
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userData) {
    console.log('✅ Trouvé dans users');
    if (!authUser) {
      console.log('⚠️  Existe dans users mais PAS dans auth.users');
      console.log('   → Il faut créer un compte via /auth');
    }
  } else {
    console.log('❌ NON trouvé dans users');
  }
}

const email = process.argv[2] || 'vivien.bernardot@gmail.com';
checkUserAuth(email);
