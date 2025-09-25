import { randomBytes } from 'crypto';

interface CSRFStore {
  [key: string]: {
    token: string;
    expires: number;
  };
}

const store: CSRFStore = {};

export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  store[sessionId] = {
    token,
    expires: Date.now() + 3600000 // 1 heure
  };
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = store[sessionId];
  if (!stored || stored.expires < Date.now()) {
    return false;
  }
  return stored.token === token;
}

export function cleanupExpiredTokens(): void {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].expires < now) {
      delete store[key];
    }
  });
}

// Nettoyage automatique toutes les heures
setInterval(cleanupExpiredTokens, 3600000);
