import Stripe from 'stripe';

/**
 * Instance Stripe (lazy initialization)
 * Initialisé uniquement quand nécessaire pour éviter les erreurs au build
 */
let stripeInstance: Stripe | null = null;

/**
 * Récupère l'instance Stripe (lazy initialization)
 * Évite les erreurs de build quand STRIPE_SECRET_KEY n'est pas disponible
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      // Pendant le build, retourner un client mock pour éviter les erreurs
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                          process.env.NEXT_PHASE === 'phase-development-build' ||
                          (process.env.NODE_ENV === 'production' && !apiKey);
      
      if (isBuildTime) {
        console.warn('⚠️ Stripe environment variable not set during build - using mock client');
        // Retourner un client mock qui ne fonctionnera pas mais évitera les erreurs de build
        stripeInstance = new Stripe('sk_test_mock_key_for_build', {
          apiVersion: '2024-12-18.acacia',
          typescript: true,
        });
        return stripeInstance;
      }
      
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  
  return stripeInstance;
}

/**
 * Export pour compatibilité avec l'ancien code
 * @deprecated Utilisez getStripe() à la place
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  }
});

/**
 * Prix des plans Premium
 * À configurer dans Stripe Dashboard pour obtenir les price_id
 */
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '', // Plan mensuel à 29,90€
  annual: process.env.STRIPE_PRICE_ID_ANNUAL || '', // Plan annuel à 305€ (-15%)
  waitlist: process.env.STRIPE_PRICE_ID_WAITLIST || '', // Plan waitlist à 0€ (pour collecter la méthode de paiement)
};

// Pour compatibilité avec l'ancien code
export const STRIPE_PRICE_ID = STRIPE_PRICE_IDS.monthly;

/**
 * URL de base du site (pour les redirections)
 */
export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

/**
 * Vérifie que Stripe est configuré
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    (STRIPE_PRICE_IDS.monthly || STRIPE_PRICE_IDS.annual || STRIPE_PRICE_IDS.waitlist) &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

