/**
 * Script de test pour insérer des données de tracking dans click_analytics
 * Usage: npx tsx scripts/test-analytics-tracking.ts <establishmentId>
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  if (!supabaseUrl) {
    console.error('  - NEXT_PUBLIC_SUPABASE_URL est manquante');
  }
  if (!supabaseServiceKey) {
    console.error('  - SUPABASE_SERVICE_ROLE_KEY est manquante');
  }
  console.error('\n💡 Assurez-vous que le fichier .env contient ces variables');
  process.exit(1);
}

const establishmentId = process.argv[2];

if (!establishmentId) {
  console.error('❌ Usage: npx tsx scripts/test-analytics-tracking.ts <establishmentId>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertTestData() {
  console.log(`🔍 Insertion de données de test pour l'établissement: ${establishmentId}`);

  const now = new Date();
  const testData = [
    // Actions rapides
    {
      establishment_id: establishmentId,
      element_type: 'button',
      element_id: 'directions',
      element_name: 'Itinéraire',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
    },
    {
      establishment_id: establishmentId,
      element_type: 'button',
      element_id: 'menu',
      element_name: 'Consulter le menu',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
    },
    {
      establishment_id: establishmentId,
      element_type: 'button',
      element_id: 'contact',
      element_name: 'Contacter',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // Il y a 5 heures
    },
    {
      establishment_id: establishmentId,
      element_type: 'contact',
      element_id: 'phone-dropdown',
      element_name: 'Appeler',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // Il y a 3 heures
    },
    {
      establishment_id: establishmentId,
      element_type: 'contact',
      element_id: 'whatsapp',
      element_name: 'WhatsApp',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1 heure
    },
    {
      establishment_id: establishmentId,
      element_type: 'button',
      element_id: 'favorite',
      element_name: 'Ajouter aux favoris',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // Il y a 30 minutes
    },
    {
      establishment_id: establishmentId,
      element_type: 'button',
      element_id: 'share',
      element_name: 'Partager',
      action: 'click',
      section_context: 'actions_rapides',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // Il y a 15 minutes
    },
    // Sections
    {
      establishment_id: establishmentId,
      element_type: 'section',
      element_id: 'horaires',
      element_name: 'Horaires',
      action: 'open',
      section_context: 'sections',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // Il y a 10 minutes
    },
    {
      establishment_id: establishmentId,
      element_type: 'section',
      element_id: 'contact',
      element_name: 'Contact',
      action: 'open',
      section_context: 'sections',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // Il y a 5 minutes
    },
    // Liens
    {
      establishment_id: establishmentId,
      element_type: 'link',
      element_id: 'instagram',
      element_name: 'Instagram',
      action: 'click',
      section_context: 'info',
      user_agent: 'Mozilla/5.0 (test)',
      referrer: 'https://example.com',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // Il y a 2 minutes
    },
  ];

  // Insérer les données
  const { data, error } = await supabase
    .from('click_analytics')
    .insert(testData)
    .select();

  if (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
    process.exit(1);
  }

  console.log(`✅ ${data.length} enregistrements insérés avec succès`);
  console.log('\n📊 Données insérées:');
  data.forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.element_name} (${record.element_type}) - ${new Date(record.timestamp).toLocaleString('fr-FR')}`);
  });

  // Vérifier les données
  const { count, error: countError } = await supabase
    .from('click_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('establishment_id', establishmentId);

  if (!countError) {
    console.log(`\n✅ Total d'enregistrements pour cet établissement: ${count || 0}`);
  } else {
    console.error('⚠️ Erreur lors du comptage:', countError);
  }
}

insertTestData()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

