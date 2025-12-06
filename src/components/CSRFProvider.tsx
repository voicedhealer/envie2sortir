'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface CSRFContextType {
  csrfToken: string | null;
  refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/csrf/token');
      if (response.ok) {
        // ✅ CORRECTION : Vérifier que la réponse est bien du JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setCsrfToken(data.token);
        } else {
          // Si ce n'est pas du JSON, c'est probablement une redirection HTML
          console.warn('⚠️ [CSRF] Réponse non-JSON reçue, probablement une redirection');
        }
      }
    } catch (error: any) {
      // ✅ CORRECTION : Ne pas logger l'erreur si c'est juste une redirection en mode wait
      if (error.message && error.message.includes('JSON')) {
        console.warn('⚠️ [CSRF] Impossible de parser la réponse JSON (probablement une redirection)');
      } else {
        console.error('Failed to refresh CSRF token:', error);
      }
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <CSRFContext.Provider value={{ csrfToken, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
}

export function useCSRF() {
  const context = useContext(CSRFContext);
  if (context === undefined) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}

// Composant pour ajouter automatiquement le token CSRF aux formulaires
export function CSRFInput() {
  const { csrfToken } = useCSRF();
  
  if (!csrfToken) return null;
  
  return (
    <input 
      type="hidden" 
      name="csrfToken" 
      value={csrfToken}
    />
  );
}
