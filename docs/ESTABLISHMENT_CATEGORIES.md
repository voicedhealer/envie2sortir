# 🏷️ Système de Catégorisation des Établissements

## 📋 Vue d'ensemble

Le système de catégorisation harmonisé permet d'organiser de manière cohérente toutes les informations des établissements à travers l'application : formulaire d'ajout, récapitulatif, et page publique.

## 🎯 Problème résolu

**Avant :** Les données étaient mélangées et incohérentes entre les différentes étapes :
- Formulaire d'ajout : bien organisé par catégories
- Récapitulatif : sections délimitées mais pas cohérentes
- Page publique : tout mélangé dans "Ambiance & Spécialités"

**Après :** Système unifié avec 6 catégories cohérentes partout.

## 🏗️ Architecture

### Fichiers principaux

```
src/lib/establishment-categories.ts          # Logique de catégorisation
src/components/EstablishmentCategorySection.tsx  # Composant d'affichage
src/components/forms/TagsSelector.tsx        # Sélecteur mis à jour
src/components/EstablishmentSections.tsx     # Sections publiques harmonisées
scripts/migrate-establishment-categories.js  # Script de migration
```

### Catégories définies

| ID | Label | Icône | Description | Couleur |
|---|---|---|---|---|
| `services-restauration` | Services de restauration | 🍽️ | Services liés aux repas | Orange |
| `ambiance-atmosphere` | Ambiance & Atmosphère | 🎨 | Ambiance et spécialités | Violet |
| `commodites-equipements` | Commodités & Équipements | 🔧 | Services pratiques | Vert |
| `clientele-cible` | Clientèle cible | 👥 | Types de clientèle | Bleu |
| `activites-evenements` | Activités & Événements | 🎉 | Activités proposées | Rose |
| `informations-pratiques` | Informations pratiques | ℹ️ | Infos utiles | Gris |

## 🔧 Utilisation

### 1. Catégorisation automatique

```typescript
import { categorizeTag, organizeTagsByCategory } from '@/lib/establishment-categories';

// Catégoriser un tag individuel
const category = categorizeTag('WiFi'); // 'commodites-equipements'

// Organiser une liste de tags
const organizedTags = organizeTagsByCategory([
  'Déjeuner', 'WiFi', 'Groupes', 'Bowling'
]);
// Résultat: { 'services-restauration': ['Déjeuner'], 'commodites-equipements': ['WiFi'], ... }
```

### 2. Affichage des sections

```tsx
import EstablishmentCategorySection from '@/components/EstablishmentCategorySection';

<EstablishmentCategorySection
  categoryId="services-restauration"
  items={['Déjeuner', 'Dîner', 'Desserts']}
  isCollapsible={true}
  showCount={true}
/>
```

### 3. Migration des données existantes

```bash
# Créer un backup
node scripts/migrate-establishment-categories.js --backup

# Exécuter la migration
node scripts/migrate-establishment-categories.js --migrate

# Les deux
node scripts/migrate-establishment-categories.js --backup --migrate
```

## 📊 Règles de catégorisation

### Services de restauration
- Mots-clés : `déjeuner`, `dîner`, `dessert`, `repas`, `service à table`, `brunch`
- Exemples : "Déjeuner", "Service à table", "Desserts"

### Ambiance & Atmosphère
- Mots-clés : `ambiance`, `romantique`, `chic`, `cosy`, `pizza`, `cocktails`, `vins`
- Exemples : "Ambiance décontractée", "Pizza", "Cocktails", "Romantique"

### Commodités & Équipements
- Mots-clés : `wifi`, `climatisation`, `toilettes`, `terrasse`, `parking`, `livraison`
- Exemples : "WiFi", "Climatisation", "Livraison", "Réservation"

### Clientèle cible
- Mots-clés : `groupe`, `couple`, `famille`, `enfants`, `étudiants`, `seniors`
- Exemples : "Groupes", "Familles", "Étudiants", "Couples"

### Activités & Événements
- Mots-clés : `bowling`, `escape`, `karaoké`, `concert`, `danse`, `anniversaire`
- Exemples : "Bowling", "Escape Game", "Karaoké", "Anniversaire"

### Informations pratiques
- Mots-clés : `non-fumeurs`, `réservation`, `handicap`, `parking-gratuit`
- Exemples : "Espace non-fumeurs", "Réservation recommandée", "Parking gratuit"

## 🚀 Avantages

### ✅ Cohérence
- Même organisation partout dans l'application
- Plus de confusion entre les étapes
- Interface utilisateur harmonisée

### ✅ Maintenabilité
- Code centralisé et réutilisable
- Facile d'ajouter de nouvelles catégories
- Logique de catégorisation centralisée

### ✅ Évolutivité
- Système extensible
- Migration des données existantes
- Compatible avec le code existant

### ✅ Performance
- Catégorisation automatique
- Pas de perte de données
- Migration en lot possible

## 🧪 Test et démonstration

### Page de test
Visitez `/test-categories` pour tester le système interactivement.

### Composant de démonstration
```tsx
import CategoryDemo from '@/components/CategoryDemo';

<CategoryDemo />
```

## 📈 Migration

### Avant la migration
1. **Backup** : Créer un backup des données existantes
2. **Test** : Tester sur un environnement de développement
3. **Validation** : Vérifier les résultats de catégorisation

### Pendant la migration
1. **Analyse** : Le script analyse chaque établissement
2. **Catégorisation** : Organisation automatique des tags
3. **Mise à jour** : Sauvegarde des données organisées
4. **Rapport** : Génération d'un rapport détaillé

### Après la migration
1. **Vérification** : Contrôler les résultats
2. **Ajustements** : Corriger les catégorisations incorrectes
3. **Monitoring** : Surveiller les nouvelles données

## 🔄 Intégration

### Formulaire d'ajout
- `TagsSelector` utilise les nouvelles catégories
- Suggestions basées sur les activités
- Interface cohérente

### Page publique
- `EstablishmentSections` affiche les sections harmonisées
- Remplacement du mélange confus
- Conservation des données existantes

### Récapitulatif
- Affichage organisé par catégories
- Cohérence avec le formulaire et la page publique
- Meilleure lisibilité

## 🛠️ Maintenance

### Ajouter une nouvelle catégorie
1. Modifier `ESTABLISHMENT_CATEGORIES` dans `establishment-categories.ts`
2. Mettre à jour la fonction `categorizeTag`
3. Tester avec la page de démonstration
4. Migrer les données existantes si nécessaire

### Modifier les règles de catégorisation
1. Éditer la fonction `categorizeTag`
2. Tester avec des données de test
3. Exécuter la migration si nécessaire

## 📝 Notes importantes

- **Rétrocompatibilité** : Le système est compatible avec les données existantes
- **Performance** : La catégorisation est rapide et efficace
- **Flexibilité** : Facile d'ajuster les règles de catégorisation
- **Évolutivité** : Le système peut être étendu facilement

## 🎉 Résultat

Le système de catégorisation harmonisé résout le problème d'incohérence entre les différentes étapes de l'application, offrant une expérience utilisateur cohérente et une maintenance simplifiée.
