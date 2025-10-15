// Test de la recherche "envie de boire un verre entre amis" à Lyon

function extractKeywords(envie) {
  const stopWords = ['de', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'manger', 'boire', 'faire', 'découvrir', 'avec', 'mes', 'mon', 'ma', 'pour', 'l', 'd', 'au', 'aux', 'envie', 'sortir', 'aller', 'voir', 'trouver', 'ai', 'as', 'a', 'et', 'ou', 'si', 'on', 'il', 'je', 'tu', 'nous', 'vous', 'ils', 'elle', 'elles'];
  
  const contextWords = ['ce', 'soir', 'demain', 'aujourd', 'maintenant', 'bientot', 'plus', 'tard'];
  const actionWords = ['kart', 'karting', 'bowling', 'laser', 'escape', 'game', 'paintball', 'tir', 'archery', 'escalade', 'piscine', 'cinema', 'theatre', 'concert', 'danse', 'danser', 'boire', 'manger', 'restaurant', 'bar', 'cafe'];
  
  const normalizedText = envie
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, ' ');
  
  console.log('Texte normalisé:', normalizedText);
  
  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);
  console.log('Mots après split:', words);
  
  const primaryKeywords = [];
  const contextKeywords = [];
  const allKeywords = [];
  
  words.forEach(word => {
    const trimmed = word.trim();
    if (trimmed.length < 2) return;
    
    console.log(`  Traitement: "${trimmed}"`);
    
    if (contextWords.includes(trimmed)) {
      contextKeywords.push(trimmed);
      allKeywords.push(trimmed);
      console.log(`    -> Contexte`);
    } else if (actionWords.includes(trimmed)) {
      primaryKeywords.push(trimmed);
      allKeywords.push(trimmed);
      console.log(`    -> Primaire ✨`);
    } else if (!stopWords.includes(trimmed)) {
      allKeywords.push(trimmed);
      console.log(`    -> Normal`);
    } else {
      console.log(`    -> Stop word (ignoré)`);
    }
  });
  
  return {
    keywords: allKeywords,
    primaryKeywords,
    contextKeywords
  };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Coordonnées de Lyon centre
const lyonLat = 45.764043;
const lyonLng = 4.835659;

const establishments = [
  {
    name: 'KBOX Karaoké',
    latitude: 45.755199,
    longitude: 4.840434,
    activities: ['bar_karaoke']
  },
  {
    name: 'L Bar food & drink',
    latitude: 45.766335,
    longitude: 4.836904,
    activities: ['bar_cocktails', 'bar_tapas', 'burger', 'bar_ambiance']
  }
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 TEST: "envie de boire un verre entre amis" à Lyon');
console.log('═══════════════════════════════════════════════════════════════\n');

const query = "envie de boire un verre entre amis";
console.log('Requête:', query);
console.log('Position: Lyon (45.764043, 4.835659)');
console.log('Rayon: 20 km\n');

const result = extractKeywords(query);
console.log('\n📝 Mots-clés extraits:');
console.log('  Keywords:', result.keywords);
console.log('  Primary:', result.primaryKeywords);
console.log('  Context:', result.contextKeywords);

console.log('\n📍 Distance des établissements:');
establishments.forEach(est => {
  const distance = calculateDistance(lyonLat, lyonLng, est.latitude, est.longitude);
  console.log(`  ${est.name}: ${distance.toFixed(2)} km ${distance <= 20 ? '✅' : '❌'}`);
});

console.log('\n🎯 Matching des mots-clés:');
establishments.forEach(est => {
  console.log(`\n${est.name}:`);
  console.log(`  Activités: ${JSON.stringify(est.activities)}`);
  
  let score = 0;
  result.keywords.forEach(keyword => {
    const isPrimary = result.primaryKeywords.includes(keyword);
    
    est.activities.forEach(activity => {
      const activityNormalized = activity.toLowerCase();
      if (activityNormalized.includes(keyword) || keyword.includes(activityNormalized)) {
        const points = isPrimary ? 100 : 25;
        score += points;
        console.log(`  ✓ Activité "${activity}" match "${keyword}": +${points}`);
      }
    });
  });
  
  console.log(`  Score total: ${score}`);
  console.log(`  Seuil: ${result.primaryKeywords.length > 0 ? 30 : 50}`);
  console.log(`  Passe: ${score >= (result.primaryKeywords.length > 0 ? 30 : 50) ? '✅' : '❌'}`);
});

console.log('\n═══════════════════════════════════════════════════════════════\n');

