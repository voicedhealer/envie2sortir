#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables manquantes');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkStatus() {
  const slug = process.argv[2] || 'caves-de-labbaye';
  
  const { data, error } = await adminClient
    .from('establishments')
    .select('id, name, slug, status, owner_id')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    console.error('❌ Établissement non trouvé:', slug);
    return;
  }
  
  console.log('\n📋 Établissement:', data.name);
  console.log('🔗 Slug:', data.slug);
  console.log('📊 Status:', data.status);
  console.log('👤 Owner ID:', data.owner_id);
  
  if (data.status !== 'approved') {
    console.log('\n⚠️  L\'établissement n\'est PAS approuvé !');
    console.log('💡 Changeons le statut en "approved"...\n');
    
    const { error: updateError } = await adminClient
      .from('establishments')
      .update({ status: 'approved' })
      .eq('id', data.id);
    
    if (updateError) {
      console.error('❌ Erreur:', updateError.message);
    } else {
      console.log('✅ Établissement approuvé avec succès !');
    }
  } else {
    console.log('\n✅ L\'établissement est déjà approuvé');
  }
}

checkStatus();

