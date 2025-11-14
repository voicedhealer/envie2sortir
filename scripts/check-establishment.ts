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
const professionalId = process.argv[2] || 'e26153ed-227b-4002-8725-ba4c58de9b01';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkEstablishment() {
  try {
    console.log(`🔍 Vérification de l'établissement pour professionalId: ${professionalId}\n`);
    
    // Vérifier le professionnel
    const { data: professional, error: proError } = await adminClient
      .from('professionals')
      .select('*')
      .eq('id', professionalId)
      .single();
    
    if (proError || !professional) {
      console.error('❌ Professionnel non trouvé:', proError?.message);
      process.exit(1);
    }
    
    console.log('✅ Professionnel trouvé:');
    console.log(`   Nom: ${professional.first_name} ${professional.last_name}`);
    console.log(`   Email: ${professional.email}`);
    console.log(`   SIRET: ${professional.siret}\n`);
    
    // Vérifier l'établissement
    const { data: establishment, error: estError } = await adminClient
      .from('establishments')
      .select('*')
      .eq('owner_id', professionalId)
      .maybeSingle();
    
    if (estError) {
      console.error('❌ Erreur lors de la recherche:', estError.message);
      process.exit(1);
    }
    
    if (establishment) {
      console.log('✅ Établissement trouvé:');
      console.log(`   ID: ${establishment.id}`);
      console.log(`   Nom: ${establishment.name}`);
      console.log(`   Slug: ${establishment.slug}`);
      console.log(`   Status: ${establishment.status}`);
      console.log(`   Owner ID: ${establishment.owner_id}`);
    } else {
      console.log('❌ Aucun établissement trouvé pour ce professionnel');
      console.log('\n📋 Établissements existants:');
      
      const { data: allEstablishments } = await adminClient
        .from('establishments')
        .select('id, name, owner_id')
        .limit(10);
      
      if (allEstablishments) {
        allEstablishments.forEach(est => {
          console.log(`   - ${est.name} (ID: ${est.id}, Owner: ${est.owner_id})`);
        });
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message || error);
    process.exit(1);
  }
}

checkEstablishment();

