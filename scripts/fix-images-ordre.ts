#!/usr/bin/env tsx
/**
 * Script pour corriger l'ordre des images existantes
 * Met à jour le champ 'ordre' de toutes les images pour qu'elles soient numérotées séquentiellement
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixImagesOrdre() {
  console.log('🔧 Correction de l\'ordre des images...\n');
  
  try {
    // Récupérer tous les établissements
    const { data: establishments, error: establishmentsError } = await adminClient
      .from('establishments')
      .select('id, name');
    
    if (establishmentsError) {
      throw establishmentsError;
    }
    
    if (!establishments || establishments.length === 0) {
      console.log('ℹ️  Aucun établissement trouvé');
      return;
    }
    
    console.log(`📋 ${establishments.length} établissements trouvés\n`);
    
    let totalImagesFixed = 0;
    
    // Pour chaque établissement
    for (const establishment of establishments) {
      console.log(`🏢 Traitement: ${establishment.name} (${establishment.id})`);
      
      // Récupérer toutes les images de cet établissement, triées par created_at
      const { data: images, error: imagesError } = await adminClient
        .from('images')
        .select('id, url, ordre, created_at')
        .eq('establishment_id', establishment.id)
        .order('created_at', { ascending: true });
      
      if (imagesError) {
        console.error(`  ❌ Erreur: ${imagesError.message}`);
        continue;
      }
      
      if (!images || images.length === 0) {
        console.log('  ℹ️  Aucune image\n');
        continue;
      }
      
      console.log(`  📸 ${images.length} image(s) trouvée(s)`);
      
      // Mettre à jour l'ordre de chaque image
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const newOrdre = i;
        
        // Mettre à jour seulement si l'ordre a changé
        if (image.ordre !== newOrdre) {
          const { error: updateError } = await adminClient
            .from('images')
            .update({ ordre: newOrdre })
            .eq('id', image.id);
          
          if (updateError) {
            console.error(`  ❌ Erreur mise à jour image ${image.id}: ${updateError.message}`);
          } else {
            console.log(`  ✅ Image ${i + 1}: ordre ${image.ordre} → ${newOrdre}`);
            totalImagesFixed++;
          }
        }
      }
      
      // Mettre à jour is_primary: seule la première image doit être primary
      if (images.length > 0) {
        // Mettre toutes les images à is_primary = false
        await adminClient
          .from('images')
          .update({ is_primary: false })
          .eq('establishment_id', establishment.id);
        
        // Mettre la première image à is_primary = true
        await adminClient
          .from('images')
          .update({ is_primary: true })
          .eq('id', images[0].id);
        
        console.log(`  ✅ Image principale définie: ${images[0].url.substring(0, 50)}...`);
      }
      
      console.log('');
    }
    
    console.log(`\n✅ Terminé ! ${totalImagesFixed} image(s) corrigée(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
fixImagesOrdre().then(() => {
  console.log('\n🎉 Script terminé avec succès');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});

