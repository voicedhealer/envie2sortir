import sharp from 'sharp';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Optimise une image pour le web
 */
export async function optimizeImage(
  inputPath: string, 
  outputPath: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<{
  success: boolean;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercentage: number;
}> {
  try {
    const {
      width = 1200,
      height = 1200,
      quality = 85,
      format = 'webp'
    } = options;

    // Obtenir la taille originale
    const originalStats = await sharp(inputPath).metadata();
    const originalSize = originalStats.size || 0;

    // Optimiser l'image
    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFormat(format, { quality })
      .toFile(outputPath);

    // Obtenir la taille optimisée
    const optimizedStats = await sharp(outputPath).metadata();
    const optimizedSize = optimizedStats.size || 0;

    const savings = originalSize - optimizedSize;
    const savingsPercentage = originalSize > 0 ? (savings / originalSize) * 100 : 0;

    return {
      success: true,
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage
    };

  } catch (error) {
    console.error('Erreur lors de l\'optimisation:', error);
    return {
      success: false,
      originalSize: 0,
      optimizedSize: 0,
      savings: 0,
      savingsPercentage: 0
    };
  }
}

/**
 * Génère des miniatures pour une image
 */
export async function generateThumbnails(
  inputPath: string,
  baseOutputPath: string
): Promise<{
  success: boolean;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
}> {
  try {
    const sizes = [
      { name: 'small', width: 150, height: 150 },
      { name: 'medium', width: 300, height: 300 },
      { name: 'large', width: 600, height: 600 }
    ];

    const thumbnails: any = {};

    for (const size of sizes) {
      const outputPath = `${baseOutputPath}_${size.name}.webp`;
      
      await sharp(inputPath)
        .resize(size.width, size.height, { 
          fit: 'cover',
          position: 'center'
        })
        .toFormat('webp', { quality: 80 })
        .toFile(outputPath);

      thumbnails[size.name] = outputPath;
    }

    return {
      success: true,
      thumbnails
    };

  } catch (error) {
    console.error('Erreur lors de la génération des miniatures:', error);
    return {
      success: false,
      thumbnails: {
        small: '',
        medium: '',
        large: ''
      }
    };
  }
}

/**
 * Nettoie les anciens fichiers temporaires
 */
export async function cleanupTempFiles(tempDir: string, maxAgeHours: number = 24) {
  try {
    const { readdir, stat, unlink } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = await readdir(tempDir);
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = join(tempDir, file);
      const stats = await stat(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        await unlink(filePath);
        deletedCount++;
      }
    }

    return {
      success: true,
      deletedCount
    };

  } catch (error) {
    console.error('Erreur lors du nettoyage des fichiers temporaires:', error);
    return {
      success: false,
      deletedCount: 0
    };
  }
}





