#!/usr/bin/env node

/**
 * Script pour vérifier les statuts des établissements dans la base de données
 */

const { createClient } = require('@supabase/supabase-js');

async function checkEstablishmentsStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('🔍 Vérification des établissements...\n');

  // Récupérer tous les établissements
  const { data: establishments, error } = await supabase
    .from('establishments')
    .select('id, name, status, created_at, owner_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!establishments || establishments.length === 0) {
    console.log('⚠️  Aucun établissement trouvé');
    return;
  }

  console.log(`📊 Total: ${establishments.length} établissement(s)\n`);

  // Compter par statut
  const stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    other: 0
  };

  establishments.forEach(est => {
    if (stats[est.status] !== undefined) {
      stats[est.status]++;
    } else {
      stats.other++;
    }
  });

  console.log('📈 Statistiques:');
  console.log(`  ⏳ En attente: ${stats.pending}`);
  console.log(`  ✅ Approuvés:  ${stats.approved}`);
  console.log(`  ❌ Rejetés:    ${stats.rejected}`);
  if (stats.other > 0) {
    console.log(`  ❓ Autres:     ${stats.other}`);
  }
  console.log('');

  console.log('📋 Détails des établissements:');
  console.log('─'.repeat(100));
  establishments.forEach((est, index) => {
    const statusIcon = 
      est.status === 'pending' ? '⏳' :
      est.status === 'approved' ? '✅' :
      est.status === 'rejected' ? '❌' : '❓';
    
    console.log(`${index + 1}. ${statusIcon} ${est.name}`);
    console.log(`   Statut: ${est.status}`);
    console.log(`   ID: ${est.id}`);
    console.log(`   Owner ID: ${est.owner_id}`);
    console.log(`   Créé le: ${new Date(est.created_at).toLocaleString('fr-FR')}`);
    console.log('');
  });
}

checkEstablishmentsStatus().catch(console.error);

