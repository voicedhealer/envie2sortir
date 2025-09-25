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
        const data = await response.json();
        setCsrfToken(data.token);
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
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
