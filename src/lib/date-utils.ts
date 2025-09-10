/**
 * Utilitaires pour la gestion des dates et fuseaux horaires
 */

/**
 * Convertit une date UTC en heure locale française
 * @param dateString - Date au format ISO string (UTC)
 * @returns Date en heure locale française
 */
export function convertUTCToLocal(dateString: string): Date {
  // Utiliser la méthode native de JavaScript qui gère automatiquement le fuseau horaire
  // new Date() interprète déjà correctement les dates UTC
  return new Date(dateString);
}

/**
 * Formate une date pour l'affichage en français
 * @param dateString - Date au format ISO string (UTC)
 * @param options - Options de formatage
 * @returns Date formatée en français
 */
export function formatDateFrench(
  dateString: string, 
  options: {
    includeTime?: boolean;
    includeYear?: boolean;
    showToday?: boolean;
  } = {}
): string {
  const { includeTime = true, includeYear = true, showToday = true } = options;
  
  const localDate = convertUTCToLocal(dateString);
  const now = new Date();
  
  // Vérifier si c'est aujourd'hui
  if (showToday && localDate.toDateString() === now.toDateString()) {
    if (includeTime) {
      return `Aujourd'hui • ${localDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    return 'Aujourd\'hui';
  }
  
  // Vérifier si c'est demain
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (showToday && localDate.toDateString() === tomorrow.toDateString()) {
    if (includeTime) {
      return `Demain • ${localDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    return 'Demain';
  }
  
  // Formatage standard
  const formatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  
  if (includeYear) {
    formatOptions.year = 'numeric';
  }
  
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }
  
  return localDate.toLocaleDateString('fr-FR', formatOptions);
}

/**
 * Formate une date pour l'affichage complet (début/fin d'événement)
 * @param dateString - Date au format ISO string (UTC)
 * @returns Date formatée complète
 */
export function formatEventDate(dateString: string): string {
  return formatDateFrench(dateString, {
    includeTime: true,
    includeYear: true,
    showToday: true
  });
}

/**
 * Vérifie si un événement est en cours
 * @param startDate - Date de début (UTC)
 * @param endDate - Date de fin (UTC, optionnelle)
 * @returns true si l'événement est en cours
 */
export function isEventInProgress(startDate: string, endDate?: string | null): boolean {
  const now = new Date();
  const eventStart = convertUTCToLocal(startDate);
  const eventEnd = endDate ? convertUTCToLocal(endDate) : eventStart;
  
  return eventStart <= now && eventEnd >= now;
}

/**
 * Vérifie si un événement est à venir
 * @param startDate - Date de début (UTC)
 * @returns true si l'événement est à venir
 */
export function isEventUpcoming(startDate: string): boolean {
  const now = new Date();
  const eventStart = convertUTCToLocal(startDate);
  
  return eventStart > now;
}

/**
 * Formate une durée d'événement
 * @param startDate - Date de début (UTC)
 * @param endDate - Date de fin (UTC)
 * @returns Durée formatée (ex: "2h30" ou "1 jour")
 */
export function formatEventDuration(startDate: string, endDate: string): string {
  const start = convertUTCToLocal(startDate);
  const end = convertUTCToLocal(endDate);
  
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return diffMinutes > 0 ? `${diffHours}h${diffMinutes.toString().padStart(2, '0')}` : `${diffHours}h`;
  } else {
    return `${diffMinutes}min`;
  }
}
