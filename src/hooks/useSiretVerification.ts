import { useState, useCallback } from 'react';
import { SiretVerificationResult } from '@/types/siret.types';

interface UseSiretVerificationReturn {
  isLoading: boolean;
  error: string | null;
  verificationResult: SiretVerificationResult | null;
  verifySiret: (siret: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function useSiretVerification(): UseSiretVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<SiretVerificationResult | null>(null);

  const verifySiret = useCallback(async (siret: string) => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/siret/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siret }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result: SiretVerificationResult = await response.json();
      setVerificationResult(result);

      if (!result.isValid) {
        setError(result.error || 'Erreur de vérification');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setVerificationResult({
        isValid: false,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setVerificationResult(null);
  }, []);

  return {
    isLoading,
    error,
    verificationResult,
    verifySiret,
    clearError,
    reset
  };
}
