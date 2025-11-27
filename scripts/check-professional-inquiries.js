/**
 * Script pour vérifier les demandes professionnelles dans Supabase
 * Usage: node scripts/check-professional-inquiries.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
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

async function checkInquiries() {
  console.log('🔍 Vérification des demandes professionnelles dans Supabase\n');
  console.log(`📡 URL: ${supabaseUrl}\n`);

  try {
    // Récupérer toutes les demandes
    const { data, error } = await supabase
      .from('professional_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erreur lors de la récupération:');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      return;
    }

    console.log(`✅ ${data.length} demande(s) trouvée(s)\n`);

    if (data.length === 0) {
      console.log('⚠️  Aucune demande trouvée dans la table professional_inquiries');
      console.log('\n💡 Vérifications:');
      console.log('   1. La table existe-t-elle dans Supabase?');
      console.log('   2. Les migrations ont-elles été appliquées?');
      console.log('   3. Avez-vous testé le formulaire?');
      return;
    }

    console.log('📋 Dernières demandes:\n');
    data.forEach((inquiry, index) => {
      console.log(`${index + 1}. ${inquiry.establishment_name}`);
      console.log(`   👤 ${inquiry.first_name} ${inquiry.last_name}`);
      console.log(`   📍 ${inquiry.city}`);
      console.log(`   📅 ${new Date(inquiry.created_at).toLocaleString('fr-FR')}`);
      if (inquiry.description) {
        console.log(`   📝 ${inquiry.description.substring(0, 50)}...`);
      }
      console.log(`   🆔 ${inquiry.id}`);
      console.log('');
    });

    console.log('✅ Les données sont bien présentes dans Supabase!');
    console.log('\n📋 Prochaine étape:');
    console.log('   Vérifiez que ces demandes apparaissent dans /admin/modifications (onglet "Demandes Pro")');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('   Message:', error.message);
  }
}

checkInquiries();

