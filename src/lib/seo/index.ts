// Export de tous les modules SEO
export * from './metadata-generator';

// Configuration SEO centralisée
export const SEO_CONFIG = {
  // Métadonnées par défaut
  DEFAULT_METADATA: {
    siteName: 'Envie2Sortir',
    siteDescription: 'Découvrez les meilleurs établissements et événements près de chez vous',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr',
    defaultImage: '/og-image.jpg',
    twitterHandle: '@envie2sortir'
  },
  
  // Sitemap
  SITEMAP: {
    MAX_URLS_PER_SITEMAP: 50000,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures
    PRIORITIES: {
      home: 1.0,
      establishments: 0.9,
      events: 0.8,
      pages: 0.7,
      categories: 0.6
    }
  },
  
  // Structured Data
  STRUCTURED_DATA: {
    ENABLE_ESTABLISHMENTS: true,
    ENABLE_EVENTS: true,
    ENABLE_ARTICLES: true,
    ENABLE_BREADCRUMBS: true,
    ENABLE_FAQ: true
  },
  
  // Analytics
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    FACEBOOK_PIXEL_ID: process.env.FACEBOOK_PIXEL_ID
  }
} as const;

// Instance globale
export { metadataGenerator } from './metadata-generator';
