import { useCallback } from 'react';

/**
 * Hook pour gérer les statistiques d'établissement
 */
export function useEstablishmentStats() {
  const incrementView = useCallback(async (establishmentId: string) => {
    try {
      const response = await fetch(`/api/establishments/${establishmentId}/stats?action=view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'incrémentation des vues:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('✅ Vue incrémentée:', result);
      return true;
    } catch (error) {
      console.error('❌ Erreur incrémentation vue:', error);
      return false;
    }
  }, []);

  const incrementClick = useCallback(async (establishmentId: string) => {
    try {
      const response = await fetch(`/api/establishments/${establishmentId}/stats?action=click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'incrémentation des clics:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('✅ Clic incrémenté:', result);
      return true;
    } catch (error) {
      console.error('❌ Erreur incrémentation clic:', error);
      return false;
    }
  }, []);

  return {
    incrementView,
    incrementClick
  };
}
