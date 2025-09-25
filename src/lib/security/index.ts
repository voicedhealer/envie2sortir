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
    UPLOAD: { windowMs: 60 * 1000, max: 5 },
    AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
    ADMIN: { windowMs: 15 * 60 * 1000, max: 5 }
  },
  
  // CSRF
  CSRF_TOKEN_EXPIRY: 3600000, // 1 heure
  
  // File Upload
  MAX_FILE_SIZES: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024 // 10MB
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
