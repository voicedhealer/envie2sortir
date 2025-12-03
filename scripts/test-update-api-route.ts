/**
 * Script de test pour vérifier que l'API de mise à jour fonctionne correctement
 * Ce script simule une approbation de modification de nom d'entreprise
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

async function testCompanyNameUpdate() {
  console.log('🧪 Début du test de mise à jour du nom d\'entreprise\n');

  try {
    // 1. Trouver une demande de modification approuvée récemment
    console.log('📋 Étape 1 : Recherche d\'une demande de modification approuvée...');
    const { data: updateRequest, error: requestError } = await adminClient
      .from('professional_update_requests')
      .select(`
        *,
        professional:professionals!professional_update_requests_professional_id_fkey (
          id,
          company_name,
          email
        )
      `)
      .eq('field_name', 'companyName')
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false })
      .limit(1)
      .single();

    if (requestError || !updateRequest) {
      console.error('❌ Aucune demande trouvée:', requestError);
      return;
    }

    console.log('✅ Demande trouvée:');
    console.log('   - ID:', updateRequest.id);
    console.log('   - Ancienne valeur:', updateRequest.old_value);
    console.log('   - Nouvelle valeur:', updateRequest.new_value);
    console.log('   - Professional ID:', updateRequest.professional_id);
    console.log('   - Status:', updateRequest.status);
    console.log('');

    const professionalId = updateRequest.professional_id;
    const newCompanyName = updateRequest.new_value;

    // 2. Vérifier l'état actuel du professionnel
    console.log('📋 Étape 2 : Vérification de l\'état actuel du professionnel...');
    const { data: professional, error: proError } = await adminClient
      .from('professionals')
      .select('id, company_name')
      .eq('id', professionalId)
      .single();

    if (proError || !professional) {
      console.error('❌ Erreur récupération professionnel:', proError);
      return;
    }

    console.log('✅ Professionnel trouvé:');
    console.log('   - ID:', professional.id);
    console.log('   - Company name actuel:', professional.company_name);
    console.log('   - Company name attendu:', newCompanyName);
    console.log('   - Correspond:', professional.company_name === newCompanyName ? '✅ OUI' : '❌ NON');
    console.log('');

    // 3. Vérifier l'état actuel de l'établissement
    console.log('📋 Étape 3 : Vérification de l\'état actuel de l\'établissement...');
    const { data: establishment, error: estError } = await adminClient
      .from('establishments')
      .select('id, name, owner_id')
      .eq('owner_id', professionalId)
      .single();

    if (estError) {
      console.error('❌ Erreur récupération établissement:', estError);
      console.log('   - Message:', estError.message);
      console.log('   - Code:', estError.code);
      console.log('   - Détails:', estError.details);
      console.log('   - Hint:', estError.hint);
      return;
    }

    if (!establishment) {
      console.warn('⚠️ Aucun établissement trouvé pour ce professionnel');
      return;
    }

    console.log('✅ Établissement trouvé:');
    console.log('   - ID:', establishment.id);
    console.log('   - Name actuel:', establishment.name);
    console.log('   - Name attendu:', newCompanyName);
    console.log('   - Owner ID:', establishment.owner_id);
    console.log('   - Correspond:', establishment.name === newCompanyName ? '✅ OUI' : '❌ NON');
    console.log('');

    // 4. Test de mise à jour si nécessaire
    if (professional.company_name !== newCompanyName || establishment.name !== newCompanyName) {
      console.log('📋 Étape 4 : Correction nécessaire, test de mise à jour...');
      
      // Mettre à jour le professionnel
      const { error: updateProError } = await adminClient
        .from('professionals')
        .update({ company_name: newCompanyName })
        .eq('id', professionalId);

      if (updateProError) {
        console.error('❌ Erreur mise à jour professionnel:', updateProError);
        return;
      }
      console.log('✅ Professionnel mis à jour');

      // Mettre à jour l'établissement
      const { error: updateEstError } = await adminClient
        .from('establishments')
        .update({ name: newCompanyName })
        .eq('id', establishment.id);

      if (updateEstError) {
        console.error('❌ Erreur mise à jour établissement:', updateEstError);
        console.log('   - Message:', updateEstError.message);
        console.log('   - Code:', updateEstError.code);
        console.log('   - Détails:', updateEstError.details);
        return;
      }
      console.log('✅ Établissement mis à jour');
      console.log('');

      // 5. Vérification finale
      console.log('📋 Étape 5 : Vérification finale...');
      const { data: finalPro } = await adminClient
        .from('professionals')
        .select('company_name')
        .eq('id', professionalId)
        .single();

      const { data: finalEst } = await adminClient
        .from('establishments')
        .select('name')
        .eq('id', establishment.id)
        .single();

      console.log('✅ Vérification finale:');
      console.log('   - Professional company_name:', finalPro?.company_name);
      console.log('   - Establishment name:', finalEst?.name);
      console.log('   - Les deux correspondent:', finalPro?.company_name === finalEst?.name ? '✅ OUI' : '❌ NON');
    } else {
      console.log('✅ Tout est déjà à jour !');
    }

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testCompanyNameUpdate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

