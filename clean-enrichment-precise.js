const fs = require('fs');

// Lire le fichier
let content = fs.readFileSync('src/lib/enrichment-system.ts', 'utf8');

// Supprimer seulement les logs de debug spécifiques (pas tous les console.log)
content = content.replace(/console\.log\('♿[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('🔍[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('⭐[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('👥[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('🍻[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('🍽️[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('🛎️[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('🎵[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('📅[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('💳[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('👶[^']*'[^;]*;\s*/g, '');
content = content.replace(/console\.log\('🅿️[^']*'[^;]*;\s*/g, '');

// Supprimer les logs JSON.stringify
content = content.replace(/console\.log\('[^']*JSON\.stringify[^;]*;\s*/g, '');

// Supprimer les commentaires de debug
content = content.replace(/\/\/ Debug:.*\n/g, '');

// Supprimer les espaces vides excessifs
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Écrire le fichier nettoyé
fs.writeFileSync('src/lib/enrichment-system.ts', content);

console.log('✅ Fichier nettoyé avec succès !');
