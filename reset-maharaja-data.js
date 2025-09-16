const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetMaharajaData() {
  try {
    console.log('🔄 Réinitialisation des données de Le Maharaja...');
    
    // Réinitialiser les données Google Places à null ou vides
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: 'le-maharaja' },
      data: {
        services: null,
        ambiance: null,
        informationsPratiques: null,
        activities: null,
        paymentMethods: null,
        // Garder seulement les données essentielles
        name: 'Le Maharaja',
        slug: 'le-maharaja',
        address: '44 Rue Monge',
        city: 'Dijon',
        postalCode: '21000',
        description: 'Restaurant indien authentique au cœur de Dijon',
        // Garder les données de contact existantes
        phone: '03 80 30 12 34',
        email: 'lemaharajadijon@hotmail.com',
        website: 'https://lemaharajadijon.fr',
        instagram: 'lemaharajadijon',
        facebook: 'lemaharajadijon',
        // Coordonnées GPS correctes
        latitude: 47.3192727,
        longitude: 5.0348298,
        // Horaires d'ouverture (données réelles de Google Places)
        horairesOuverture: {
          "lundi": { "ouverture": "12:00", "fermeture": "14:30" },
          "mardi": { "ferme": true },
          "mercredi": { "ouverture": "12:00", "fermeture": "14:00" },
          "jeudi": { "ouverture": "12:00", "fermeture": "14:00" },
          "vendredi": { "ouverture": "12:00", "fermeture": "14:00" },
          "samedi": { "ouverture": "12:00", "fermeture": "14:30" },
          "dimanche": { "ouverture": "12:00", "fermeture": "14:30" }
        },
        // Informations de base
        prixMoyen: 25,
        capaciteMax: 50,
        accessibilite: false,
        parking: false,
        terrasse: true,
        status: 'active'
      }
    });

    console.log('✅ Données réinitialisées avec succès !');
    console.log('📋 Établissement mis à jour:', updatedEstablishment.name);
    console.log('📍 Adresse:', updatedEstablishment.address, updatedEstablishment.city);
    console.log('🌐 Site web:', updatedEstablishment.website);
    console.log('📱 Instagram:', updatedEstablishment.instagram);
    console.log('📘 Facebook:', updatedEstablishment.facebook);
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetMaharajaData();
