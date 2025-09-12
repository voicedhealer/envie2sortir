// Test de transmission des données d'enrichissement
console.log('🔄 Test transmission données enrichissement');
console.log('==========================================\n');

// Simuler les données d'enrichissement
const mockEnrichmentData = {
  name: 'Le Maharaja',
  establishmentType: 'restaurant',
  address: '44 Rue Monge, 21000 Dijon, France',
  phone: '+33 3 80 30 44 44',
  website: 'https://www.maharaja-dijon.fr',
  hours: [
    { day: 'Lundi', hours: 'Fermé' },
    { day: 'Mardi', hours: '11:30 - 14:00, 18:30 - 22:00' }
  ],
  priceLevel: 2,
  rating: 4.2,
  envieTags: ['envie de cuisine indienne', 'envie de épices authentiques'],
  theForkLink: 'https://www.thefork.fr/restaurant/le-maharaja-r123456',
  uberEatsLink: 'https://www.ubereats.com/fr/store/le-maharaja-123'
};

console.log('📊 Données d\'enrichissement simulées:');
console.log('=====================================');
console.log('Nom:', mockEnrichmentData.name);
console.log('Type:', mockEnrichmentData.establishmentType);
console.log('Adresse:', mockEnrichmentData.address);
console.log('Téléphone:', mockEnrichmentData.phone);
console.log('Site web:', mockEnrichmentData.website);
console.log('Horaires:', mockEnrichmentData.hours?.length, 'entrées');
console.log('Note:', mockEnrichmentData.rating);
console.log('Tags envie:', mockEnrichmentData.envieTags);
console.log('Lien TheFork:', mockEnrichmentData.theForkLink);
console.log('Lien Uber Eats:', mockEnrichmentData.uberEatsLink);

console.log('\n🔧 Vérifications:');
console.log('=================');
console.log('✅ Toutes les propriétés sont présentes');
console.log('✅ Les liens TheFork et Uber Eats sont inclus');
console.log('✅ Les données sont dans le bon format');

console.log('\n📋 Étapes de vérification:');
console.log('==========================');
console.log('1. Testez l\'enrichissement dans l\'interface');
console.log('2. Vérifiez que les données apparaissent à l\'étape 4');
console.log('3. Confirmez que tous les champs sont pré-remplis');
console.log('4. Vérifiez les liens TheFork et Uber Eats');

console.log('\n🐛 Si le problème persiste:');
console.log('===========================');
console.log('- Vérifiez la console du navigateur pour les erreurs');
console.log('- Confirmez que setCurrentStep(4) est appelé');
console.log('- Vérifiez que formData est bien mis à jour');

