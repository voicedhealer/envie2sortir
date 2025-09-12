// Test des fonctionnalités TheFork et Uber Eats
console.log('🧪 Test TheFork et Uber Eats');
console.log('============================\n');

// Test des validations d'URL
function testUrlValidation() {
  console.log('1️⃣ Test validation URLs...\n');
  
  // URLs TheFork valides
  const validTheForkUrls = [
    'https://www.thefork.fr/restaurant/le-maharaja-r123456',
    'https://www.thefork.com/restaurant/maharaja-r789',
    'https://www.lafourchette.com/restaurant/test-r999'
  ];
  
  // URLs TheFork invalides
  const invalidTheForkUrls = [
    'https://www.google.com/maps/place/test',
    'https://www.ubereats.com/store/test',
    'https://example.com/restaurant'
  ];
  
  console.log('🍴 URLs TheFork valides:');
  validTheForkUrls.forEach(url => {
    const isValid = url.includes('lafourchette.com') || url.includes('thefork.com') || url.includes('thefork.fr');
    console.log(`   ${isValid ? '✅' : '❌'} ${url}`);
  });
  
  console.log('\n🍴 URLs TheFork invalides:');
  invalidTheForkUrls.forEach(url => {
    const isValid = url.includes('lafourchette.com') || url.includes('thefork.com') || url.includes('thefork.fr');
    console.log(`   ${isValid ? '❌ ERREUR' : '✅'} ${url}`);
  });
  
  // URLs Uber Eats valides
  const validUberEatsUrls = [
    'https://www.ubereats.com/fr/store/le-maharaja-123',
    'https://www.ubereats.com/store/maharaja-456',
    'https://uber.com/fr/store/restaurant-789'
  ];
  
  // URLs Uber Eats invalides
  const invalidUberEatsUrls = [
    'https://www.thefork.fr/restaurant/test',
    'https://www.google.com/maps/place/test',
    'https://deliveroo.fr/menu/restaurant'
  ];
  
  console.log('\n🚗 URLs Uber Eats valides:');
  validUberEatsUrls.forEach(url => {
    const isValid = url.includes('ubereats.com') || url.includes('uber.com/fr/store');
    console.log(`   ${isValid ? '✅' : '❌'} ${url}`);
  });
  
  console.log('\n🚗 URLs Uber Eats invalides:');
  invalidUberEatsUrls.forEach(url => {
    const isValid = url.includes('ubereats.com') || url.includes('uber.com/fr/store');
    console.log(`   ${isValid ? '❌ ERREUR' : '✅'} ${url}`);
  });
}

testUrlValidation();

console.log('\n📋 Instructions de test:');
console.log('1. Allez sur: http://localhost:3001/etablissements/nouveau');
console.log('2. Passez à l\'étape d\'enrichissement (étape 3)');
console.log('3. Remplissez l\'URL Google Maps');
console.log('4. Ajoutez les URLs TheFork et Uber Eats (optionnelles)');
console.log('5. Vérifiez la validation automatique des URLs');
console.log('6. Testez l\'enrichissement complet');

console.log('\n🎯 Fonctionnalités ajoutées:');
console.log('✅ Champ TheFork avec validation automatique');
console.log('✅ Champ Uber Eats avec validation automatique');
console.log('✅ Messages d\'aide et de validation');
console.log('✅ Intégration dans le système d\'enrichissement');
console.log('✅ Sauvegarde dans le formulaire d\'établissement');

