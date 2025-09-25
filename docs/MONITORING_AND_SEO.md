# 📊 Guide de Monitoring et SEO - Envie2Sortir

## Vue d'ensemble

Ce document décrit les modules de monitoring, analytics et optimisation SEO implémentés pour assurer la surveillance, la performance et la visibilité de l'application Envie2Sortir.

## 🔍 Modules de Monitoring

### 1. 📈 Collecteur de Métriques

#### Fonctionnalités
- **Métriques système** : CPU, mémoire, connexions actives
- **Métriques API** : temps de réponse, codes de statut, endpoints
- **Métriques métier** : établissements créés, utilisateurs, recherches
- **Export Prometheus** : Format standard pour le monitoring
- **Historique** : Conservation des métriques avec nettoyage automatique

#### Utilisation
```typescript
import { metricsCollector, recordAPIMetric } from '@/lib/monitoring';

// Enregistrer une métrique d'API
recordAPIMetric('/api/establishments', 'GET', 200, 150, {
  userId: 'user123',
  ipAddress: '127.0.0.1'
});

// Enregistrer une métrique métier
metricsCollector.recordCounter('establishments_created_total', 1, {
  category: 'restaurant'
});

// Exporter au format Prometheus
const prometheusMetrics = metricsCollector.exportPrometheusMetrics();
```

#### Métriques Disponibles
- **system_memory_usage_bytes** : Utilisation mémoire
- **system_cpu_usage_percent** : Utilisation CPU
- **http_requests_total** : Total des requêtes HTTP
- **http_request_duration_seconds** : Durée des requêtes
- **establishments_created_total** : Établissements créés
- **users_registered_total** : Utilisateurs enregistrés
- **searches_performed_total** : Recherches effectuées

### 2. 🏥 Health Checks

#### Fonctionnalités
- **Vérifications critiques** : Base de données, services essentiels
- **Vérifications non-critiques** : Redis, APIs externes
- **Endpoints Kubernetes** : /health, /liveness, /readiness
- **Métriques de santé** : Temps de réponse, statut des services
- **Information système** : Mémoire, CPU, uptime

#### Endpoints Disponibles
```
GET /api/monitoring/health     - Health check complet
GET /api/monitoring/liveness   - Vérification de vie
GET /api/monitoring/readiness  - Vérification de préparation
```

#### Utilisation
```typescript
import { createHealthChecker } from '@/lib/monitoring';

const healthChecker = createHealthChecker(prisma);
const healthStatus = await healthChecker.performHealthCheck();

// Statuts possibles : 'healthy', 'degraded', 'unhealthy'
console.log(healthStatus.status);
```

### 3. 📝 Logging Structuré

#### Fonctionnalités
- **Logs structurés** : JSON avec métadonnées
- **Niveaux de log** : ERROR, WARN, INFO, DEBUG
- **Sorties multiples** : Console, fichier, remote
- **Rotation automatique** : Gestion de la taille des fichiers
- **Context enrichi** : User ID, Request ID, IP

#### Utilisation
```typescript
import { logger, createRequestLogger } from '@/lib/monitoring';

// Logging basique
await logger.info('User logged in', { userId: '123' });
await logger.error('Database error', { error: error.message });

// Logger avec contexte de requête
const requestLogger = createRequestLogger('req-123', 'user-456');
await requestLogger.info('API call completed');

// Logging spécialisé
await logger.logAPICall('/api/test', 'GET', 200, 150);
await logger.logBusinessEvent('establishment_created', { id: 'est-123' });
await logger.logSecurityEvent('failed_login', { ip: '127.0.0.1' });
```

## 🔍 Modules SEO

### 1. 📋 Générateur de Métadonnées

#### Fonctionnalités
- **Métadonnées Open Graph** : Facebook, LinkedIn
- **Métadonnées Twitter** : Twitter Cards
- **Métadonnées standards** : Title, description, keywords
- **Données structurées** : Schema.org JSON-LD
- **Sitemap XML** : Génération automatique
- **Robots.txt** : Configuration des crawlers

#### Utilisation
```typescript
import { metadataGenerator } from '@/lib/seo';

// Métadonnées de page
const metadata = metadataGenerator.generateMetadata({
  title: 'Restaurant Le Bistrot',
  description: 'Découvrez notre cuisine française traditionnelle',
  keywords: ['restaurant', 'cuisine française', 'bistrot'],
  image: '/images/restaurant.jpg',
  url: '/etablissements/le-bistrot'
});

// Données structurées d'établissement
const structuredData = metadataGenerator.generateEstablishmentStructuredData({
  id: 'le-bistrot',
  name: 'Restaurant Le Bistrot',
  description: 'Cuisine française traditionnelle',
  address: '123 Rue de la Paix',
  city: 'Paris',
  category: 'Restaurant',
  tags: ['cuisine française', 'bistrot']
});
```

#### Types de Données Structurées
- **LocalBusiness** : Établissements
- **Event** : Événements
- **Article** : Articles de blog
- **BreadcrumbList** : Fil d'Ariane
- **FAQPage** : Questions fréquentes

### 2. 🗺️ Sitemap et Robots

#### Génération Automatique
```typescript
// Sitemap XML
const sitemap = metadataGenerator.generateSitemap(establishments, events);

// Robots.txt
const robotsTxt = metadataGenerator.generateRobotsTxt();
```

#### Endpoints SEO
```
GET /sitemap.xml              - Sitemap principal
GET /sitemap-establishments.xml - Sitemap des établissements
GET /sitemap-events.xml       - Sitemap des événements
GET /robots.txt               - Configuration robots
```

## 📊 Endpoints de Monitoring

### Métriques
```bash
# Métriques JSON
curl http://localhost:3000/api/monitoring/metrics

# Métriques Prometheus
curl http://localhost:3000/api/monitoring/metrics?format=prometheus
```

### Health Checks
```bash
# Health check complet
curl http://localhost:3000/api/monitoring/health

# Liveness (Kubernetes)
curl http://localhost:3000/api/monitoring/liveness

# Readiness (Kubernetes)
curl http://localhost:3000/api/monitoring/readiness
```

## ⚙️ Configuration

### Variables d'Environnement
```env
# Monitoring
NODE_ENV=production
LOGGING_LEVEL=INFO
LOGGING_ENDPOINT=https://logs.example.com/api/logs
LOGGING_TOKEN=your-logging-token

# SEO
NEXT_PUBLIC_SITE_URL=https://envie2sortir.fr
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
FACEBOOK_PIXEL_ID=XXXXXXXXX

# Health Checks
HEALTH_CHECK_TIMEOUT=5000
CRITICAL_SERVICES=database
```

### Configuration Centralisée
```typescript
import { MONITORING_CONFIG, SEO_CONFIG } from '@/lib/monitoring';

// Accès aux configurations
const logLevel = MONITORING_CONFIG.LOGGING.LEVEL;
const maxFileSize = MONITORING_CONFIG.LOGGING.MAX_FILE_SIZE;
const siteUrl = SEO_CONFIG.DEFAULT_METADATA.siteUrl;
```

## 📈 Métriques et Alertes

### Métriques Clés à Surveiller

#### Performance
- **Temps de réponse API** < 500ms
- **Taux d'erreur** < 1%
- **Utilisation mémoire** < 80%
- **Utilisation CPU** < 70%

#### Métier
- **Nouveaux établissements** par jour
- **Utilisateurs actifs** par mois
- **Taux de conversion** recherche → visite
- **Satisfaction utilisateur** (ratings)

#### Technique
- **Disponibilité** > 99.9%
- **Temps de réponse DB** < 100ms
- **Cache hit rate** > 80%
- **Erreurs 4xx/5xx** < 0.1%

### Alertes Recommandées
- **Disponibilité** < 99%
- **Temps de réponse** > 2 secondes
- **Taux d'erreur** > 5%
- **Mémoire** > 90%
- **CPU** > 80%
- **Erreurs critiques** > 10/minute

## 🔧 Intégration

### Dans les APIs
```typescript
import { recordAPIMetric, logger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Votre logique métier
    const result = await processRequest();
    
    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/establishments', 'GET', 200, responseTime);
    
    return NextResponse.json(result);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/establishments', 'GET', 500, responseTime);
    
    await logger.error('API error', { endpoint: '/api/establishments' }, error);
    throw error;
  }
}
```

### Dans les Composants React
```typescript
import { metadataGenerator } from '@/lib/seo';

export default function EstablishmentPage({ establishment }) {
  const metadata = metadataGenerator.generateMetadata({
    title: establishment.name,
    description: establishment.description,
    image: establishment.imageUrl,
    url: `/etablissements/${establishment.slug}`
  });

  return (
    <>
      {Object.entries(metadata).map(([key, value]) => (
        <meta key={key} property={key} content={value} />
      ))}
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            metadataGenerator.generateEstablishmentStructuredData(establishment)
          )
        }}
      />
      
      {/* Contenu de la page */}
    </>
  );
}
```

## 🚨 Troubleshooting

### Problèmes Courants

#### Health Checks qui échouent
1. Vérifier la connexion à la base de données
2. Contrôler les variables d'environnement
3. Vérifier les services externes (Redis, APIs)

#### Métriques manquantes
1. Vérifier la configuration des métriques
2. Contrôler les permissions de lecture
3. Vérifier la connectivité réseau

#### Logs non écrits
1. Vérifier les permissions du dossier logs
2. Contrôler la configuration de logging
3. Vérifier l'espace disque disponible

### Commandes de Diagnostic
```bash
# Vérifier les health checks
curl -f http://localhost:3000/api/monitoring/health

# Vérifier les métriques
curl http://localhost:3000/api/monitoring/metrics

# Vérifier les logs
tail -f logs/envie2sortir-api-$(date +%Y-%m-%d).log
```

## 📚 Ressources

### Documentation Externe
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Google Search Console](https://search.google.com/search-console)

### Outils Recommandés
- **Monitoring** : Prometheus + Grafana
- **Logs** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Alertes** : AlertManager, PagerDuty
- **SEO** : Google Search Console, Screaming Frog

---

*Dernière mise à jour : Janvier 2025*
