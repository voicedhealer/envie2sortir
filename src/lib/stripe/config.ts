import Stripe from 'stripe';

/**
 * Configuration Stripe
 * Utilise les clés API de test par défaut
 */
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  }
);

/**
 * Prix des plans Premium
 * À configurer dans Stripe Dashboard pour obtenir les price_id
 */
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '', // Plan mensuel à 29,90€
  annual: process.env.STRIPE_PRICE_ID_ANNUAL || '', // Plan annuel à 305€ (-15%)
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
    (STRIPE_PRICE_IDS.monthly || STRIPE_PRICE_IDS.annual) &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

