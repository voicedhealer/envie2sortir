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

export function useActiveDeals(establishmentId: string): UseActiveDealsResult {
  const [activeDeal, setActiveDeal] = useState<ActiveDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!establishmentId) {
      setLoading(false);
      return;
    }

    const fetchActiveDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        console.log('useActiveDeals - Data received:', data);
        
        // Vérifier que la réponse n'est pas vide
        if (!data || Object.keys(data).length === 0) {
          console.warn('useActiveDeals - Réponse vide reçue');
          setActiveDeal(null);
          return;
        }
        
        if (data.success && data.deals && data.deals.length > 0) {
          // Prendre le premier bon plan actif (le plus récent)
          setActiveDeal(data.deals[0]);
        } else {
          setActiveDeal(null);
        }
      } catch (err) {
        console.error('Erreur fetch active deals:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setActiveDeal(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDeals(); // Charger immédiatement sans délai
  }, [establishmentId]);

  return { activeDeal, loading, error };
}
