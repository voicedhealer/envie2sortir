/**
 * Utilitaires pour la gestion des abonnements FREE vs PREMIUM vs WAITLIST_BETA
 * Centralise toute la logique métier pour éviter les incohérences
 * WAITLIST_BETA : Premium gratuit avant le lancement officiel
 */

export type SubscriptionType = 'FREE' | 'PREMIUM' | 'WAITLIST_BETA';

export interface SubscriptionFeatures {
  minImages: number;
  maxImages: number;
  canCreateEvents: boolean;
  canUseAdvancedAnalytics: boolean;
  canUsePromotions: boolean;
  canUsePrioritySupport: boolean;
}

/**
 * Définit les fonctionnalités disponibles selon le type d'abonnement
 */
export const SUBSCRIPTION_FEATURES: Record<SubscriptionType, SubscriptionFeatures> = {
  FREE: {
    minImages: 1,
    maxImages: 1,  // 1 photo max (pas d'effet Papillon)
    canCreateEvents: false,
    canUseAdvancedAnalytics: false,
    canUsePromotions: false,
    canUsePrioritySupport: false,
  },
  PREMIUM: {
    minImages: 1,
    maxImages: 5,  // Jusqu'à 5 photos avec effet Papillon
    canCreateEvents: true,
    canUseAdvancedAnalytics: true,
    canUsePromotions: true,
    canUsePrioritySupport: true,
  },
  WAITLIST_BETA: {
    minImages: 1,
    maxImages: 5,  // Jusqu'à 5 photos avec effet Papillon (même que PREMIUM)
    canCreateEvents: true,  // Accès premium gratuit avant le lancement
    canUseAdvancedAnalytics: true,
    canUsePromotions: true,
    canUsePrioritySupport: true,
  },
};

/**
 * Vérifie si un utilisateur a accès à une fonctionnalité Premium
 * WAITLIST_BETA est considéré comme premium (accès gratuit avant le lancement)
 */
export function hasPremiumAccess(subscription: SubscriptionType): boolean {
  return subscription === 'PREMIUM' || subscription === 'WAITLIST_BETA';
}

/**
 * Vérifie si un utilisateur peut créer des événements
 */
export function canCreateEvents(subscription: SubscriptionType): boolean {
  return SUBSCRIPTION_FEATURES[subscription].canCreateEvents;
}

/**
 * Vérifie si un utilisateur peut utiliser les promotions
 */
export function canUsePromotions(subscription: SubscriptionType): boolean {
  return SUBSCRIPTION_FEATURES[subscription].canUsePromotions;
}

/**
 * Retourne le nombre maximum d'images autorisées
 */
export function getMaxImages(subscription: SubscriptionType): number {
  return SUBSCRIPTION_FEATURES[subscription].maxImages;
}

/**
 * Retourne le nombre minimum d'images requises
 */
export function getMinImages(subscription: SubscriptionType): number {
  return SUBSCRIPTION_FEATURES[subscription].minImages;
}

/**
 * Retourne un message d'erreur standard pour les fonctionnalités Premium
 */
export function getPremiumRequiredMessage(feature: string): string {
  return `Fonctionnalité "${feature}" réservée aux abonnements Premium. Mise à niveau requise.`;
}

/**
 * Retourne un message d'erreur API standard pour les fonctionnalités Premium
 */
export function getPremiumRequiredError(feature: string) {
  return {
    error: "Fonctionnalité réservée aux abonnements Premium",
    message: getPremiumRequiredMessage(feature),
    code: "PREMIUM_REQUIRED",
    status: 403
  };
}

/**
 * Valide qu'un utilisateur a le bon niveau d'abonnement pour une action
 */
export function validateSubscriptionAccess(
  subscription: SubscriptionType,
  requiredFeature: keyof SubscriptionFeatures
): { hasAccess: boolean; error?: string } {
  const features = SUBSCRIPTION_FEATURES[subscription];
  const hasAccess = features[requiredFeature];
  
  if (!hasAccess) {
    return {
      hasAccess: false,
      error: getPremiumRequiredMessage(requiredFeature)
    };
  }
  
  return { hasAccess: true };
}

/**
 * Retourne les fonctionnalités disponibles pour un type d'abonnement
 */
export function getAvailableFeatures(subscription: SubscriptionType): string[] {
  const features = SUBSCRIPTION_FEATURES[subscription];
  const availableFeatures: string[] = [];
  
  if (features.canCreateEvents) availableFeatures.push('Événements');
  if (features.canUseAdvancedAnalytics) availableFeatures.push('Analyses avancées');
  if (features.canUsePromotions) availableFeatures.push('Promotions');
  if (features.canUsePrioritySupport) availableFeatures.push('Support prioritaire');
  
  return availableFeatures;
}

/**
 * Retourne le statut d'affichage pour l'UI
 */
export function getSubscriptionDisplayInfo(subscription: SubscriptionType) {
  const isPremium = subscription === 'PREMIUM' || subscription === 'WAITLIST_BETA';
  const label = subscription === 'WAITLIST_BETA' 
    ? 'Beta Premium' 
    : subscription === 'PREMIUM' 
      ? 'Premium' 
      : 'Basic';
  
  const badgeColor = subscription === 'WAITLIST_BETA'
    ? 'bg-purple-100 text-purple-800'  // Badge spécial pour waitlist
    : subscription === 'PREMIUM'
      ? 'bg-orange-100 text-orange-800'
      : 'bg-gray-100 text-gray-800';
  
  return {
    type: subscription,
    label,
    badgeColor,
    features: getAvailableFeatures(subscription),
    minImages: getMinImages(subscription),
    maxImages: getMaxImages(subscription),
    isPremium,
    isWaitlistBeta: subscription === 'WAITLIST_BETA'
  };
}
