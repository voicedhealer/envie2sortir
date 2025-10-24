import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  freedSpace: number;
  errors: string[];
  deletedFiles: string[];
}

/**
 * Nettoie les fichiers orphelins (non référencés dans la base de données)
 * SÉCURISÉ : Ne supprime que les fichiers non référencés en base
 */
export async function cleanupOrphanedFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    deletedCount: 0,
    freedSpace: 0,
    errors: [],
    deletedFiles: []
  };

  try {
    console.log('🧹 Début du nettoyage des fichiers orphelins...');
    
    // 1. Récupérer tous les chemins d'images en base de données
    console.log('📊 Récupération des images en base de données...');
    const dbImages = await prisma.image.findMany({
      select: { url: true }
    });
    
    const dbPaths = new Set(dbImages.map(img => img.url));
    console.log(`✅ ${dbPaths.size} images référencées en base`);
    
    // 2. Scanner les fichiers physiques
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Dossier uploads introuvable');
      result.errors.push('Dossier uploads introuvable');
      return result;
    }
    
    const physicalFiles = [];
    const scanDirectory = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath, relativeItemPath);
        } else if (stat.isFile()) {
          const filePath = '/uploads/' + relativeItemPath.replace(/\\/g, '/');
          physicalFiles.push({
            path: filePath,
            fullPath: fullPath,
            size: stat.size
          });
        }
      }
    };
    
    scanDirectory(uploadsDir);
    console.log(`📁 ${physicalFiles.length} fichiers physiques trouvés`);
    
    // 3. Identifier et supprimer les fichiers orphelins
    const orphanedFiles = physicalFiles.filter(file => !dbPaths.has(file.path));
    
    console.log(`🗑️  ${orphanedFiles.length} fichiers orphelins identifiés`);
    
    for (const file of orphanedFiles) {
      try {
        // Double vérification : s'assurer que le fichier n'est pas référencé
        if (!dbPaths.has(file.path)) {
          await fs.promises.unlink(file.fullPath);
          result.deletedCount++;
          result.freedSpace += file.size;
          result.deletedFiles.push(file.path);
          console.log(`✅ Supprimé: ${file.path}`);
        }
      } catch (error) {
        const errorMsg = `Erreur suppression ${file.path}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }
    
    console.log(`✅ Nettoyage terminé: ${result.deletedCount} fichiers supprimés`);
    console.log(`💾 Espace libéré: ${(result.freedSpace / 1024 / 1024).toFixed(2)} MB`);
    
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur lors du nettoyage: ${error}`);
    console.error('❌ Erreur fatale:', error);
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Nettoie les anciens fichiers (plus vieux que X jours)
 */
export async function cleanupOldFiles(daysOld: number = 30): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    deletedCount: 0,
    freedSpace: 0,
    errors: []
  };

  try {
    // Pour l'instant, on retourne un résultat vide
    // TODO: Implémenter la logique de nettoyage des anciens fichiers
    console.log(`Nettoyage des fichiers plus anciens que ${daysOld} jours - fonctionnalité à implémenter`);
    
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur lors du nettoyage: ${error}`);
    return result;
  }
}
