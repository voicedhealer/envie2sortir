/**
 * Utilitaires pour gérer les bons plans journaliers
 */

interface DailyDeal {
  id: string;
  title: string;
  description: string;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  dateDebut: Date | string;
  dateFin: Date | string;
  heureDebut?: string | null;
  heureFin?: string | null;
  isActive: boolean;
}

/**
 * Vérifie si un bon plan est actif (dans sa période de validité)
 */
export function isDealActive(deal: DailyDeal): boolean {
  if (!deal.isActive) return false;

  const now = new Date();
  const dateDebut = new Date(deal.dateDebut);
  const dateFin = new Date(deal.dateFin);

  // Vérifier si on est dans la période de dates
  if (now < dateDebut || now > dateFin) {
    return false;
  }

  // Si pas d'horaires spécifiques, le bon plan est actif toute la journée
  if (!deal.heureDebut && !deal.heureFin) {
    return true;
  }

  // Vérifier si on est dans les horaires
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Si seulement heure de début définie
  if (deal.heureDebut && !deal.heureFin) {
    return currentTime >= deal.heureDebut;
  }
  
  // Si seulement heure de fin définie
  if (!deal.heureDebut && deal.heureFin) {
    return currentTime <= deal.heureFin;
  }
  
  // Si les deux heures sont définies
  return currentTime >= deal.heureDebut && currentTime <= deal.heureFin;
}

/**
 * Formater l'affichage des horaires d'un bon plan
 */
export function formatDealTime(deal: DailyDeal): string {
  const dateDebut = new Date(deal.dateDebut);
  const dateFin = new Date(deal.dateFin);
  
  // Si c'est le même jour
  const isSameDay = dateDebut.toDateString() === dateFin.toDateString();
  
  if (isSameDay) {
    const today = new Date();
    const isToday = dateDebut.toDateString() === today.toDateString();
    
    if (isToday) {
      if (deal.heureDebut && deal.heureFin) {
        return `Aujourd'hui de ${deal.heureDebut} à ${deal.heureFin}`;
      }
      return 'Aujourd\'hui';
    } else {
      const dateStr = dateDebut.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      if (deal.heureDebut && deal.heureFin) {
        return `Le ${dateStr} de ${deal.heureDebut} à ${deal.heureFin}`;
      }
      return `Le ${dateStr}`;
    }
  }
  
  // Si c'est sur plusieurs jours
  const dateDebutStr = dateDebut.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long' 
  });
  const dateFinStr = dateFin.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long' 
  });
  
  return `Du ${dateDebutStr} au ${dateFinStr}`;
}

/**
 * Formater uniquement la date/jour d'un bon plan (sans les horaires)
 */
export function formatDealDate(deal: DailyDeal): string {
  const dateDebut = new Date(deal.dateDebut);
  const dateFin = new Date(deal.dateFin);
  
  // Si c'est le même jour
  const isSameDay = dateDebut.toDateString() === dateFin.toDateString();
  
  if (isSameDay) {
    const today = new Date();
    const isToday = dateDebut.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Aujourd\'hui';
    } else {
      const dateStr = dateDebut.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      return `Le ${dateStr}`;
    }
  }
  
  // Si c'est sur plusieurs jours
  const dateDebutStr = dateDebut.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long' 
  });
  const dateFinStr = dateFin.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long' 
  });
  
  return `Du ${dateDebutStr} au ${dateFinStr}`;
}

/**
 * Obtenir la clé localStorage pour tracker le modal
 */
export function getDealStorageKey(dealId: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `deal-modal-seen-${dealId}-${today}`;
}

/**
 * Vérifier si l'utilisateur a déjà vu le modal aujourd'hui
 */
export function hasSeenDealToday(dealId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const key = getDealStorageKey(dealId);
  return localStorage.getItem(key) === 'true';
}

/**
 * Marquer le modal comme vu
 */
export function markDealAsSeen(dealId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = getDealStorageKey(dealId);
  localStorage.setItem(key, 'true');
}

/**
 * Formater le prix avec le symbole €
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '';
  return `${price.toFixed(2)} €`;
}

/**
 * Calculer le pourcentage de réduction
 */
export function calculateDiscount(originalPrice: number | null | undefined, discountedPrice: number | null | undefined): number {
  if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}


