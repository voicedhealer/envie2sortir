interface FileValidationOptions {
  maxSize: number; // en bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

export function validateFile(
  file: File, 
  options: FileValidationOptions
): { valid: boolean; error?: string } {
  // Vérifier la taille
  if (file.size > options.maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille max: ${Math.round(options.maxSize / 1024 / 1024)}MB`
    };
  }

  // Vérifier le type MIME
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types autorisés: ${options.allowedTypes.join(', ')}`
    };
  }

  // Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !options.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extension non autorisée. Extensions autorisées: ${options.allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

export const IMAGE_VALIDATION: FileValidationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
};

export const DOCUMENT_VALIDATION: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'text/plain'],
  allowedExtensions: ['pdf', 'txt']
};
