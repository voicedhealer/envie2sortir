interface CSRFStore {
  [key: string]: {
    token: string;
    expires: number;
  };
}

const store: CSRFStore = {};

export async function generateCSRFToken(sessionId: string): Promise<string> {
  // Utiliser l'API Web Crypto au lieu de Node.js crypto
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
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

// Nettoyage automatique - sera appelé manuellement
// setInterval n'est pas supporté dans l'Edge Runtime
