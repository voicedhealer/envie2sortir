/**
 * Script de test End-to-End pour l'ajout d'établissement
 * Ce script va créer un établissement de test complet et documenter le processus
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TEST_DATA = {
  // Professionnel (contient déjà l'authentification)
  professional: {
    siret: '12345678901234',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'test-e2e-etablissement@test.com',
    password: 'TestSecure123!',
    phone: '+33612345678',
    companyName: 'Bistrot Test SARL',
    legalStatus: 'SARL',
    subscriptionPlan: 'FREE'
  },
  
  // Établissement
  establishment: {
    name: 'Le Bistrot Test E2E',
    description: 'Un restaurant convivial pour tester l\'intégralité du système. Cuisine française traditionnelle avec une touche moderne.',
    address: '15 Rue de la République, 75001 Paris, France',
    phone: '+33145678901',
    whatsappPhone: '+33645678901',
    email: 'contact@bistrot-test.com',
    website: 'https://bistrot-test.com',
    instagram: 'https://instagram.com/bistrottest',
    facebook: 'https://facebook.com/bistrottest',
    tiktok: 'https://tiktok.com/@bistrottest',
    youtube: 'https://youtube.com/@bistrottest',
    category: 'Restaurant',
    city: 'Paris',
    postalCode: '75001',
    latitude: 48.8656,
    longitude: 2.3212,
    status: 'approved', // On approuve directement pour le test
    
    // Horaires (format JSON)
    hours: {
      lundi: { ouvert: true, heures: '12:00-14:30, 19:00-22:00' },
      mardi: { ouvert: true, heures: '12:00-14:30, 19:00-22:00' },
      mercredi: { ouvert: true, heures: '12:00-14:30, 19:00-22:00' },
      jeudi: { ouvert: true, heures: '12:00-14:30, 19:00-22:00' },
      vendredi: { ouvert: true, heures: '12:00-14:30, 19:00-23:00' },
      samedi: { ouvert: true, heures: '12:00-14:30, 19:00-23:00' },
      dimanche: { ouvert: false, heures: '' }
    },
    
    // Services et ambiances
    services: ['Wi-Fi gratuit', 'Terrasse', 'Parking'],
    ambiance: ['Conviviale', 'Romantique'],
    informationsPratiques: ['Accepte les réservations', 'Animaux acceptés'],
    
    // Moyens de paiement
    hybridDetailedPayments: {
      creditCards: true,
      debitCards: true,
      cash: true,
      mobilePayment: false,
      cheque: false
    },
    
    // Accessibilité
    hybridAccessibilityDetails: {
      wheelchairAccessibleEntrance: true,
      wheelchairAccessibleRestroom: true,
      wheelchairAccessibleSeating: false,
      wheelchairAccessibleParking: false
    },
    
    // Services détaillés
    hybridDetailedServices: {
      dineIn: true,
      takeout: true,
      delivery: false,
      catering: false
    },
    
    // Clientèle
    hybridClienteleInfo: {
      familyFriendly: true,
      groups: true,
      cozyForGroups: true
    },
    
    // Services enfants
    hybridChildrenServices: {
      kidsMenu: true,
      highChairs: true,
      changingTable: false
    },
    
    // Parking
    hybridParkingInfo: {
      freeParking: false,
      paidParking: true,
      streetParking: true,
      parkingGarage: false
    },
    
    // Tags
    tags: ['Restaurant français', 'Bistrot', 'Gastronomie', 'Cuisine traditionnelle'],
    enviesAutomatiques: ['Manger', 'Boire un verre', 'Sortir en amoureux'],
    envsocialesAutomatiques: ['En couple', 'Entre amis', 'En famille']
  }
};

async function cleanupTestData() {
  console.log('\n🧹 Nettoyage des données de test existantes...');
  
  try {
    // Supprimer l'établissement de test s'il existe
    const deletedEstablishment = await prisma.establishment.deleteMany({
      where: { email: TEST_DATA.establishment.email }
    });
    if (deletedEstablishment.count > 0) {
      console.log(`   ✓ ${deletedEstablishment.count} établissement(s) supprimé(s)`);
    }
    
    // Supprimer le professionnel de test s'il existe
    const deletedProfessional = await prisma.professional.deleteMany({
      where: { siret: TEST_DATA.professional.siret }
    });
    if (deletedProfessional.count > 0) {
      console.log(`   ✓ ${deletedProfessional.count} professionnel(s) supprimé(s)`);
    }
    
    console.log('   ✅ Nettoyage terminé\n');
  } catch (error) {
    console.error('   ❌ Erreur lors du nettoyage:', error.message);
  }
}

async function createTestEstablishment() {
  console.log('🚀 Démarrage du test E2E - Création d\'établissement\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Créer le professionnel (contient l'authentification)
    console.log('\n📝 ÉTAPE 1: Création du compte professionnel');
    console.log('-'.repeat(60));
    const hashedPassword = await bcrypt.hash(TEST_DATA.professional.password, 10);
    
    const professional = await prisma.professional.create({
      data: {
        siret: TEST_DATA.professional.siret,
        firstName: TEST_DATA.professional.firstName,
        lastName: TEST_DATA.professional.lastName,
        email: TEST_DATA.professional.email,
        passwordHash: hashedPassword,
        phone: TEST_DATA.professional.phone,
        companyName: TEST_DATA.professional.companyName,
        legalStatus: TEST_DATA.professional.legalStatus,
        subscriptionPlan: TEST_DATA.professional.subscriptionPlan,
        siretVerified: true // On simule la vérification
      }
    });
    
    console.log(`   ✅ Professionnel créé avec succès`);
    console.log(`   - ID: ${professional.id}`);
    console.log(`   - Email: ${professional.email}`);
    console.log(`   - Nom: ${professional.firstName} ${professional.lastName}`);
    console.log(`   - SIRET: ${professional.siret}`);
    console.log(`   - Entreprise: ${professional.companyName}`);
    console.log(`   - Abonnement: ${professional.subscriptionPlan}`);
    
    // 2. Créer l'établissement
    console.log('\n📝 ÉTAPE 2: Création de l\'établissement');
    console.log('-'.repeat(60));
    
    const establishment = await prisma.establishment.create({
      data: {
        name: TEST_DATA.establishment.name,
        description: TEST_DATA.establishment.description,
        address: TEST_DATA.establishment.address,
        phone: TEST_DATA.establishment.phone,
        whatsappPhone: TEST_DATA.establishment.whatsappPhone,
        email: TEST_DATA.establishment.email,
        website: TEST_DATA.establishment.website,
        instagram: TEST_DATA.establishment.instagram,
        facebook: TEST_DATA.establishment.facebook,
        tiktok: TEST_DATA.establishment.tiktok,
        youtube: TEST_DATA.establishment.youtube,
        city: TEST_DATA.establishment.city,
        postalCode: TEST_DATA.establishment.postalCode,
        latitude: TEST_DATA.establishment.latitude,
        longitude: TEST_DATA.establishment.longitude,
        status: TEST_DATA.establishment.status,
        ownerId: professional.id,
        slug: 'le-bistrot-test-e2e-' + Date.now(), // Générer un slug unique
        
        // Données JSON
        horairesOuverture: TEST_DATA.establishment.hours,
        services: TEST_DATA.establishment.services,
        ambiance: TEST_DATA.establishment.ambiance,
        informationsPratiques: TEST_DATA.establishment.informationsPratiques,
        detailedPayments: TEST_DATA.establishment.hybridDetailedPayments,
        accessibilityDetails: TEST_DATA.establishment.hybridAccessibilityDetails,
        detailedServices: TEST_DATA.establishment.hybridDetailedServices,
        clienteleInfo: TEST_DATA.establishment.hybridClienteleInfo,
        childrenServices: TEST_DATA.establishment.hybridChildrenServices,
        // Note: parkingInfo n'existe pas dans le schéma
        envieTags: {
          tags: TEST_DATA.establishment.tags,
          enviesAutomatiques: TEST_DATA.establishment.enviesAutomatiques,
          envsocialesAutomatiques: TEST_DATA.establishment.envsocialesAutomatiques
        }
      }
    });
    
    console.log(`   ✅ Établissement créé avec succès`);
    console.log(`   - ID: ${establishment.id}`);
    console.log(`   - Nom: ${establishment.name}`);
    console.log(`   - Catégorie: ${establishment.category}`);
    console.log(`   - Adresse: ${establishment.address}`);
    console.log(`   - Status: ${establishment.status}`);
    console.log(`   - URL publique: /etablissements/${establishment.id}`);
    
    // 4. Résumé
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST E2E - CRÉATION TERMINÉE AVEC SUCCÈS');
    console.log('='.repeat(60));
    console.log('\n📊 Résumé des données créées:');
    console.log(`   - Professional ID: ${professional.id}`);
    console.log(`   - Establishment ID: ${establishment.id}`);
    console.log(`\n🔗 Prochaine étape: Vérifier la visualisation publique`);
    console.log(`   → http://localhost:3000/etablissements/${establishment.id}`);
    console.log(`   → http://localhost:3000/etablissements/${establishment.slug}`);
    console.log('\n💡 Pour supprimer ces données de test:');
    console.log(`   → node scripts/test-e2e-cleanup.js ${establishment.id}`);
    
    return {
      professionalId: professional.id,
      establishmentId: establishment.id
    };
    
  } catch (error) {
    console.error('\n❌ ERREUR lors de la création:', error);
    throw error;
  }
}

async function main() {
  try {
    await cleanupTestData();
    const result = await createTestEstablishment();
    
    // Sauvegarder les IDs pour le cleanup
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/vivien/envie2sortir/test-e2e-ids.json',
      JSON.stringify(result, null, 2)
    );
    
  } catch (error) {
    console.error('Erreur fatale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

