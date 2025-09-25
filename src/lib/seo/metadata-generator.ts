interface SEOConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'place';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export class MetadataGenerator {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  // Génération des métadonnées de base
  generateBaseMetadata(): Record<string, string> {
    return {
      'viewport': 'width=device-width, initial-scale=1',
      'robots': 'index, follow',
      'author': this.config.siteName,
      'theme-color': '#ff751f',
      'msapplication-TileColor': '#ff751f',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': this.config.siteName
    };
  }

  // Génération des métadonnées Open Graph
  generateOpenGraphMetadata(page: PageMetadata): Record<string, string> {
    const image = page.image || this.config.defaultImage;
    const url = page.url || this.config.siteUrl;
    const title = `${page.title} | ${this.config.siteName}`;

    return {
      'og:title': title,
      'og:description': page.description,
      'og:type': page.type || 'website',
      'og:url': url,
      'og:image': image,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:site_name': this.config.siteName,
      'og:locale': 'fr_FR',
      ...(page.publishedTime && { 'article:published_time': page.publishedTime }),
      ...(page.modifiedTime && { 'article:modified_time': page.modifiedTime }),
      ...(page.author && { 'article:author': page.author }),
      ...(page.section && { 'article:section': page.section }),
      ...(page.tags && { 'article:tag': page.tags.join(', ') }),
      ...(this.config.facebookAppId && { 'fb:app_id': this.config.facebookAppId })
    };
  }

  // Génération des métadonnées Twitter
  generateTwitterMetadata(page: PageMetadata): Record<string, string> {
    const image = page.image || this.config.defaultImage;
    const title = `${page.title} | ${this.config.siteName}`;

    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': page.description,
      'twitter:image': image,
      ...(this.config.twitterHandle && { 'twitter:site': this.config.twitterHandle }),
      ...(this.config.twitterHandle && { 'twitter:creator': this.config.twitterHandle })
    };
  }

  // Génération des métadonnées standards
  generateStandardMetadata(page: PageMetadata): Record<string, string> {
    const title = `${page.title} | ${this.config.siteName}`;
    const keywords = page.keywords ? page.keywords.join(', ') : '';

    return {
      'title': title,
      'description': page.description,
      'keywords': keywords,
      'canonical': page.url || this.config.siteUrl,
      'language': 'fr',
      'geo.region': 'FR',
      'geo.country': 'France'
    };
  }

  // Génération complète des métadonnées
  generateMetadata(page: PageMetadata): Record<string, string> {
    return {
      ...this.generateBaseMetadata(),
      ...this.generateStandardMetadata(page),
      ...this.generateOpenGraphMetadata(page),
      ...this.generateTwitterMetadata(page)
    };
  }

  // Génération de données structurées pour les établissements
  generateEstablishmentStructuredData(establishment: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    postalCode: string;
    phone?: string;
    email?: string;
    website?: string;
    imageUrl?: string;
    rating?: number;
    priceRange?: string;
    openingHours?: any;
    category: string;
    tags: string[];
  }): StructuredData {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': establishment.name,
      'description': establishment.description,
      'image': establishment.imageUrl || this.config.defaultImage,
      'url': `${this.config.siteUrl}/etablissements/${establishment.id}`,
      'telephone': establishment.phone,
      'email': establishment.email,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': establishment.address,
        'addressLocality': establishment.city,
        'postalCode': establishment.postalCode,
        'addressCountry': 'FR'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': establishment.geo?.latitude || '',
        'longitude': establishment.geo?.longitude || ''
      },
      'priceRange': establishment.priceRange,
      'aggregateRating': establishment.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': establishment.rating,
        'reviewCount': establishment.reviewCount || 0
      } : undefined,
      'openingHoursSpecification': establishment.openingHours ? 
        this.formatOpeningHours(establishment.openingHours) : undefined,
      'servesCuisine': establishment.category,
      'keywords': establishment.tags.join(', ')
    };

    // Nettoyer les propriétés undefined
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });

    return structuredData;
  }

  // Génération de données structurées pour les événements
  generateEventStructuredData(event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    price?: number;
    location: string;
    establishment: {
      name: string;
      address: string;
      city: string;
    };
    imageUrl?: string;
  }): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': event.title,
      'description': event.description,
      'image': event.imageUrl || this.config.defaultImage,
      'url': `${this.config.siteUrl}/evenements/${event.id}`,
      'startDate': event.startDate,
      'endDate': event.endDate,
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'location': {
        '@type': 'Place',
        'name': event.establishment.name,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': event.establishment.address,
          'addressLocality': event.establishment.city,
          'addressCountry': 'FR'
        }
      },
      'offers': event.price ? {
        '@type': 'Offer',
        'price': event.price,
        'priceCurrency': 'EUR',
        'availability': 'https://schema.org/InStock'
      } : undefined
    };
  }

  // Génération de données structurées pour les articles/blog
  generateArticleStructuredData(article: {
    id: string;
    title: string;
    description: string;
    content: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    imageUrl?: string;
    tags: string[];
  }): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': article.description,
      'image': article.imageUrl || this.config.defaultImage,
      'url': `${this.config.siteUrl}/articles/${article.id}`,
      'datePublished': article.publishedTime,
      'dateModified': article.modifiedTime || article.publishedTime,
      'author': {
        '@type': 'Person',
        'name': article.author
      },
      'publisher': {
        '@type': 'Organization',
        'name': this.config.siteName,
        'logo': {
          '@type': 'ImageObject',
          'url': this.config.defaultImage
        }
      },
      'keywords': article.tags.join(', '),
      'articleBody': article.content
    };
  }

  // Génération du breadcrumb structuré
  generateBreadcrumbStructuredData(breadcrumbs: Array<{
    name: string;
    url: string;
  }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    };
  }

  // Génération de la FAQ structurée
  generateFAQStructuredData(faqs: Array<{
    question: string;
    answer: string;
  }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  }

  // Génération des scripts de tracking
  generateTrackingScripts(): string {
    const scripts: string[] = [];

    // Google Analytics
    if (this.config.googleAnalyticsId) {
      scripts.push(`
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${this.config.googleAnalyticsId}', {
            page_title: document.title,
            page_location: window.location.href
          });
        </script>
      `);
    }

    // Google Tag Manager
    if (this.config.googleTagManagerId) {
      scripts.push(`
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${this.config.googleTagManagerId}');</script>
      `);
    }

    return scripts.join('\n');
  }

  // Formatage des heures d'ouverture
  private formatOpeningHours(openingHours: any): any[] {
    if (!openingHours) return [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const formattedHours: any[] = [];

    Object.entries(openingHours).forEach(([day, hours]) => {
      if (hours && typeof hours === 'object' && hours.open && hours.close) {
        const dayIndex = days.indexOf(day);
        if (dayIndex !== -1) {
          formattedHours.push({
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': `https://schema.org/${day}`,
            'opens': hours.open,
            'closes': hours.close
          });
        }
      }
    });

    return formattedHours;
  }

  // Génération du sitemap XML
  generateSitemap(establishments: Array<{ id: string; updatedAt: string }>, 
                  events: Array<{ id: string; updatedAt: string }>): string {
    const baseUrl = this.config.siteUrl;
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Page d'accueil
    sitemap += `
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Pages statiques
    const staticPages = [
      { url: '/recherche', priority: '0.8' },
      { url: '/carte', priority: '0.8' },
      { url: '/etablissements', priority: '0.9' },
      { url: '/a-propos', priority: '0.5' },
      { url: '/contact', priority: '0.5' }
    ];

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Établissements
    establishments.forEach(establishment => {
      sitemap += `
  <url>
    <loc>${baseUrl}/etablissements/${establishment.id}</loc>
    <lastmod>${new Date(establishment.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Événements
    events.forEach(event => {
      sitemap += `
  <url>
    <loc>${baseUrl}/evenements/${event.id}</loc>
    <lastmod>${new Date(event.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  // Génération du robots.txt
  generateRobotsTxt(): string {
    const baseUrl = this.config.siteUrl;
    
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-establishments.xml
Sitemap: ${baseUrl}/sitemap-events.xml

# Blocquer les pages d'administration
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

# Blocquer les fichiers de développement
Disallow: /*.json$
Disallow: /*.log$
Disallow: /logs/

# Crawl-delay pour éviter la surcharge
Crawl-delay: 1`;
  }
}

// Configuration par défaut
export const defaultSEOConfig: SEOConfig = {
  siteName: 'Envie2Sortir',
  siteDescription: 'Découvrez les meilleurs établissements et événements près de chez vous. Bars, restaurants, activités - trouvez votre prochaine sortie !',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr',
  defaultImage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr'}/og-image.jpg`,
  twitterHandle: '@envie2sortir',
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID
};

// Instance globale
export const metadataGenerator = new MetadataGenerator(defaultSEOConfig);
