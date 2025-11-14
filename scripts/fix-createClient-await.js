#!/usr/bin/env node

/**
 * Script pour corriger tous les appels à createClient() en ajoutant await
 * Nécessaire pour Next.js 15 où cookies() doit être await
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, '..', 'src');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: const supabase = createClient(); (avec indentation variable)
  const pattern1 = /(\s+)(const\s+\w+\s*=\s*)createClient\(\);/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, (match, indent, prefix) => {
      // Vérifier si on est déjà dans une fonction async
      const beforeMatch = content.substring(0, content.indexOf(match));
      const lastAsync = beforeMatch.lastIndexOf('async');
      const lastFunction = Math.max(
        beforeMatch.lastIndexOf('function'),
        beforeMatch.lastIndexOf('=>')
      );
      
      if (lastAsync > lastFunction) {
        modified = true;
        return `${indent}${prefix}await createClient();`;
      }
      return match;
    });
  }

  // Pattern 2: const supabase = createClient(); (dans une fonction async)
  // On va simplement remplacer tous les cas où createClient() est appelé
  // et s'assurer qu'on est dans un contexte async
  const lines = content.split('\n');
  const newLines = [];
  let inAsyncFunction = false;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Détecter si on entre dans une fonction async
    if (line.includes('async') && (line.includes('function') || line.includes('=>'))) {
      inAsyncFunction = true;
      braceCount = 0;
    }
    
    // Compter les accolades pour savoir quand on sort de la fonction
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceCount += openBraces - closeBraces;
    
    if (braceCount < 0) {
      inAsyncFunction = false;
    }
    
    // Remplacer createClient() par await createClient() si dans async
    if (inAsyncFunction && line.includes('createClient()') && !line.includes('await createClient()')) {
      const newLine = line.replace(/(\s*)(const\s+\w+\s*=\s*)createClient\(\)/, '$1$2await createClient()');
      newLines.push(newLine);
      modified = true;
    } else {
      newLines.push(line);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`✅ Corrigé: ${filePath}`);
    return true;
  }

  return false;
}

// Trouver tous les fichiers TypeScript
console.log('🔍 Recherche des fichiers TypeScript...');
const files = findFiles(srcDir);
console.log(`📁 ${files.length} fichiers trouvés\n`);

let fixedCount = 0;
files.forEach(file => {
  // Ignorer le fichier server.ts car il est déjà corrigé
  if (file.includes('supabase/server.ts')) {
    return;
  }
  
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${file}:`, error.message);
  }
});

console.log(`\n✨ Correction terminée: ${fixedCount} fichiers modifiés`);


