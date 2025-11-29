/**
 * Utilitaires pour gérer la date de lancement officiel du site
 * Permet de calculer le temps restant avant le lancement et de vérifier si le lancement est actif
 */

/**
 * Récupère la date de lancement depuis les variables d'environnement
 * Format attendu : YYYY-MM-DD (ex: 2026-03-15)
 */
function getLaunchDate(): Date {
  const launchDateStr = process.env.LAUNCH_DATE || '2026-03-15';
  const date = new Date(launchDateStr);
  
  // S'assurer que la date est à minuit UTC pour éviter les problèmes de timezone
  date.setUTCHours(0, 0, 0, 0);
  
  return date;
}

/**
 * Vérifie si la date de lancement est atteinte ou dépassée
 * @returns true si le lancement est actif, false sinon
 */
export function isLaunchActive(): boolean {
  const launchDate = getLaunchDate();
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  
  return now >= launchDate;
}

/**
 * Calcule le nombre de jours restants avant le lancement
 * @returns Nombre de jours (peut être négatif si le lancement est passé)
 */
export function getDaysUntilLaunch(): number {
  const launchDate = getLaunchDate();
  const now = new Date();
  
  // Calculer la différence en millisecondes
  const diffMs = launchDate.getTime() - now.getTime();
  
  // Convertir en jours (arrondi vers le bas)
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calcule le temps restant avant le lancement de manière détaillée
 * @returns Objet avec days, hours, minutes
 */
export function getTimeUntilLaunch(): { days: number; hours: number; minutes: number } {
  const launchDate = getLaunchDate();
  const now = new Date();
  
  // Calculer la différence en millisecondes
  const diffMs = launchDate.getTime() - now.getTime();
  
  // Si le lancement est déjà passé, retourner des valeurs à 0
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  
  // Convertir en jours, heures, minutes
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

/**
 * Formate la date de lancement pour l'affichage
 * @param locale Locale pour le formatage (défaut: 'fr-FR')
 * @returns Date formatée (ex: "15 mars 2026")
 */
export function formatLaunchDate(locale: string = 'fr-FR'): string {
  const launchDate = getLaunchDate();
  
  return launchDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formate le temps restant pour l'affichage
 * @returns String formatée (ex: "45 jours, 12 heures, 30 minutes")
 */
export function formatTimeUntilLaunch(): string {
  const { days, hours, minutes } = getTimeUntilLaunch();
  
  if (days <= 0 && hours <= 0 && minutes <= 0) {
    return 'Le lancement est actif !';
  }
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} jour${days > 1 ? 's' : ''}`);
  }
  
  if (hours > 0) {
    parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
  }
  
  if (minutes > 0 && days === 0) {
    // Afficher les minutes seulement si on est à moins d'un jour
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) {
    return 'Le lancement est imminent !';
  }
  
  return parts.join(', ') + ' avant le lancement';
}

