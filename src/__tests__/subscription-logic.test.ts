/**
 * Tests automatisés pour la logique de différenciation FREE vs PREMIUM
 * Vérifie que les deux états sont toujours distingués correctement
 */

import { 
  hasPremiumAccess, 
  canCreateEvents, 
  canUsePromotions, 
  getMaxImages,
  getMinImages, 
  getPremiumRequiredMessage,
  getPremiumRequiredError,
  validateSubscriptionAccess,
  getAvailableFeatures,
  getSubscriptionDisplayInfo,
  SUBSCRIPTION_FEATURES
} from '@/lib/subscription-utils';

describe('Logique de différenciation FREE vs PREMIUM', () => {
  
  describe('Fonctions de vérification d\'accès', () => {
    test('hasPremiumAccess - FREE doit retourner false', () => {
      expect(hasPremiumAccess('FREE')).toBe(false);
    });

    test('hasPremiumAccess - PREMIUM doit retourner true', () => {
      expect(hasPremiumAccess('PREMIUM')).toBe(true);
    });

    test('canCreateEvents - FREE doit retourner false', () => {
      expect(canCreateEvents('FREE')).toBe(false);
    });

    test('canCreateEvents - PREMIUM doit retourner true', () => {
      expect(canCreateEvents('PREMIUM')).toBe(true);
    });

    test('canUsePromotions - FREE doit retourner false', () => {
      expect(canUsePromotions('FREE')).toBe(false);
    });

    test('canUsePromotions - PREMIUM doit retourner true', () => {
      expect(canUsePromotions('PREMIUM')).toBe(true);
    });
  });

  describe('Limites par abonnement', () => {
    test('getMinImages - FREE doit retourner 1', () => {
      expect(getMinImages('FREE')).toBe(1);
    });

    test('getMinImages - PREMIUM doit retourner 1', () => {
      expect(getMinImages('PREMIUM')).toBe(1);
    });

    test('getMaxImages - FREE doit retourner 2', () => {
      expect(getMaxImages('FREE')).toBe(2);
    });

    test('getMaxImages - PREMIUM doit retourner 5', () => {
      expect(getMaxImages('PREMIUM')).toBe(5);
    });
  });

  describe('Messages d\'erreur', () => {
    test('getPremiumRequiredMessage doit retourner un message explicite', () => {
      const message = getPremiumRequiredMessage('Événements');
      expect(message).toContain('Événements');
      expect(message).toContain('Premium');
      expect(message).toContain('Mise à niveau requise');
    });

    test('getPremiumRequiredError doit retourner un objet d\'erreur standardisé', () => {
      const error = getPremiumRequiredError('Événements');
      expect(error).toHaveProperty('error');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('code', 'PREMIUM_REQUIRED');
      expect(error).toHaveProperty('status', 403);
    });
  });

  describe('Validation d\'accès', () => {
    test('validateSubscriptionAccess - FREE pour canCreateEvents doit échouer', () => {
      const result = validateSubscriptionAccess('FREE', 'canCreateEvents');
      expect(result.hasAccess).toBe(false);
      expect(result.error).toContain('Premium');
    });

    test('validateSubscriptionAccess - PREMIUM pour canCreateEvents doit réussir', () => {
      const result = validateSubscriptionAccess('PREMIUM', 'canCreateEvents');
      expect(result.hasAccess).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('validateSubscriptionAccess - FREE pour maxImages doit réussir', () => {
      const result = validateSubscriptionAccess('FREE', 'maxImages');
      expect(result.hasAccess).toBe(true);
    });
  });

  describe('Fonctionnalités disponibles', () => {
    test('getAvailableFeatures - FREE doit retourner un tableau vide', () => {
      const features = getAvailableFeatures('FREE');
      expect(features).toEqual([]);
    });

    test('getAvailableFeatures - PREMIUM doit retourner toutes les fonctionnalités', () => {
      const features = getAvailableFeatures('PREMIUM');
      expect(features).toContain('Événements');
      expect(features).toContain('Analyses avancées');
      expect(features).toContain('Promotions');
      expect(features).toContain('Support prioritaire');
    });
  });

  describe('Informations d\'affichage', () => {
    test('getSubscriptionDisplayInfo - FREE doit avoir les bonnes propriétés', () => {
      const info = getSubscriptionDisplayInfo('FREE');
      expect(info.type).toBe('FREE');
      expect(info.label).toBe('Basic');
      expect(info.badgeColor).toBe('bg-gray-100 text-gray-800');
      expect(info.features).toEqual([]);
      expect(info.minImages).toBe(1);
      expect(info.maxImages).toBe(2);
    });

    test('getSubscriptionDisplayInfo - PREMIUM doit avoir les bonnes propriétés', () => {
      const info = getSubscriptionDisplayInfo('PREMIUM');
      expect(info.type).toBe('PREMIUM');
      expect(info.label).toBe('Premium');
      expect(info.badgeColor).toBe('bg-orange-100 text-orange-800');
      expect(info.features.length).toBeGreaterThan(0);
      expect(info.minImages).toBe(1);
      expect(info.maxImages).toBe(5);
    });
  });

  describe('Cohérence des fonctionnalités', () => {
    test('FREE ne doit avoir aucune fonctionnalité Premium', () => {
      const features = SUBSCRIPTION_FEATURES.FREE;
      expect(features.canCreateEvents).toBe(false);
      expect(features.canUseAdvancedAnalytics).toBe(false);
      expect(features.canUsePromotions).toBe(false);
      expect(features.canUsePrioritySupport).toBe(false);
      expect(features.minImages).toBe(1);
      expect(features.maxImages).toBe(2);
    });

    test('PREMIUM doit avoir toutes les fonctionnalités', () => {
      const features = SUBSCRIPTION_FEATURES.PREMIUM;
      expect(features.canCreateEvents).toBe(true);
      expect(features.canUseAdvancedAnalytics).toBe(true);
      expect(features.canUsePromotions).toBe(true);
      expect(features.canUsePrioritySupport).toBe(true);
      expect(features.minImages).toBe(1);
      expect(features.maxImages).toBe(5);
    });
  });

  describe('Cas limites et validation', () => {
    test('Les deux types d\'abonnement doivent être mutuellement exclusifs', () => {
      const standardFeatures = SUBSCRIPTION_FEATURES.FREE;
      const premiumFeatures = SUBSCRIPTION_FEATURES.PREMIUM;
      
      // Aucune fonctionnalité ne doit être vraie pour les deux
      expect(standardFeatures.canCreateEvents).not.toBe(premiumFeatures.canCreateEvents);
      expect(standardFeatures.canUseAdvancedAnalytics).not.toBe(premiumFeatures.canUseAdvancedAnalytics);
      expect(standardFeatures.canUsePromotions).not.toBe(premiumFeatures.canUsePromotions);
      expect(standardFeatures.canUsePrioritySupport).not.toBe(premiumFeatures.canUsePrioritySupport);
    });

    test('Les limites d\'images doivent être correctes', () => {
      // Les deux plans ont le même minimum
      expect(SUBSCRIPTION_FEATURES.FREE.minImages).toBe(SUBSCRIPTION_FEATURES.PREMIUM.minImages);
      expect(SUBSCRIPTION_FEATURES.FREE.minImages).toBe(1);
      
      // PREMIUM doit avoir un maximum supérieur à FREE
      expect(SUBSCRIPTION_FEATURES.FREE.maxImages).toBeLessThan(SUBSCRIPTION_FEATURES.PREMIUM.maxImages);
      expect(SUBSCRIPTION_FEATURES.FREE.maxImages).toBe(2);
      expect(SUBSCRIPTION_FEATURES.PREMIUM.maxImages).toBe(5);
    });
  });
});
