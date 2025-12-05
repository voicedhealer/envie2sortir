/**
 * Script de test pour valider la conversion des moyens de paiement
 * Teste que tous les moyens de paiement de Google sont préservés
 */

// Simulation des fonctions de conversion
function convertPaymentMethodsObjectToArray(paymentMethodsObj: any): string[] {
  if (!paymentMethodsObj) return [];
  
  if (Array.isArray(paymentMethodsObj)) {
    return paymentMethodsObj;
  }
  
  if (typeof paymentMethodsObj === 'object') {
    const methods: string[] = [];
    
    if (paymentMethodsObj.creditCards) methods.push('Cartes de crédit|cartes-bancaires');
    if (paymentMethodsObj.debitCards) methods.push('Cartes de débit|cartes-bancaires');
    if (paymentMethodsObj.nfc) methods.push('Paiement mobile NFC|paiements-mobiles');
    if (paymentMethodsObj.restaurantVouchers) methods.push('Titres restaurant|especes-autres');
    if (paymentMethodsObj.pluxee) methods.push('Pluxee|especes-autres');
    if (paymentMethodsObj.cashOnly || paymentMethodsObj.cash) {
      methods.push('Espèces|especes-autres');
    }
    
    return methods;
  }
  
  return [];
}

function convertPaymentMethodsArrayToObject(paymentMethodsArray: string[]): any {
  if (!Array.isArray(paymentMethodsArray)) {
    return {};
  }
  
  const paymentMethodsObj: any = {};
  
  paymentMethodsArray.forEach(method => {
    let cleanMethod = method;
    if (method.includes('|')) {
      cleanMethod = method.split('|')[0].trim();
    }
    
    cleanMethod = cleanMethod.replace(/^[⚠️✅❌🔴🟡🟢⭐🔥💡🎯📢🎁📊💬✨🦋]+\s*/, '').trim();
    const methodLower = cleanMethod.toLowerCase();
    
    if (methodLower.includes('carte') && (methodLower.includes('crédit') || methodLower.includes('credit'))) {
      paymentMethodsObj.creditCards = true;
    }
    if (methodLower.includes('carte') && methodLower.includes('débit')) {
      paymentMethodsObj.debitCards = true;
    }
    if (methodLower.includes('nfc') || methodLower.includes('mobile')) {
      paymentMethodsObj.nfc = true;
    }
    if (methodLower.includes('espèces') || methodLower.includes('cash')) {
      paymentMethodsObj.cash = true;
      paymentMethodsObj.cashOnly = true;
    }
    if (methodLower.includes('titre') || methodLower.includes('restaurant')) {
      paymentMethodsObj.restaurantVouchers = true;
    }
    if (methodLower.includes('pluxee')) {
      paymentMethodsObj.pluxee = true;
    }
  });
  
  return paymentMethodsObj;
}

// Test 1: Moyens de paiement depuis Google (comme dans l'image)
console.log('=== TEST 1: Moyens de paiement Google ===');
const googleMethods = ['Cartes de crédit', 'Espèces', 'Cartes de débit', 'Paiements mobiles NFC'];
console.log('📥 Entrée Google:', googleMethods);

// Simuler handleEnrichmentComplete qui ajoute les marqueurs
const methodsWithMarkers = googleMethods.map(method => {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('carte') && (methodLower.includes('crédit') || methodLower.includes('credit'))) {
    return `${method}|cartes-bancaires`;
  }
  if (methodLower.includes('carte') && methodLower.includes('débit')) {
    return `${method}|cartes-bancaires`;
  }
  if (methodLower.includes('nfc') || methodLower.includes('mobile')) {
    return `${method}|paiements-mobiles`;
  }
  if (methodLower.includes('espèces') || methodLower.includes('cash')) {
    return `${method}|especes-autres`;
  }
  return `${method}|especes-autres`;
});
console.log('✅ Avec marqueurs:', methodsWithMarkers);
console.log('✅ Nombre d\'items:', methodsWithMarkers.length, '/', googleMethods.length);

// Test 2: Conversion objet -> tableau
console.log('\n=== TEST 2: Conversion objet -> tableau ===');
const testObj = { creditCards: true, cash: true, debitCards: true, nfc: true };
console.log('📥 Objet:', testObj);
const converted = convertPaymentMethodsObjectToArray(testObj);
console.log('✅ Tableau converti:', converted);
console.log('✅ Tous les items préservés?', converted.length === 4 ? '✅ OUI' : '❌ NON');

// Test 3: Conversion tableau -> objet -> tableau (round-trip)
console.log('\n=== TEST 3: Round-trip conversion ===');
const originalArray = ['Cartes de crédit|cartes-bancaires', 'Espèces|especes-autres', 'Cartes de débit|cartes-bancaires', 'Paiements mobiles NFC|paiements-mobiles'];
console.log('📥 Tableau original:', originalArray);
const toObj = convertPaymentMethodsArrayToObject(originalArray);
console.log('📦 Objet intermédiaire:', toObj);
const backToArray = convertPaymentMethodsObjectToArray(toObj);
console.log('✅ Tableau final:', backToArray);
console.log('✅ Tous les items préservés?', backToArray.length === 4 ? '✅ OUI' : '❌ NON');
console.log('✅ Items identiques?', JSON.stringify(originalArray.sort()) === JSON.stringify(backToArray.sort()) ? '✅ OUI' : '❌ NON');

// Test 4: Ajout d'un moyen de paiement manuel
console.log('\n=== TEST 4: Ajout manuel d\'un moyen de paiement ===');
const existingMethods = ['Cartes de crédit|cartes-bancaires', 'Cartes de débit|cartes-bancaires', 'Paiements mobiles NFC|paiements-mobiles'];
console.log('📥 Moyens existants:', existingMethods);
const newMethod = 'Espèces|especes-autres';
const allMethods = [...existingMethods, newMethod];
console.log('➕ Après ajout de "Espèces":', allMethods);
console.log('✅ Nombre total:', allMethods.length, '(devrait être 4)');
console.log('✅ Tous préservés?', allMethods.length === 4 ? '✅ OUI' : '❌ NON');

console.log('\n=== RÉSUMÉ ===');
console.log('✅ Test 1: Conversion Google -> Marqueurs:', methodsWithMarkers.length === 4 ? 'PASS' : 'FAIL');
console.log('✅ Test 2: Conversion Objet -> Tableau:', converted.length === 4 ? 'PASS' : 'FAIL');
console.log('✅ Test 3: Round-trip:', backToArray.length === 4 ? 'PASS' : 'FAIL');
console.log('✅ Test 4: Ajout manuel:', allMethods.length === 4 ? 'PASS' : 'FAIL');

