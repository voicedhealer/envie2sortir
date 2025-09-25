export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+=/gi, '') // Supprimer les event handlers
    .replace(/data:/gi, '') // Supprimer data: URLs
    .replace(/vbscript:/gi, '') // Supprimer vbscript:
    .trim();
}

export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';
  
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '')
    .trim();
}

export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^0-9+]/g, '')
    .trim();
}
