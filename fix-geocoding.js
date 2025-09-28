const fs = require('fs');
const path = require('path');

// Corriger le système de géocodage pour utiliser le vrai service au lieu du mode simulé
const geocodePath = path.join(__dirname, 'src', 'app', 'api', 'geocode', 'route.ts');
let geocodeContent = fs.readFileSync(geocodePath, 'utf8');

console.log('🔧 Correction du système de géocodage...\n');

// Remplacer le mode simulé forcé par une vérification de l'environnement
const oldCode = `    // MODE DÉVELOPPEMENT : Géocodage simulé (toujours en mode dev pour le moment)
    if (true) { // Temporairement toujours en mode simulé`;

const newCode = `    // MODE DÉVELOPPEMENT : Géocodage simulé (seulement si NODE_ENV=development)
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_GEOCODING === 'true') { // Mode simulé optionnel`;

geocodeContent = geocodeContent.replace(oldCode, newCode);

// Ajouter un commentaire explicatif
const commentToAdd = `    // Pour activer le mode simulé en développement, définir USE_MOCK_GEOCODING=true dans .env
    // Sinon, le système utilisera le vrai service Nominatim (OpenStreetMap)
    
`;

// Insérer le commentaire avant la condition
geocodeContent = geocodeContent.replace(
  '    // MODE DÉVELOPPEMENT : Géocodage simulé (seulement si NODE_ENV=development)',
  commentToAdd + '    // MODE DÉVELOPPEMENT : Géocodage simulé (seulement si NODE_ENV=development)'
);

fs.writeFileSync(geocodePath, geocodeContent);

console.log('✅ Système de géocodage corrigé !');
console.log('📝 Changements effectués :');
console.log('   - Le mode simulé n\'est plus forcé');
console.log('   - Le système utilise maintenant le vrai service Nominatim');
console.log('   - Pour activer le mode simulé, définir USE_MOCK_GEOCODING=true dans .env');
console.log('\n🌍 Le géocodage devrait maintenant fonctionner correctement !');
