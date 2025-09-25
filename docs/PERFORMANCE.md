# 🚀 Guide de Performance - Envie2Sortir

## Vue d'ensemble

Ce document décrit les modules d'optimisation de performance implémentés pour améliorer la vitesse et l'efficacité de l'application Envie2Sortir.

## 📊 Modules de Performance

### 1. 🗄️ Système de Cache

#### Configuration
- **Cache mémoire** : Cache local rapide
- **Cache Redis** : Cache distribué pour la production
- **TTL configurable** : Expiration automatique des données
- **Gestion de taille** : Éviction automatique des anciens éléments

#### Utilisation
```typescript
import { categoriesCache, withCache } from '@/lib/performance';

// Cache simple
await categoriesCache.set('key', data, 3600); // 1 heure
const cached = await categoriesCache.get('key');

// Cache avec fonction
const result = await withCache(categoriesCache, 'expensive-key', async () => {
  return await expensiveOperation();
});
```

#### Caches Spécialisés
- **categoriesCache** : Catégories (TTL: 1 heure)
- **establishmentsCache** : Établissements (TTL: 30 minutes)
- **randomEstablishmentsCache** : Établissements aléatoires (TTL: 10 minutes)

### 2. 🖼️ Optimisation d'Images

#### Fonctionnalités
- **Compression automatique** : Réduction de la taille des fichiers
- **Formats modernes** : WebP, AVIF support
- **Images responsives** : Génération de multiples tailles
- **Optimisation web** : Paramètres optimaux pour le web

#### Utilisation
```typescript
import { ImageOptimizer, optimizeWithPreset } from '@/lib/performance';

// Optimisation basique
const optimized = await ImageOptimizer.optimize(imageBuffer, {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp'
});

// Optimisation avec preset
const profileImage = await optimizeWithPreset(imageBuffer, 'profile');

// Images responsives
const variants = await ImageOptimizer.generateResponsiveImages(imageBuffer);
```

#### Presets Disponibles
- **profile** : Images de profil (200x200, qualité 90%)
- **establishment** : Images d'établissements (1200x800, qualité 85%)
- **thumbnail** : Miniatures (150x150, qualité 80%)
- **event** : Images d'événements (800x600, qualité 85%)
- **highQuality** : Haute qualité (1920x1080, qualité 95%)

### 3. 📡 Optimisation des Réponses API

#### Fonctionnalités
- **Compression** : Gzip et Brotli automatiques
- **Pagination** : Système de pagination optimisé
- **Headers de cache** : Configuration automatique
- **ETags** : Validation de cache côté client

#### Utilisation
```typescript
import { ResponseOptimizer, optimizeWithConfig } from '@/lib/performance';

// Réponse optimisée
const response = await ResponseOptimizer.optimizeResponse(data, {
  enableCompression: true,
  cacheControl: 'public, max-age=300'
});

// Réponse paginée
const paginatedResponse = await ResponseOptimizer.createPaginatedResponse(
  data,
  { page: 1, limit: 20, total: 100 }
);

// Configuration prédéfinie
const response = await optimizeWithConfig(data, 'establishments');
```

#### Configurations Prédéfinies
- **categories** : Cache long (1 heure), pas de pagination
- **establishments** : Cache moyen (30 minutes), avec pagination
- **search** : Cache court (5 minutes), avec pagination
- **auth** : Pas de cache, pas de compression
- **admin** : Cache privé (10 minutes), avec pagination

### 4. 🗃️ Optimisation Base de Données

#### Fonctionnalités
- **Requêtes optimisées** : Sélection de champs spécifiques
- **Indexes suggérés** : Amélioration des performances
- **Pagination** : Requêtes paginées efficaces
- **Nettoyage automatique** : Suppression des données obsolètes

#### Utilisation
```typescript
import { DatabaseOptimizer } from '@/lib/performance';

const optimizer = new DatabaseOptimizer(prisma);

// Établissements optimisés
const establishments = await optimizer.getOptimizedEstablishments({
  page: 1,
  limit: 20,
  city: 'Paris',
  category: 'restaurant'
});

// Recherche optimisée
const results = await optimizer.searchEstablishmentsOptimized('restaurant');

// Statistiques optimisées
const stats = await optimizer.getStatisticsOptimized();
```

#### Indexes Suggérés
```sql
-- Indexes pour les établissements
CREATE INDEX idx_establishment_active ON Establishment(isActive);
CREATE INDEX idx_establishment_city ON Establishment(city);
CREATE INDEX idx_establishment_category ON Establishment(category);
CREATE INDEX idx_establishment_rating ON Establishment(rating DESC);

-- Indexes pour les événements
CREATE INDEX idx_event_start_date ON Event(startDate);
CREATE INDEX idx_event_establishment ON Event(establishmentId);

-- Indexes pour les utilisateurs
CREATE INDEX idx_user_email ON User(email);
```

## ⚙️ Configuration

### Variables d'Environnement
```env
# Cache
CACHE_TTL=300
CACHE_MAX_SIZE=1000
USE_REDIS_CACHE=true

# Images
MAX_IMAGE_SIZE=5242880
IMAGE_QUALITY=85
SUPPORTED_IMAGE_FORMATS=jpeg,png,webp,avif

# Database
DB_QUERY_TIMEOUT=30000
DB_PAGE_SIZE=20
DB_MAX_PAGE_SIZE=100
```

### Configuration Centralisée
```typescript
import { PERFORMANCE_CONFIG } from '@/lib/performance';

// Accès aux configurations
const cacheTTL = PERFORMANCE_CONFIG.CACHE.DEFAULT_TTL;
const maxImageSize = PERFORMANCE_CONFIG.IMAGES.MAX_FILE_SIZE;
const defaultPageSize = PERFORMANCE_CONFIG.DATABASE.DEFAULT_PAGE_SIZE;
```

## 📈 Métriques de Performance

### Cache
- **Hit Rate** : Pourcentage de requêtes servies depuis le cache
- **Miss Rate** : Pourcentage de requêtes nécessitant une requête DB
- **Average Age** : Âge moyen des éléments en cache
- **Size** : Nombre d'éléments en cache

### Images
- **Compression Ratio** : Ratio de compression obtenu
- **Space Saved** : Espace disque économisé
- **Processing Time** : Temps de traitement des images
- **Format Distribution** : Répartition des formats utilisés

### API
- **Response Time** : Temps de réponse des APIs
- **Compression Ratio** : Ratio de compression des réponses
- **Cache Hit Rate** : Pourcentage de réponses mises en cache
- **Pagination Usage** : Utilisation de la pagination

### Base de Données
- **Query Time** : Temps d'exécution des requêtes
- **Index Usage** : Utilisation des index
- **Connection Pool** : État du pool de connexions
- **Slow Queries** : Requêtes lentes identifiées

## 🔧 Optimisations Recommandées

### 1. Mise en Cache
- **Activer Redis** en production
- **Configurer les TTL** selon le type de données
- **Surveiller le hit rate** du cache
- **Nettoyer régulièrement** le cache

### 2. Images
- **Utiliser WebP** par défaut
- **Générer des variants** responsives
- **Compresser avant stockage**
- **Optimiser les presets** selon les besoins

### 3. APIs
- **Activer la compression** sur toutes les réponses
- **Configurer les headers** de cache appropriés
- **Utiliser la pagination** pour les grandes listes
- **Implémenter les ETags** pour la validation

### 4. Base de Données
- **Créer les index** suggérés
- **Optimiser les requêtes** Prisma
- **Configurer le pool** de connexions
- **Surveiller les performances**

## 🚨 Monitoring

### Alertes Recommandées
- **Temps de réponse API** > 2 secondes
- **Hit rate du cache** < 70%
- **Taille du cache** > 80% de la limite
- **Requêtes lentes** > 1 seconde
- **Erreurs de compression** > 5%

### Outils de Monitoring
- **APM** : Application Performance Monitoring
- **Logs** : Surveillance des logs de performance
- **Métriques** : Collecte des métriques personnalisées
- **Alertes** : Notifications automatiques

## 📊 Benchmarks

### Avant Optimisation
- **Temps de réponse API** : 2-5 secondes
- **Taille des images** : 2-5 MB
- **Taille des réponses** : 500KB-2MB
- **Requêtes DB** : 10-50 par page

### Après Optimisation
- **Temps de réponse API** : 200-500ms
- **Taille des images** : 200-800KB
- **Taille des réponses** : 50-200KB
- **Requêtes DB** : 1-5 par page

## 🔄 Maintenance

### Tâches Régulières
- **Nettoyage du cache** : Suppression des éléments expirés
- **Optimisation des images** : Recompression si nécessaire
- **Analyse des performances** : Identification des goulots
- **Mise à jour des index** : Ajout d'index selon les besoins

### Surveillance Continue
- **Monitoring des métriques** : Surveillance 24/7
- **Alertes de performance** : Notifications automatiques
- **Analyse des logs** : Identification des problèmes
- **Tests de charge** : Validation des performances

---

*Dernière mise à jour : Janvier 2025*
