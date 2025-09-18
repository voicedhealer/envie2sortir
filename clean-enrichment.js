const fs = require('fs');

// Lire le fichier
let content = fs.readFileSync('src/lib/enrichment-system.ts', 'utf8');

// Supprimer les logs de debug excessifs
content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
content = content.replace(/console\.warn\([^)]*\);?\s*/g, '');
content = content.replace(/console\.error\([^)]*\);?\s*/g, '');

// Supprimer les commentaires de debug
content = content.replace(/\/\/ Debug:.*\n/g, '');
content = content.replace(/\/\/ Logique dynamique.*\n/g, '');

// Supprimer les espaces vides excessifs
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// Supprimer les lignes vides au début des fonctions
content = content.replace(/{\s*\n\s*\n/g, '{\n');

// Écrire le fichier nettoyé
fs.writeFileSync('src/lib/enrichment-system.ts', content);

console.log('✅ Fichier nettoyé avec succès !');
