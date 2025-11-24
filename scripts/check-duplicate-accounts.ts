/**
 * Script pour identifier les comptes en double dans Supabase
 * 
 * Usage:
 *   npx tsx scripts/check-duplicate-accounts.ts <email>
 * 
 * Exemple:
 *   npx tsx scripts/check-duplicate-accounts.ts envie2sortir.fr@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Charger les variables d'environnement
const envPaths = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    const result = config({ path: envPath });
    if (result.parsed && Object.keys(result.parsed).length > 0) {
      envLoaded = true;
      console.log(`✅ Variables d'environnement chargées depuis: ${envPath}`);
      break;
    }
  }
}

if (!envLoaded) {
  console.log('⚠️  Aucun fichier .env trouvé, utilisation des variables d\'environnement système');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('\n❌ Variables d\'environnement manquantes:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = process.argv[2];

async function checkDuplicateAccounts() {
  try {
    console.log(`\n🔍 Recherche des comptes pour: ${email || 'TOUS LES EMAILS'}\n`);
    
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Récupérer tous les utilisateurs Supabase Auth
    console.log('📋 Récupération des utilisateurs Supabase Auth...');
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError);
      process.exit(1);
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s) dans Supabase Auth\n`);

    // Filtrer par email si fourni
    const filteredUsers = email 
      ? users.filter(u => u.email?.toLowerCase() === email.toLowerCase())
      : users;

    if (filteredUsers.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      process.exit(1);
    }

    // Grouper par email pour trouver les doublons
    const usersByEmail = new Map<string, typeof users>();
    filteredUsers.forEach(user => {
      if (user.email) {
        const emailKey = user.email.toLowerCase();
        if (!usersByEmail.has(emailKey)) {
          usersByEmail.set(emailKey, []);
        }
        usersByEmail.get(emailKey)!.push(user);
      }
    });

    // Vérifier les doublons
    let hasDuplicates = false;
    usersByEmail.forEach((userList, emailKey) => {
      if (userList.length > 1) {
        hasDuplicates = true;
        console.log(`\n⚠️  DOUBLON DÉTECTÉ pour ${emailKey}:`);
        userList.forEach((user, index) => {
          console.log(`\n   Compte ${index + 1}:`);
          console.log(`   - ID: ${user.id}`);
          console.log(`   - Email: ${user.email}`);
          console.log(`   - Créé le: ${user.created_at}`);
          console.log(`   - Dernière connexion: ${user.last_sign_in_at || 'Jamais'}`);
          console.log(`   - Provider: ${user.app_metadata?.provider || 'email'}`);
          console.log(`   - Role (app_metadata): ${user.app_metadata?.role || 'non défini'}`);
          console.log(`   - Role (user_metadata): ${user.user_metadata?.role || 'non défini'}`);
        });
      }
    });

    // Vérifier dans la table users
    console.log('\n📋 Vérification dans la table users...');
    const normalClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    for (const user of filteredUsers) {
      const { data: userData, error: userError } = await normalClient
        .from('users')
        .select('id, email, role, first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (userData) {
        console.log(`\n✅ Compte trouvé dans la table users:`);
        console.log(`   - ID: ${userData.id}`);
        console.log(`   - Email: ${userData.email}`);
        console.log(`   - Nom: ${userData.first_name} ${userData.last_name}`);
        console.log(`   - Role (table): ${userData.role}`);
        console.log(`   - Role (app_metadata): ${user.app_metadata?.role || 'non défini'}`);
        
        if (userData.role !== (user.app_metadata?.role || 'user')) {
          console.log(`   ⚠️  CONFLIT DE RÔLE: La table dit "${userData.role}" mais app_metadata dit "${user.app_metadata?.role || 'non défini'}"`);
        }
      } else if (!userError) {
        console.log(`\n⚠️  Compte Auth existe mais PAS dans la table users:`);
        console.log(`   - ID Auth: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
      }
    }

    if (!hasDuplicates && filteredUsers.length === 1) {
      console.log('\n✅ Aucun doublon détecté pour cet email');
    }

    console.log('\n💡 Recommandations:');
    if (hasDuplicates) {
      console.log('   1. Supprimez les comptes en double dans Supabase Dashboard → Authentication → Users');
      console.log('   2. Gardez uniquement le compte avec le rôle admin dans app_metadata');
      console.log('   3. Videz le cache du navigateur et reconnectez-vous');
    } else {
      console.log('   1. Vérifiez que le rôle admin est bien défini dans app_metadata');
      console.log('   2. Utilisez le script set-admin-role.ts pour définir le rôle');
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkDuplicateAccounts();

