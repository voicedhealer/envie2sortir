import sharp from 'sharp';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  progressive?: boolean;
}

interface OptimizedImage {
  buffer: Buffer;
  format: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export class ImageOptimizer {
  private static readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'webp',
    progressive: true
  };

  /**
   * Optimise une image selon les paramètres fournis
   */
  static async optimize(
    inputBuffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      let pipeline = sharp(inputBuffer);
      
      // Redimensionner si nécessaire
      if (opts.width || opts.height) {
        pipeline = pipeline.resize(opts.width, opts.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Appliquer l'optimisation selon le format
      switch (opts.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: opts.quality,
            progressive: opts.progressive,
            mozjpeg: true
          });
          break;
          
        case 'png':
          pipeline = pipeline.png({
            quality: opts.quality,
            progressive: opts.progressive,
            compressionLevel: 9
          });
          break;
          
        case 'webp':
          pipeline = pipeline.webp({
            quality: opts.quality,
            lossless: false
          });
          break;
          
        case 'avif':
          pipeline = pipeline.avif({
            quality: opts.quality,
            lossless: false
          });
          break;
          
        default:
          throw new Error(`Format non supporté: ${opts.format}`);
      }

      const buffer = await pipeline.toBuffer();
      const metadata = await sharp(buffer).metadata();

      return {
        buffer,
        format: opts.format,
        size: buffer.length,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'optimisation de l'image: ${error}`);
    }
  }

  /**
   * Génère plusieurs versions optimisées d'une image
   */
  static async generateResponsiveImages(
    inputBuffer: Buffer,
    baseOptions: ImageOptimizationOptions = {}
  ): Promise<Record<string, OptimizedImage>> {
    const variants = [
      { suffix: 'thumbnail', width: 150, height: 150, quality: 80 },
      { suffix: 'small', width: 400, height: 300, quality: 85 },
      { suffix: 'medium', width: 800, height: 600, quality: 85 },
      { suffix: 'large', width: 1200, height: 900, quality: 90 },
      { suffix: 'xlarge', width: 1920, height: 1080, quality: 90 }
    ];

    const results: Record<string, OptimizedImage> = {};

    for (const variant of variants) {
      const options = {
        ...baseOptions,
        width: variant.width,
        height: variant.height,
        quality: variant.quality
      };

      results[variant.suffix] = await this.optimize(inputBuffer, options);
    }

    return results;
  }

  /**
   * Optimise une image pour le web avec les meilleurs paramètres
   */
  static async optimizeForWeb(
    inputBuffer: Buffer,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<{
    webp: OptimizedImage;
    fallback: OptimizedImage;
  }> {
    const webpOptions: ImageOptimizationOptions = {
      width: maxWidth,
      height: maxHeight,
      quality: 85,
      format: 'webp'
    };

    const fallbackOptions: ImageOptimizationOptions = {
      width: maxWidth,
      height: maxHeight,
      quality: 90,
      format: 'jpeg',
      progressive: true
    };

    const [webp, fallback] = await Promise.all([
      this.optimize(inputBuffer, webpOptions),
      this.optimize(inputBuffer, fallbackOptions)
    ]);

    return { webp, fallback };
  }

  /**
   * Vérifie si une image est déjà optimisée
   */
  static async isOptimized(
    inputBuffer: Buffer,
    targetFormat: string,
    maxSize: number,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<boolean> {
    try {
      const metadata = await sharp(inputBuffer).metadata();
      
      // Vérifier la taille du fichier
      if (inputBuffer.length > maxSize) {
        return false;
      }

      // Vérifier les dimensions
      if (maxWidth && (metadata.width || 0) > maxWidth) {
        return false;
      }
      
      if (maxHeight && (metadata.height || 0) > maxHeight) {
        return false;
      }

      // Vérifier le format
      if (metadata.format !== targetFormat) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calcule les statistiques d'optimisation
   */
  static async getOptimizationStats(
    originalBuffer: Buffer,
    optimizedBuffer: Buffer
  ): Promise<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    spaceSaved: number;
    spaceSavedPercent: number;
  }> {
    const originalSize = originalBuffer.length;
    const optimizedSize = optimizedBuffer.length;
    const spaceSaved = originalSize - optimizedSize;
    const compressionRatio = optimizedSize / originalSize;
    const spaceSavedPercent = (spaceSaved / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      compressionRatio,
      spaceSaved,
      spaceSavedPercent
    };
  }
}

// Configuration pour différents types d'images
export const IMAGE_PRESETS = {
  // Images de profil utilisateur
  profile: {
    width: 200,
    height: 200,
    quality: 90,
    format: 'webp' as const
  },
  
  // Images d'établissements
  establishment: {
    width: 1200,
    height: 800,
    quality: 85,
    format: 'webp' as const
  },
  
  // Miniatures
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp' as const
  },
  
  // Images d'événements
  event: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp' as const
  },
  
  // Images de haute qualité
  highQuality: {
    width: 1920,
    height: 1080,
    quality: 95,
    format: 'webp' as const
  }
} as const;

// Fonction utilitaire pour optimiser avec un preset
export async function optimizeWithPreset(
  inputBuffer: Buffer,
  preset: keyof typeof IMAGE_PRESETS
): Promise<OptimizedImage> {
  return ImageOptimizer.optimize(inputBuffer, IMAGE_PRESETS[preset]);
}

// Validation des formats supportés
export const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'avif'] as const;
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
] as const;

export function isValidImageFormat(format: string): boolean {
  return SUPPORTED_FORMATS.includes(format.toLowerCase() as any);
}

export function isValidImageMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType as any);
}
