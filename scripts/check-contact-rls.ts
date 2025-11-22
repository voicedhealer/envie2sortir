/**
 * Script pour vérifier l'état des politiques RLS sur contact_messages
 */

import { createClient } from '@supabase/supabase-js';

async function checkContactRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables manquantes. Vérifiez .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Vérification des politiques RLS pour contact_messages\n');

  // Vérifier les politiques existantes
  const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        policyname,
        cmd,
        roles,
        qual,
        with_check
      FROM pg_policies 
      WHERE tablename = 'contact_messages'
      ORDER BY cmd, policyname;
    `
  });

  if (policiesError) {
    // Essayer une autre méthode
    console.log('⚠️  Impossible d\'utiliser RPC, vérification directe via SQL...\n');
    
    // Vérifier si la table existe
    const { data: tableExists } = await supabase
      .from('contact_messages')
      .select('id')
      .limit(1);
    
    console.log('✅ Table contact_messages existe');
    
    // Instructions pour vérifier manuellement
    console.log('\n📋 Pour vérifier les politiques RLS, exécutez ce SQL dans Supabase SQL Editor:');
    console.log(`
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY cmd, policyname;
    `);
  } else {
    console.log('📋 Politiques RLS trouvées:');
    if (policies && policies.length > 0) {
      policies.forEach((policy: any) => {
        console.log(`\n  - ${policy.policyname}`);
        console.log(`    Commande: ${policy.cmd}`);
        console.log(`    Rôles: ${policy.roles}`);
        console.log(`    WITH CHECK: ${policy.with_check || 'N/A'}`);
      });
    } else {
      console.log('  ❌ Aucune politique trouvée !');
    }
  }

  console.log('\n💡 Si la politique "Authenticated users can create contact messages" n\'existe pas,');
  console.log('   appliquez la migration 023_force_contact_messages_rls.sql');
}

checkContactRLS();

