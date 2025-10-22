import sharp from 'sharp';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Configuration des tailles d'images pour différents usages
 */
export const IMAGE_SIZES = {
  // Images d'établissement (page publique)
  establishment: {
    hero: { width: 1200, height: 800, quality: 90 }, // Image principale
    card: { width: 400, height: 300, quality: 85 },  // Cartes de recherche
    thumbnail: { width: 150, height: 150, quality: 80 } // Miniatures
  },
  
  // Images de bons plans
  deals: {
    main: { width: 800, height: 600, quality: 85 },   // Affichage principal
    card: { width: 300, height: 200, quality: 80 },  // Cartes
    thumbnail: { width: 100, height: 100, quality: 75 } // Miniatures
  },
  
  // Images de menus
  menus: {
    main: { width: 1000, height: 1400, quality: 90 }, // PDF converti
    preview: { width: 400, height: 560, quality: 85 }, // Aperçu
    thumbnail: { width: 150, height: 210, quality: 80 } // Miniatures
  }
};

/**
 * Optimise une image pour un usage spécifique
 */
export async function optimizeImageForUsage(
  inputPath: string,
  outputDir: string,
  usage: 'establishment' | 'deals' | 'menus',
  variant: 'hero' | 'card' | 'thumbnail' | 'main' | 'preview'
): Promise<{
  success: boolean;
  outputPath: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercentage: number;
}> {
  try {
    const config = IMAGE_SIZES[usage][variant];
    if (!config) {
      throw new Error(`Configuration non trouvée pour ${usage}.${variant}`);
    }

    // Créer le dossier de sortie s'il n'existe pas
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Générer le nom de fichier optimisé
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const outputFileName = `${timestamp}_${randomString}_${variant}.webp`;
    const outputPath = join(outputDir, outputFileName);

    // Obtenir la taille originale
    const originalStats = await sharp(inputPath).metadata();
    const originalSize = originalStats.size || 0;

    // Optimiser selon l'usage
    let sharpInstance = sharp(inputPath);

    if (usage === 'establishment' && variant === 'hero') {
      // Pour les images d'établissement principales : qualité maximale
      sharpInstance = sharpInstance
        .resize(config.width, config.height, { 
          fit: 'cover',
          position: 'center'
        })
        .toFormat('webp', { quality: config.quality });
    } else if (usage === 'deals') {
      // Pour les bons plans : optimisation équilibrée
      sharpInstance = sharpInstance
        .resize(config.width, config.height, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat('webp', { quality: config.quality });
    } else if (usage === 'menus') {
      // Pour les menus : format portrait optimisé
      sharpInstance = sharpInstance
        .resize(config.width, config.height, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat('webp', { quality: config.quality });
    } else {
      // Par défaut : redimensionnement intelligent
      sharpInstance = sharpInstance
        .resize(config.width, config.height, { 
          fit: 'cover',
          position: 'center'
        })
        .toFormat('webp', { quality: config.quality });
    }

    await sharpInstance.toFile(outputPath);

    // Calculer les économies
    const optimizedStats = await sharp(outputPath).metadata();
    const optimizedSize = optimizedStats.size || 0;
    const savings = originalSize - optimizedSize;
    const savingsPercentage = originalSize > 0 ? (savings / originalSize) * 100 : 0;

    return {
      success: true,
      outputPath,
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage
    };

  } catch (error) {
    console.error('Erreur lors de l\'optimisation:', error);
    return {
      success: false,
      outputPath: '',
      originalSize: 0,
      optimizedSize: 0,
      savings: 0,
      savingsPercentage: 0
    };
  }
}

/**
 * Génère toutes les variantes d'une image
 */
export async function generateAllImageVariants(
  inputPath: string,
  outputDir: string,
  usage: 'establishment' | 'deals' | 'menus'
): Promise<{
  success: boolean;
  variants: Record<string, string>;
  totalSavings: number;
  totalSavingsPercentage: number;
}> {
  try {
    const variants: Record<string, string> = {};
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    // Générer toutes les variantes selon l'usage
    const variantKeys = Object.keys(IMAGE_SIZES[usage]) as Array<keyof typeof IMAGE_SIZES[typeof usage]>;

    for (const variant of variantKeys) {
      const result = await optimizeImageForUsage(inputPath, outputDir, usage, variant);
      
      if (result.success) {
        variants[variant] = result.outputPath;
        totalOriginalSize += result.originalSize;
        totalOptimizedSize += result.optimizedSize;
      }
    }

    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const totalSavingsPercentage = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;

    return {
      success: true,
      variants,
      totalSavings,
      totalSavingsPercentage
    };

  } catch (error) {
    console.error('Erreur lors de la génération des variantes:', error);
    return {
      success: false,
      variants: {},
      totalSavings: 0,
      totalSavingsPercentage: 0
    };
  }
}

/**
 * Upload vers Cloudinary (optionnel)
 */
export async function uploadToCloudinary(
  imagePath: string,
  folder: string = 'envie2sortir'
): Promise<{
  success: boolean;
  publicId: string;
  url: string;
  secureUrl: string;
}> {
  try {
    // Cette fonction nécessite l'installation de cloudinary
    // npm install cloudinary
    const cloudinary = require('cloudinary').v2;
    
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto'
    });

    return {
      success: true,
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url
    };

  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    return {
      success: false,
      publicId: '',
      url: '',
      secureUrl: ''
    };
  }
}

/**
 * Nettoie les fichiers temporaires après optimisation
 */
export async function cleanupTempFiles(tempPath: string): Promise<boolean> {
  try {
    await unlink(tempPath);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier temporaire:', error);
    return false;
  }
}


