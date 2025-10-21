import { useState, useEffect } from 'react';

interface ActiveDeal {
  id: string;
  title: string;
  description: string;
  modality?: string | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  dateDebut: Date | string;
  dateFin: Date | string;
  heureDebut?: string | null;
  heureFin?: string | null;
  isActive: boolean;
  promoUrl?: string | null;
}

interface UseActiveDealsResult {
  activeDeal: ActiveDeal | null;
  loading: boolean;
  error: string | null;
}

// ✅ Cache global pour éviter les requêtes multiples
const dealsCache = new Map<string, { data: ActiveDeal | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<ActiveDeal | null>>();

export function useActiveDeals(establishmentId: string): UseActiveDealsResult {
  const [activeDeal, setActiveDeal] = useState<ActiveDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!establishmentId) {
      setLoading(false);
      return;
    }

    const fetchActiveDeals = async (): Promise<ActiveDeal | null> => {
      // ✅ Vérifier le cache d'abord
      const cached = dealsCache.get(establishmentId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // console.log(`✅ useActiveDeals - Cache hit pour ${establishmentId}`); // Log commenté pour réduire le bruit
        return cached.data;
      }

      // ✅ Éviter les requêtes multiples simultanées
      if (pendingRequests.has(establishmentId)) {
        // console.log(`⏳ useActiveDeals - Requête en cours pour ${establishmentId}, attente...`); // Log commenté
        return pendingRequests.get(establishmentId)!;
      }

      const requestPromise = (async () => {
        try {
          console.log(`🚀 useActiveDeals - Nouvelle requête pour ${establishmentId}`);
          
          const response = await fetch(`/api/deals/active/${establishmentId}`);
          
          if (!response.ok) {
            let errorData = {};
            try {
              errorData = await response.json();
            } catch (parseError) {
              console.warn('useActiveDeals - Impossible de parser la réponse JSON:', parseError);
            }
            console.error('useActiveDeals - Response not OK:', {
              status: response.status,
              statusText: response.statusText,
              errorData
            });
            throw new Error(errorData.error || `Erreur HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Vérifier que la réponse n'est pas vide
          if (!data || Object.keys(data).length === 0) {
            console.warn('useActiveDeals - Réponse vide reçue');
            return null;
          }
          
          let result: ActiveDeal | null = null;
          if (data.success && data.deals && data.deals.length > 0) {
            // Prendre le premier bon plan actif (le plus récent)
            result = data.deals[0];
          }

          // ✅ Mettre en cache le résultat
          dealsCache.set(establishmentId, { data: result, timestamp: Date.now() });
          console.log(`💾 useActiveDeals - Mis en cache pour ${establishmentId}:`, result ? 'Deal trouvé' : 'Aucun deal');

          return result;
        } catch (err) {
          console.error('Erreur fetch active deals:', err);
          throw err;
        } finally {
          // ✅ Nettoyer la requête en cours
          pendingRequests.delete(establishmentId);
        }
      })();

      pendingRequests.set(establishmentId, requestPromise);
      return requestPromise;
    };

    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchActiveDeals();
        setActiveDeal(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setActiveDeal(null);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [establishmentId]);

  return { activeDeal, loading, error };
}
