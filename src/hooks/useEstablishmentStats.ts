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
        // 403 signifie que l'établissement n'est pas disponible publiquement
        // C'est normal pour les établissements en attente ou rejetés, on ignore silencieusement
        if (response.status === 403) {
          console.log('ℹ️ Vue non comptabilisée (établissement non public)');
          return false;
        }
        console.warn('⚠️ Erreur lors de l\'incrémentation des vues:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('✅ Vue incrémentée:', result);
      return true;
    } catch (error) {
      // Erreur silencieuse - ne pas perturber l'expérience utilisateur
      console.debug('Incrémentation vue ignorée:', error);
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
        // 403 signifie que l'établissement n'est pas disponible publiquement
        // C'est normal pour les établissements en attente ou rejetés, on ignore silencieusement
        if (response.status === 403) {
          console.log('ℹ️ Clic non comptabilisé (établissement non public)');
          return false;
        }
        console.warn('⚠️ Erreur lors de l\'incrémentation des clics:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('✅ Clic incrémenté:', result);
      return true;
    } catch (error) {
      // Erreur silencieuse - ne pas perturber l'expérience utilisateur
      console.debug('Incrémentation clic ignorée:', error);
      return false;
    }
  }, []);

  return {
    incrementView,
    incrementClick
  };
}
