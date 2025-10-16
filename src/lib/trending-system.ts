/**
 * Système de calcul de tendance pour les établissements
 * Basé sur les vraies données d'engagement (vues, clics, notes)
 */

export interface TrendingScore {
  score: number;
  isTrending: boolean;
  badges: string[];
}

/**
 * Calcule le score de tendance d'un établissement
 * @param establishment - L'établissement à évaluer
 * @returns Le score de tendance
 */
export function calculateTrendingScore(establishment: any): number {
  const views = establishment.viewsCount || 0;
  const clicks = establishment.clicksCount || 0;
  
  // Score principal basé sur l'engagement
  // Les clics valent plus que les vues car ils indiquent un engagement réel
  let score = (views * 2) + (clicks * 5);
  
  // Bonus note si avis existent (pas obligatoire pour l'équité)
  if (establishment.avgRating && establishment.totalComments > 0) {
    score += establishment.avgRating * 15; // 4.5/5 = +67 points
  }
  
  // Bonus fraîcheur : établissement mis à jour récemment
  if (establishment.lastModifiedAt) {
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(establishment.lastModifiedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpdate < 7) {
      score += 30; // Mis à jour dans la semaine
    } else if (daysSinceUpdate < 30) {
      score += 15; // Mis à jour dans le mois
    }
  }
  
  return Math.round(score);
}

/**
 * Détermine si un établissement est "tendance"
 * @param establishment - L'établissement à évaluer
 * @returns true si l'établissement est tendance
 */
export function isTrending(establishment: any): boolean {
  const score = calculateTrendingScore(establishment);
  return score >= 80 && establishment.viewsCount >= 10;
}

/**
 * Détermine si un établissement est "populaire"
 * @param establishment - L'établissement à évaluer
 * @returns true si l'établissement est populaire
 */
export function isPopular(establishment: any): boolean {
  return (establishment.viewsCount || 0) >= 50;
}

/**
 * Détermine si un établissement est "nouveau"
 * @param establishment - L'établissement à évaluer
 * @returns true si l'établissement est nouveau
 */
export function isNew(establishment: any): boolean {
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(establishment.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceCreation < 14; // Moins de 2 semaines
}

/**
 * Détermine si un établissement est dans le "Top 5 des recherches"
 * Pour l'instant, basé sur le nombre de clics récents
 * TODO: Implémenter un vrai système de tracking des recherches
 * @param establishment - L'établissement à évaluer
 * @returns true si l'établissement est dans le top des recherches
 */
export function isTopSearched(establishment: any): boolean {
  // Pour l'instant, basé sur un ratio clics/vues élevé
  const views = establishment.viewsCount || 0;
  const clicks = establishment.clicksCount || 0;
  
  if (views < 20) return false; // Minimum de vues
  
  const clickRate = clicks / views;
  return clickRate >= 0.3; // Au moins 30% de taux de clic
}

/**
 * Génère tous les badges pour un établissement
 * @param establishment - L'établissement à évaluer
 * @returns Array des badges à afficher
 */
export function getEstablishmentBadges(establishment: any): string[] {
  const badges = [];
  
  // 🔥 Lieu Tendance (score élevé + vues)
  if (isTrending(establishment)) {
    badges.push('🔥 Lieu Tendance');
  }
  
  // ⭐ Populaire (beaucoup de vues)
  if (isPopular(establishment)) {
    badges.push('⭐ Populaire');
  }
  
  // 🆕 Nouveau (créé récemment)
  if (isNew(establishment)) {
    badges.push('🆕 Nouveau');
  }
  
  // 📈 Top 5 recherches (bon taux de clic)
  if (isTopSearched(establishment)) {
    badges.push('📈 Top 5 recherches');
  }
  
  return badges;
}

/**
 * Calcule le score complet avec tous les badges
 * @param establishment - L'établissement à évaluer
 * @returns Objet contenant le score et les badges
 */
export function getTrendingAnalysis(establishment: any): TrendingScore {
  const score = calculateTrendingScore(establishment);
  const badges = getEstablishmentBadges(establishment);
  
  return {
    score,
    isTrending: isTrending(establishment),
    badges
  };
}
