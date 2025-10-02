// Export de tous les modules de sécurité
export * from './rate-limit-extended';
export * from './csrf';
export * from './sanitization';
export * from './file-validation';
export * from './security-middleware';

// Configuration de sécurité centralisée
export const SECURITY_CONFIG = {
  // Rate Limiting
  RATE_LIMITS: {
    API: { windowMs: 15 * 60 * 1000, max: 100 },
    SEARCH: { windowMs: 60 * 1000, max: 20 },
    UPLOAD: { windowMs: 60 * 1000, max: 10 }, // Uploads de fichiers
    IMAGE_MANAGEMENT: { windowMs: 60 * 1000, max: 30 }, // Gestion des images (définir principale, supprimer)
    IMAGES_READ: { windowMs: 60 * 1000, max: 200 }, // Lecture d'images
    AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
    ADMIN: { windowMs: 15 * 60 * 1000, max: 5 }
  },
  
  // CSRF
  CSRF_TOKEN_EXPIRY: 3600000, // 1 heure
  
  // File Upload
  MAX_FILE_SIZES: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 20 * 1024 * 1024 // 20MB
  },
  
  // Allowed file types
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'text/plain']
  },
  
  // Allowed extensions
  ALLOWED_EXTENSIONS: {
    IMAGES: ['jpg', 'jpeg', 'png', 'webp'],
    DOCUMENTS: ['pdf', 'txt']
  }
} as const;
