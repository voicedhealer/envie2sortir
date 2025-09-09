/**
 * Tests automatisés pour la logique de différenciation STANDARD vs PREMIUM
 * Vérifie que les deux états sont toujours distingués correctement
 */

import { 
  hasPremiumAccess, 
  canCreateEvents, 
  canUsePromotions, 
  getMaxImages, 
  getPremiumRequiredMessage,
  getPremiumRequiredError,
  validateSubscriptionAccess,
  getAvailableFeatures,
  getSubscriptionDisplayInfo,
  SUBSCRIPTION_FEATURES
} from '@/lib/subscription-utils';

describe('Logique de différenciation STANDARD vs PREMIUM', () => {
  
  describe('Fonctions de vérification d\'accès', () => {
    test('hasPremiumAccess - STANDARD doit retourner false', () => {
      expect(hasPremiumAccess('STANDARD')).toBe(false);
    });

    test('hasPremiumAccess - PREMIUM doit retourner true', () => {
      expect(hasPremiumAccess('PREMIUM')).toBe(true);
    });

    test('canCreateEvents - STANDARD doit retourner false', () => {
      expect(canCreateEvents('STANDARD')).toBe(false);
    });

    test('canCreateEvents - PREMIUM doit retourner true', () => {
      expect(canCreateEvents('PREMIUM')).toBe(true);
    });

    test('canUsePromotions - STANDARD doit retourner false', () => {
      expect(canUsePromotions('STANDARD')).toBe(false);
    });

    test('canUsePromotions - PREMIUM doit retourner true', () => {
      expect(canUsePromotions('PREMIUM')).toBe(true);
    });
  });

  describe('Limites par abonnement', () => {
    test('getMaxImages - STANDARD doit retourner 1', () => {
      expect(getMaxImages('STANDARD')).toBe(1);
    });

    test('getMaxImages - PREMIUM doit retourner 10', () => {
      expect(getMaxImages('PREMIUM')).toBe(10);
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
    test('validateSubscriptionAccess - STANDARD pour canCreateEvents doit échouer', () => {
      const result = validateSubscriptionAccess('STANDARD', 'canCreateEvents');
      expect(result.hasAccess).toBe(false);
      expect(result.error).toContain('Premium');
    });

    test('validateSubscriptionAccess - PREMIUM pour canCreateEvents doit réussir', () => {
      const result = validateSubscriptionAccess('PREMIUM', 'canCreateEvents');
      expect(result.hasAccess).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('validateSubscriptionAccess - STANDARD pour maxImages doit réussir', () => {
      const result = validateSubscriptionAccess('STANDARD', 'maxImages');
      expect(result.hasAccess).toBe(true);
    });
  });

  describe('Fonctionnalités disponibles', () => {
    test('getAvailableFeatures - STANDARD doit retourner un tableau vide', () => {
      const features = getAvailableFeatures('STANDARD');
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
    test('getSubscriptionDisplayInfo - STANDARD doit avoir les bonnes propriétés', () => {
      const info = getSubscriptionDisplayInfo('STANDARD');
      expect(info.type).toBe('STANDARD');
      expect(info.label).toBe('Standard');
      expect(info.badgeColor).toBe('bg-gray-100 text-gray-800');
      expect(info.features).toEqual([]);
      expect(info.maxImages).toBe(1);
    });

    test('getSubscriptionDisplayInfo - PREMIUM doit avoir les bonnes propriétés', () => {
      const info = getSubscriptionDisplayInfo('PREMIUM');
      expect(info.type).toBe('PREMIUM');
      expect(info.label).toBe('Premium');
      expect(info.badgeColor).toBe('bg-orange-100 text-orange-800');
      expect(info.features.length).toBeGreaterThan(0);
      expect(info.maxImages).toBe(10);
    });
  });

  describe('Cohérence des fonctionnalités', () => {
    test('STANDARD ne doit avoir aucune fonctionnalité Premium', () => {
      const features = SUBSCRIPTION_FEATURES.STANDARD;
      expect(features.canCreateEvents).toBe(false);
      expect(features.canUseAdvancedAnalytics).toBe(false);
      expect(features.canUsePromotions).toBe(false);
      expect(features.canUsePrioritySupport).toBe(false);
      expect(features.maxImages).toBe(1);
    });

    test('PREMIUM doit avoir toutes les fonctionnalités', () => {
      const features = SUBSCRIPTION_FEATURES.PREMIUM;
      expect(features.canCreateEvents).toBe(true);
      expect(features.canUseAdvancedAnalytics).toBe(true);
      expect(features.canUsePromotions).toBe(true);
      expect(features.canUsePrioritySupport).toBe(true);
      expect(features.maxImages).toBe(10);
    });
  });

  describe('Cas limites et validation', () => {
    test('Les deux types d\'abonnement doivent être mutuellement exclusifs', () => {
      const standardFeatures = SUBSCRIPTION_FEATURES.STANDARD;
      const premiumFeatures = SUBSCRIPTION_FEATURES.PREMIUM;
      
      // Aucune fonctionnalité ne doit être vraie pour les deux
      expect(standardFeatures.canCreateEvents).not.toBe(premiumFeatures.canCreateEvents);
      expect(standardFeatures.canUseAdvancedAnalytics).not.toBe(premiumFeatures.canUseAdvancedAnalytics);
      expect(standardFeatures.canUsePromotions).not.toBe(premiumFeatures.canUsePromotions);
      expect(standardFeatures.canUsePrioritySupport).not.toBe(premiumFeatures.canUsePrioritySupport);
    });

    test('Les limites d\'images doivent être différentes', () => {
      expect(SUBSCRIPTION_FEATURES.STANDARD.maxImages).not.toBe(SUBSCRIPTION_FEATURES.PREMIUM.maxImages);
      expect(SUBSCRIPTION_FEATURES.STANDARD.maxImages).toBeLessThan(SUBSCRIPTION_FEATURES.PREMIUM.maxImages);
    });
  });
});
