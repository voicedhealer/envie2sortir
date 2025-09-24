/**
 * Rate limiting utilities pour la sécurité
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Fenêtre de temps en ms
  max: number; // Nombre max de requêtes
  keyGenerator?: (req: Request) => string;
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator } = options;
  
  return async function rateLimit(req: Request): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req);
    const now = Date.now();
    
    // Nettoyer les entrées expirées
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
    
    const current = store[key];
    
    if (!current) {
      // Première requête
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return {
        success: true,
        remaining: max - 1,
        resetTime: now + windowMs
      };
    }
    
    if (now > current.resetTime) {
      // Fenêtre expirée, reset
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return {
        success: true,
        remaining: max - 1,
        resetTime: now + windowMs
      };
    }
    
    if (current.count >= max) {
      // Limite atteinte
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }
    
    // Incrémenter le compteur
    current.count++;
    return {
      success: true,
      remaining: max - current.count,
      resetTime: current.resetTime
    };
  };
}

function getDefaultKey(req: Request): string {
  // Utiliser l'IP et l'User-Agent pour générer une clé unique
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent}`;
}

// Rate limiters prédéfinis
export const adminRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `admin-${ip}`;
  }
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives max
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads par minute
});
