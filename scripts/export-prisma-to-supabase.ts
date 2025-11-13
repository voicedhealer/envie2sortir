/**
 * Script pour exporter les données de Prisma vers Supabase
 * 
 * Usage: npx tsx scripts/export-prisma-to-supabase.ts
 * 
 * Ce script :
 * 1. Lit toutes les données de Prisma (prisma/dev.db)
 * 2. Les convertit au format Supabase (snake_case, UUID, etc.)
 * 3. Les insère dans Supabase
 * 
 * ⚠️ ATTENTION : Ce script ne supprime pas les données existantes dans Supabase
 * Il ajoute les données de Prisma à Supabase
 */

import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL manquante');
  console.error('   Ajoutez-la dans .env.local ou .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ ERREUR: SUPABASE_SERVICE_ROLE_KEY manquante');
  console.error('');
  console.error('💡 Pour trouver cette clé :');
  console.error('   1. Aller sur https://supabase.com/dashboard');
  console.error('   2. Sélectionner votre projet');
  console.error('   3. Settings > API');
  console.error('   4. Section "service_role" (⚠️ gardez-la secrète !)');
  console.error('');
  console.error('   ⚠️  IMPORTANT : Cette clé est nécessaire pour insérer des données');
  console.error('   Ajoutez-la dans .env.local :');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Convertit un ID Prisma (cuid) en UUID pour Supabase
 * Ou génère un UUID si nécessaire
 */
function toUUID(id: string): string {
  // Si c'est déjà un UUID, le retourner
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  // Sinon, générer un UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Convertit un objet Prisma (camelCase) en objet Supabase (snake_case)
 */
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = value;
  }
  return result;
}

/**
 * Parse un champ JSON si c'est une string
 */
function parseJsonField(field: any): any {
  if (!field) return null;
  if (typeof field === 'object') return field;
  if (typeof field !== 'string') return field;
  try {
    return JSON.parse(field);
  } catch {
    return field;
  }
}

async function exportUsers() {
  console.log('👥 Export des utilisateurs...');
  
  const users = await prisma.user.findMany();
  console.log(`   ${users.length} utilisateurs trouvés`);
  
  if (users.length === 0) {
    console.log('   ⚠️  Aucun utilisateur à exporter\n');
    return;
  }
  
  const supabaseUsers = users.map(user => ({
    id: toUUID(user.id),
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    name: user.name,
    phone: user.phone,
    preferences: parseJsonField(user.preferences),
    newsletter_opt_in: user.newsletterOptIn,
    provider: user.provider,
    provider_id: user.providerId,
    avatar: user.avatar,
    is_verified: user.isVerified,
    favorite_city: user.favoriteCity,
    role: user.role,
    karma_points: user.karmaPoints,
    gamification_badges: parseJsonField(user.gamificationBadges),
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString()
  }));
  
  // Insérer par batch de 100
  for (let i = 0; i < supabaseUsers.length; i += 100) {
    const batch = supabaseUsers.slice(i, i + 100);
    const { error } = await supabase.from('users').upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Erreur lors de l'insertion du batch ${i / 100 + 1}:`, error.message);
    } else {
      console.log(`   ✅ Batch ${i / 100 + 1} inséré (${batch.length} utilisateurs)`);
    }
  }
  
  console.log(`   ✅ ${users.length} utilisateurs exportés\n`);
}

async function exportProfessionals() {
  console.log('💼 Export des professionnels...');
  
  const professionals = await prisma.professional.findMany();
  console.log(`   ${professionals.length} professionnels trouvés`);
  
  if (professionals.length === 0) {
    console.log('   ⚠️  Aucun professionnel à exporter\n');
    return;
  }
  
  const supabaseProfessionals = professionals.map(pro => ({
    id: toUUID(pro.id),
    siret: pro.siret,
    first_name: pro.firstName,
    last_name: pro.lastName,
    email: pro.email,
    password_hash: pro.passwordHash,
    phone: pro.phone,
    company_name: pro.companyName,
    legal_status: pro.legalStatus,
    subscription_plan: pro.subscriptionPlan,
    siret_verified: pro.siretVerified,
    siret_verified_at: pro.siretVerifiedAt?.toISOString() || null,
    created_at: pro.createdAt.toISOString(),
    updated_at: pro.updatedAt.toISOString()
  }));
  
  // Insérer par batch de 100
  for (let i = 0; i < supabaseProfessionals.length; i += 100) {
    const batch = supabaseProfessionals.slice(i, i + 100);
    const { error } = await supabase.from('professionals').upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Erreur lors de l'insertion du batch ${i / 100 + 1}:`, error.message);
    } else {
      console.log(`   ✅ Batch ${i / 100 + 1} inséré (${batch.length} professionnels)`);
    }
  }
  
  console.log(`   ✅ ${professionals.length} professionnels exportés\n`);
}

async function exportEstablishments() {
  console.log('🏢 Export des établissements...');
  
  const establishments = await prisma.establishment.findMany({
    include: {
      owner: true
    }
  });
  console.log(`   ${establishments.length} établissements trouvés`);
  
  if (establishments.length === 0) {
    console.log('   ⚠️  Aucun établissement à exporter\n');
    return;
  }
  
  const supabaseEstablishments = establishments.map(est => ({
    id: toUUID(est.id),
    name: est.name,
    slug: est.slug,
    description: est.description,
    address: est.address,
    city: est.city,
    postal_code: est.postalCode,
    country: est.country,
    latitude: est.latitude,
    longitude: est.longitude,
    phone: est.phone,
    whatsapp_phone: est.whatsappPhone,
    messenger_url: est.messengerUrl,
    email: est.email,
    website: est.website,
    instagram: est.instagram,
    facebook: est.facebook,
    tiktok: est.tiktok,
    youtube: est.youtube,
    activities: parseJsonField(est.activities),
    services: parseJsonField(est.services),
    ambiance: parseJsonField(est.ambiance),
    payment_methods: parseJsonField(est.paymentMethods),
    horaires_ouverture: parseJsonField(est.horairesOuverture),
    price_min: est.priceMin,
    price_max: est.priceMax,
    informations_pratiques: parseJsonField(est.informationsPratiques),
    status: est.status,
    subscription: est.subscription,
    owner_id: toUUID(est.ownerId),
    rejection_reason: est.rejectionReason,
    rejected_at: est.rejectedAt?.toISOString() || null,
    last_modified_at: est.lastModifiedAt?.toISOString() || null,
    views_count: est.viewsCount,
    clicks_count: est.clicksCount,
    avg_rating: est.avgRating,
    total_comments: est.totalComments,
    image_url: est.imageUrl,
    google_place_id: est.googlePlaceId,
    google_business_url: est.googleBusinessUrl,
    enriched: est.enriched,
    envie_tags: parseJsonField(est.envieTags),
    created_at: est.createdAt.toISOString(),
    updated_at: est.updatedAt.toISOString()
  }));
  
  // Insérer par batch de 50 (établissements plus complexes)
  for (let i = 0; i < supabaseEstablishments.length; i += 50) {
    const batch = supabaseEstablishments.slice(i, i + 50);
    const { error } = await supabase.from('establishments').upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Erreur lors de l'insertion du batch ${i / 50 + 1}:`, error.message);
      console.error('   Détails:', error);
    } else {
      console.log(`   ✅ Batch ${i / 50 + 1} inséré (${batch.length} établissements)`);
    }
  }
  
  console.log(`   ✅ ${establishments.length} établissements exportés\n`);
}

async function exportTags() {
  console.log('🏷️  Export des tags...');
  
  const tags = await prisma.etablissementTag.findMany();
  console.log(`   ${tags.length} tags trouvés`);
  
  if (tags.length === 0) {
    console.log('   ⚠️  Aucun tag à exporter\n');
    return;
  }
  
  const supabaseTags = tags.map(tag => ({
    id: toUUID(tag.id),
    etablissement_id: toUUID(tag.etablissementId),
    tag: tag.tag,
    type_tag: tag.typeTag,
    poids: tag.poids,
    created_at: tag.createdAt.toISOString()
  }));
  
  const { error } = await supabase.from('etablissement_tags').upsert(supabaseTags, { onConflict: 'id' });
  
  if (error) {
    console.error('   ❌ Erreur:', error.message);
  } else {
    console.log(`   ✅ ${tags.length} tags exportés\n`);
  }
}

async function exportImages() {
  console.log('🖼️  Export des images...');
  
  const images = await prisma.image.findMany();
  console.log(`   ${images.length} images trouvées`);
  
  if (images.length === 0) {
    console.log('   ⚠️  Aucune image à exporter\n');
    return;
  }
  
  const supabaseImages = images.map(img => ({
    id: toUUID(img.id),
    url: img.url,
    alt_text: img.altText,
    is_primary: img.isPrimary,
    is_card_image: img.isCardImage,
    ordre: img.ordre,
    establishment_id: toUUID(img.establishmentId),
    created_at: img.createdAt.toISOString()
  }));
  
  const { error } = await supabase.from('images').upsert(supabaseImages, { onConflict: 'id' });
  
  if (error) {
    console.error('   ❌ Erreur:', error.message);
  } else {
    console.log(`   ✅ ${images.length} images exportées\n`);
  }
}

async function main() {
  console.log('🚀 Export des données Prisma vers Supabase\n');
  console.log('⚠️  ATTENTION: Ce script ajoute les données à Supabase');
  console.log('   Les données existantes ne seront pas supprimées\n');
  
  try {
    await exportUsers();
    await exportProfessionals();
    await exportEstablishments();
    await exportTags();
    await exportImages();
    
    console.log('✅ Export terminé !');
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifier les données dans Supabase Dashboard > Table Editor');
    console.log('   2. Tester les routes migrées');
    console.log('   3. Relancer: ./scripts/test-routes-migrees.sh');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

