# Guide des Tests - envie2sortir.fr

Ce document décrit la suite de tests complète générée pour le projet envie2sortir.fr, une plateforme de découverte d'établissements basée sur les envies des utilisateurs.

## 📋 Vue d'ensemble

La suite de tests couvre l'ensemble des fonctionnalités critiques du projet :

- **Moteur de recherche par envie** (matching sémantique)
- **Système d'événements** (dates, horaires, engagement)
- **Bons plans journaliers** (validité temporelle, récurrence, likes/dislikes)
- **Parcours utilisateur complet** (E2E)

## 🏗️ Structure des Tests

```
src/__tests__/
├── api/
│   ├── recherche-envie.test.ts      # Tests API recherche sémantique
│   ├── events.test.ts               # Tests API événements
│   ├── daily-deals.test.ts          # Tests API bons plans
│   └── deal-engagement.test.ts      # Tests système d'engagement
└── components/
    └── EnvieSearchBar.test.tsx      # Tests composant recherche

tests/e2e/
├── recherche-envie.spec.ts          # Tests E2E parcours recherche
└── evenements-bons-plans.spec.ts    # Tests E2E événements & bons plans
```

## 🚀 Exécution des Tests

### Tests Unitaires (Jest)

```bash
# Tous les tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm test -- --coverage

# Tests spécifiques
npm test recherche-envie
npm test events
npm test daily-deals
npm test deal-engagement
npm test EnvieSearchBar
```

### Tests E2E (Playwright)

```bash
# Tous les tests E2E
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug
npm run test:e2e:debug

# Voir le rapport
npm run test:e2e:report
```

## 📊 Couverture des Tests

### 1. **API de Recherche par Envie** (`recherche-envie.test.ts`)

✅ **Tests couverts** :
- Validation des paramètres (envie requise)
- Extraction de mots-clés significatifs
- Filtrage des stop words
- Normalisation des accents
- Géolocalisation et géocodage
- Calcul de distance (formule Haversine)
- Matching sémantique avec tags
- Pondération des scores (poids des tags)
- Bonus de proximité
- Tri par pertinence
- Limitation à 15 résultats
- Gestion d'erreurs

**Cas limites** :
- Recherche sans résultat
- Combinaisons d'activités multiples
- Fautes d'orthographe
- Établissements non approuvés

### 2. **Composant EnvieSearchBar** (`EnvieSearchBar.test.tsx`)

✅ **Tests couverts** :
- Rendu des éléments de base
- Effet typewriter
- Saisie et validation de l'envie
- Autocomplétion des villes
- Géolocalisation "Autour de moi"
- Sélection du rayon
- Soumission du formulaire
- Analytics de recherche
- Navigation au clavier
- Accessibilité

### 3. **API Événements** (`events.test.ts`)

✅ **Tests couverts** :
- Authentification et permissions
- Vérification statut Premium
- Validation des champs requis
- Création avec données minimales/complètes
- Gestion des dates (startDate/endDate)
- Conversion des types (prix, capacité)
- Formats de date ISO 8601
- Tri par date croissante
- Gestion d'erreurs

**Cas limites** :
- Prix à 0 (gratuit)
- Capacité de 1 personne
- Caractères spéciaux dans le titre

### 4. **API Bons Plans** (`daily-deals.test.ts`)

✅ **Tests couverts** :
- Validation des champs requis
- Vérification statut Premium
- Création avec toutes les données
- Gestion des horaires (avec/sans)
- Horaires passant minuit
- **Récurrence hebdomadaire** (lundi-vendredi)
- **Récurrence mensuelle**
- Date de fin de récurrence
- Prix avec décimales
- État actif/inactif
- Gestion d'erreurs

**Cas limites** :
- Bon plan sur une seule journée
- Horaires null (actif toute la journée)
- Weekend uniquement (samedi-dimanche)

### 5. **Système d'Engagement** (`deal-engagement.test.ts`)

✅ **Tests couverts** :
- Validation type (liked/disliked)
- Vérification existence bon plan
- Création nouvel engagement
- **Anti-doublon par IP** ⭐
- Mise à jour engagement existant
- Récupération IP (x-forwarded-for, x-real-ip)
- Statistiques d'engagement
- Calcul taux d'engagement
- 10 derniers engagements
- Gestion d'erreurs

**Cas limites** :
- IPs IPv6
- Changement d'avis multiple fois
- Arrondi taux à 2 décimales

### 6. **Tests E2E - Parcours Recherche** (`recherche-envie.spec.ts`)

✅ **Scénarios testés** :
- Affichage barre de recherche
- Recherche simple avec résultats
- Validation envie vide
- Recherche "Autour de moi" avec géolocalisation
- Changement de rayon
- Navigation vers détails établissement
- Différentes formulations d'envie
- Caractères spéciaux et accents
- États de chargement
- Message "aucun résultat"
- Navigation au clavier
- Soumission avec Entrée
- **Responsive mobile** (iPhone SE)
- **Analytics de recherche**
- Persistance paramètres dans URL
- Retour arrière et modification

### 7. **Tests E2E - Événements & Bons Plans** (`evenements-bons-plans.spec.ts`)

✅ **Scénarios testés** :

**Événements** :
- Affichage événements à venir
- Détails (titre, date, horaires)
- Filtrage événements passés
- Engagement utilisateur
- Jauge de participation

**Bons Plans** :
- Modal au chargement
- Fermeture modal
- Pas de réaffichage après fermeture
- **Effet flip de carte** ⭐
- Recto/verso
- Like/Dislike
- Enregistrement engagement
- Changement d'avis
- Validité temporelle
- Horaires de validité
- Lien externe
- Modalité

**Responsive Mobile** :
- Modal responsive
- Swipe cartes
- Liste événements

## 🎯 Fonctionnalités Critiques Testées

### ⭐ Moteur de Recherche Sémantique
- Extraction mots-clés intelligente
- Matching avec tags pondérés
- Score de pertinence
- Bonus proximité géographique

### ⭐ Validité Temporelle
- Événements à venir uniquement
- Bons plans actifs selon horaires
- Récurrence hebdomadaire/mensuelle
- Vérification jour de la semaine

### ⭐ Système Anti-Doublon
- Une IP = un avis par bon plan
- Possibilité de changer d'avis
- Tracking des engagements

### ⭐ Analytics
- Tracking des recherches
- Clics post-recherche
- Métriques de conversion

## 🔧 Configuration

### Jest (Tests Unitaires)

Le fichier `jest.config.js` est configuré pour :
- Environnement jsdom (tests React)
- Mocks Prisma
- Mocks NextAuth
- Couverture de code

### Playwright (Tests E2E)

Le fichier `playwright.config.ts` est configuré pour :
- Tests multi-navigateurs (Chromium, Firefox, WebKit)
- Mode headless par défaut
- Screenshots sur échec
- Vidéos sur échec
- Retry automatique (2 fois)

## 📈 Objectifs de Couverture

- **Minimum requis** : 80% du code
- **Cas d'erreur** : Obligatoires
- **Cas limites** : Couverts
- **Tests d'isolation** : Indépendants

## 🧪 Mocks Utilisés

```typescript
// Prisma Client
jest.mock('@/lib/prisma')

// NextAuth Sessions
jest.mock('next-auth')

// Fetch (géocodage, analytics)
global.fetch = jest.fn()

// Geolocation
global.navigator.geolocation = mockGeolocation
```

## 💡 Bonnes Pratiques Appliquées

1. **Nommage explicite** : `describe('Composant/API')`, `it('doit faire X quand Y')`
2. **Tests isolés** : Cleanup dans `beforeEach`
3. **Fixtures réutilisables** : Données de test cohérentes
4. **Assertions claires** : `expect.toBe()`, `toHaveLength()`, etc.
5. **Mocks appropriés** : Prisma, NextAuth, Geolocation
6. **Tests E2E réalistes** : Parcours utilisateur complet

## 🐛 Debug des Tests

### Tests qui échouent

```bash
# Mode verbose
npm test -- --verbose

# Un seul test
npm test -- -t "nom du test"

# Debug Playwright
npm run test:e2e:debug
```

### Vérifier la couverture

```bash
npm test -- --coverage
# Ouvrir coverage/lcov-report/index.html
```

## 📝 Exemples d'Exécution

### Tester le matching sémantique

```bash
npm test recherche-envie -- -t "matching sémantique"
```

### Tester la récurrence des bons plans

```bash
npm test daily-deals -- -t "récurrence"
```

### Tester l'engagement anti-doublon

```bash
npm test deal-engagement -- -t "anti-doublon"
```

### Tests E2E complets

```bash
npm run test:e2e -- --headed
```

## 🚨 Points d'Attention

### Données de Test

- Établissements avec coordonnées GPS valides
- Tags exhaustifs pour matching
- Événements futurs et passés (pour filtrage)
- Bons plans avec récurrence variée

### Temporalité

- **Mock de dates** pour tester validité
- Vérifier fuseaux horaires
- Tester horaires passant minuit

### Engagement

- Vérifier contrainte unique [dealId, userIp]
- Tester changements d'avis
- Calculer jauges correctement

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)

---

**Statut** : ✅ Suite de tests complète et fonctionnelle

**Couverture visée** : 80%+ du code

**Dernière mise à jour** : 14 octobre 2025

