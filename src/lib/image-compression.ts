/**
 * Compression d'image côté client avant upload
 * Utilise Canvas API pour redimensionner et compresser les images
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compresse une image pour réduire sa taille
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeMB = 5
  } = options;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Si le fichier est déjà assez petit, le retourner tel quel
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions en conservant le ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Créer un canvas pour redimensionner et compresser
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression'));
              return;
            }

            // Si après compression c'est encore trop gros, réduire la qualité progressivement
            if (blob.size > maxSizeBytes) {
              compressWithLowerQuality(canvas, quality, maxSizeBytes, resolve, reject);
            } else {
              // Créer un nouveau File avec le blob compressé
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'), // Renommer en .jpg
                {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                }
              );
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresse avec une qualité réduite progressivement jusqu'à atteindre la taille cible
 */
function compressWithLowerQuality(
  canvas: HTMLCanvasElement,
  initialQuality: number,
  maxSizeBytes: number,
  resolve: (file: File) => void,
  reject: (error: Error) => void
) {
  let currentQuality = initialQuality;
  const minQuality = 0.5;
  const qualityStep = 0.1;

  const tryCompress = () => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Erreur lors de la compression'));
          return;
        }

        if (blob.size <= maxSizeBytes || currentQuality <= minQuality) {
          const compressedFile = new File(
            [blob],
            'compressed-image.jpg',
            {
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );
          resolve(compressedFile);
        } else {
          currentQuality -= qualityStep;
          tryCompress();
        }
      },
      'image/jpeg',
      currentQuality
    );
  };

  tryCompress();
}

/**
 * Vérifie si une image doit être compressée
 */
export function shouldCompressImage(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

