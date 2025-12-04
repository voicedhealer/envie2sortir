/**
 * Script pour générer des données de test massives pour les analytics
 * Usage: npx tsx scripts/generate-massive-analytics-data.ts <establishmentId>
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
  console.error('❌ Usage: npx tsx scripts/generate-massive-analytics-data.ts <establishmentId>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Générer un user agent aléatoire
function randomUserAgent(): string {
  const browsers = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0',
  ];
  return browsers[Math.floor(Math.random() * browsers.length)];
}

// Générer un referrer aléatoire
function randomReferrer(): string {
  const referrers = [
    'https://www.google.com',
    'https://www.google.fr',
    'https://www.facebook.com',
    'https://www.instagram.com',
    'https://direct',
    '',
  ];
  return referrers[Math.floor(Math.random() * referrers.length)];
}

async function generateMassiveData() {
  console.log(`🚀 Génération de données massives pour l'établissement: ${establishmentId}`);
  console.log('📊 Génération de 200 visiteurs avec interactions variées...\n');

  const now = new Date();
  const testData: any[] = [];

  // Définir les éléments à tracker
  const elements = [
    // Actions rapides
    { type: 'button', id: 'directions', name: 'Itinéraire', context: 'actions_rapides' },
    { type: 'button', id: 'menu', name: 'Consulter le menu', context: 'actions_rapides' },
    { type: 'button', id: 'contact', name: 'Contacter', context: 'actions_rapides' },
    { type: 'button', id: 'favorite', name: 'Ajouter aux favoris', context: 'actions_rapides' },
    { type: 'button', id: 'share', name: 'Partager', context: 'actions_rapides' },
    { type: 'button', id: 'review', name: 'Laisser un avis', context: 'actions_rapides' },
    
    // Contacts
    { type: 'contact', id: 'phone-dropdown', name: 'Appeler', context: 'actions_rapides' },
    { type: 'contact', id: 'whatsapp', name: 'WhatsApp', context: 'actions_rapides' },
    { type: 'contact', id: 'messenger', name: 'Messenger', context: 'actions_rapides' },
    { type: 'contact', id: 'email', name: 'Email', context: 'actions_rapides' },
    
    // Sections
    { type: 'section', id: 'horaires', name: 'Horaires', context: 'sections', action: 'open' },
    { type: 'section', id: 'contact', name: 'Contact', context: 'sections', action: 'open' },
    { type: 'section', id: 'avis', name: 'Avis', context: 'sections', action: 'open' },
    { type: 'section', id: 'photos', name: 'Photos', context: 'sections', action: 'open' },
    { type: 'section', id: 'evenements', name: 'Événements', context: 'sections', action: 'open' },
    
    // Liens
    { type: 'link', id: 'instagram', name: 'Instagram', context: 'info' },
    { type: 'link', id: 'facebook', name: 'Facebook', context: 'info' },
    { type: 'link', id: 'website', name: 'Site web', context: 'info' },
  ];

  // Générer des données pour les 30 derniers jours
  for (let day = 0; day < 30; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
    
    // Générer entre 5 et 15 visiteurs par jour
    const visitorsPerDay = Math.floor(Math.random() * 11) + 5;
    
    for (let visitor = 0; visitor < visitorsPerDay; visitor++) {
      const userAgent = randomUserAgent();
      const referrer = randomReferrer();
      
      // Chaque visiteur fait entre 2 et 8 interactions
      const interactionsPerVisitor = Math.floor(Math.random() * 7) + 2;
      
      for (let interaction = 0; interaction < interactionsPerVisitor; interaction++) {
        // Sélectionner un élément aléatoire
        const element = elements[Math.floor(Math.random() * elements.length)];
        
        // Générer une heure aléatoire dans la journée (8h-23h)
        const hour = Math.floor(Math.random() * 16) + 8;
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, second, 0);
        
        testData.push({
          establishment_id: establishmentId,
          element_type: element.type,
          element_id: element.id,
          element_name: element.name,
          action: element.action || 'click',
          section_context: element.context,
          user_agent: userAgent,
          referrer: referrer,
          timestamp: timestamp.toISOString(),
        });
      }
    }
  }

  console.log(`📦 ${testData.length} interactions générées`);
  console.log(`👥 Environ ${Math.ceil(testData.length / 5)} visiteurs uniques estimés`);
  console.log(`📅 Données sur ${30} jours\n`);

  // Insérer par lots de 100 pour éviter les timeouts
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < testData.length; i += batchSize) {
    const batch = testData.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('click_analytics')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Erreur lors de l'insertion du lot ${Math.floor(i / batchSize) + 1}:`, error);
      continue;
    }

    inserted += data?.length || 0;
    const progress = Math.round((inserted / testData.length) * 100);
    process.stdout.write(`\r📊 Progression: ${inserted}/${testData.length} (${progress}%)`);
  }

  console.log(`\n\n✅ ${inserted} enregistrements insérés avec succès`);

  // Statistiques par type
  const statsByType = new Map<string, number>();
  testData.forEach(item => {
    const count = statsByType.get(item.element_type) || 0;
    statsByType.set(item.element_type, count + 1);
  });

  console.log('\n📊 Répartition par type:');
  Array.from(statsByType.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} interactions`);
    });

  // Statistiques des sections
  const sections = testData.filter(d => d.element_type === 'section' && d.action === 'open');
  const sectionStats = new Map<string, number>();
  sections.forEach(item => {
    const count = sectionStats.get(item.element_name) || 0;
    sectionStats.set(item.element_name, count + 1);
  });

  console.log('\n📋 Sections les plus consultées:');
  Array.from(sectionStats.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([section, count]) => {
      console.log(`  ${section}: ${count} ouvertures`);
    });

  // Vérifier les données
  const { count, error: countError } = await supabase
    .from('click_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('establishment_id', establishmentId);

  if (!countError) {
    console.log(`\n✅ Total d'enregistrements pour cet établissement: ${count || 0}`);
  }
}

generateMassiveData()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    console.log('💡 Rafraîchissez le dashboard Analytics pour voir les nouvelles données !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });







