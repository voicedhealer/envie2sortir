# Tests unitaires pour la recherche par envie

## 📋 Vue d'ensemble

Ce dossier contient une suite complète de tests unitaires pour la fonctionnalité de recherche par envie, testant tous les cas de figure possibles avec les établissements existants.

## 🧪 Types de tests

### 1. **Tests de scénarios** (`search-scenarios.test.ts`)
Tests complets des cas d'usage réels avec les établissements existants :

- **Recherches spécifiques - Karting** : "faire du kart ce soir", "faire du karting ce soir", "kart ce soir"
- **Recherches spécifiques - Bar/Bière** : "boire une bière ce soir", "boire un verre ce soir", "bar ce soir"
- **Recherches mixtes** : "faire du kart et boire une bière", "sortir ce soir"
- **Recherches avec variations** : majuscules, accents, variations de mots
- **Tests de robustesse** : chaînes vides, stop words, chaînes très longues
- **Tests de performance** : temps d'exécution rapide

### 2. **Tests unitaires** (`search-envie.test.ts`)
Tests détaillés des fonctions individuelles :

- Extraction des mots-clés
- Calcul de score
- Gestion des erreurs
- Tests de performance

### 3. **Tests d'intégration** (`search-api-integration.test.ts`)
Tests de l'API complète :

- Requêtes API réelles
- Gestion des erreurs
- Filtrage et pagination
- Tests de performance

## 🏗️ Établissements de test

### BattleKart Dijon
- **Activités** : karting, bar_jeux
- **Tags** : aucun
- **Description** : karting électrique, réalité augmentée

### M' Beer
- **Activités** : bar_bières
- **Tags** : 6 tags "envie de..." avec différents poids
- **Description** : bar à bière XXL, soirée festive

## 🎯 Cas de test couverts

### Recherches qui priorisent BattleKart
- ✅ "faire du kart ce soir"
- ✅ "faire du karting ce soir"
- ✅ "kart ce soir"

### Recherches qui priorisent M'Beer
- ✅ "boire une bière ce soir"
- ✅ "boire un verre ce soir"
- ✅ "bar ce soir"

### Recherches mixtes
- ✅ "faire du kart et boire une bière" (score les deux)
- ✅ "sortir ce soir" (scores faibles)

### Variations et robustesse
- ✅ Majuscules : "KART"
- ✅ Accents : "théâtre"
- ✅ Chaînes vides
- ✅ Stop words uniquement
- ✅ Chaînes très longues

## 🚀 Commandes de test

```bash
# Tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📊 Résultats attendus

### Score BattleKart pour "faire du kart ce soir"
- **Nom** : +50 (kart dans "BattleKart")
- **Description** : +30 (kart dans description)
- **Activité** : +100 (karting matche avec kart)
- **Total** : ~180 points

### Score M'Beer pour "faire du kart ce soir"
- **Tags** : +10-30 (mots de contexte "ce soir")
- **Description** : +3-6 (mots de contexte)
- **Total** : ~50-80 points

## 🔧 Configuration

Les tests utilisent Jest avec TypeScript et incluent :
- Mock de Prisma
- Mock de Next.js
- Configuration des variables d'environnement
- Mapping des modules

## 📈 Couverture de code

Les tests couvrent :
- ✅ Extraction des mots-clés
- ✅ Calcul de score
- ✅ Gestion des erreurs
- ✅ Cas limites
- ✅ Performance
- ✅ API complète

## 🎉 Résultat

**16 tests passent** avec une couverture complète de la fonctionnalité de recherche par envie, garantissant que le système fonctionne correctement dans tous les cas de figure !

