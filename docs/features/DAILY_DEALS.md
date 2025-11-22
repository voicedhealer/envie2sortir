# Système de Bons Plans Journaliers

## Vue d'ensemble

Le système de bons plans journaliers permet aux établissements **Premium** de créer et programmer des offres spéciales qui s'affichent automatiquement sur leurs pages publiques.

## Fonctionnalités

### Pour les établissements Premium

- ✅ Création de bons plans avec titre, description et médias
- ✅ Programmation avec dates et horaires spécifiques
- ✅ Upload d'images et de PDFs
- ✅ Gestion des prix (prix initial et prix réduit)
- ✅ Activation/désactivation des bons plans
- ✅ Duplication de bons plans existants
- ✅ Prévisualisation avant publication

### Pour les visiteurs

- ✅ Modal automatique au premier affichage (1x par jour)
- ✅ Card permanente dans la colonne de droite
- ✅ Affichage des réductions en pourcentage
- ✅ Accès au PDF si disponible
- ✅ Design attractif avec bordure orange néon

## Architecture

### Base de données

**Table: `daily_deals`**

```prisma
model DailyDeal {
  id              String        @id @default(cuid())
  establishmentId String
  title           String
  description     String
  originalPrice   Float?
  discountedPrice Float?
  imageUrl        String?
  pdfUrl          String?
  dateDebut       DateTime
  dateFin         DateTime
  heureDebut      String?
  heureFin        String?
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

### Routes API

#### GET `/api/deals/[establishmentId]`
Récupère tous les bons plans d'un établissement.

#### GET `/api/deals/active/[establishmentId]`
Récupère le bon plan actif du jour pour un établissement (utilisé sur les pages publiques).

#### POST `/api/deals`
Crée un nouveau bon plan.

**Body:**
```json
{
  "establishmentId": "string",
  "title": "string",
  "description": "string",
  "originalPrice": 5.00,
  "discountedPrice": 3.00,
  "imageUrl": "/uploads/deals/...",
  "pdfUrl": "/uploads/deals/...",
  "dateDebut": "2024-01-01T00:00:00Z",
  "dateFin": "2024-01-01T23:59:59Z",
  "heureDebut": "12:00",
  "heureFin": "13:30",
  "isActive": true
}
```

#### PUT `/api/deals/[dealId]`
Modifie un bon plan existant.

#### DELETE `/api/deals/[dealId]`
Supprime un bon plan.

#### POST `/api/upload/deal-media`
Upload d'images ou de PDFs pour les bons plans.

**FormData:**
- `file`: File (image ou PDF)
- `establishmentId`: string
- `fileType`: "image" | "pdf"

### Composants

#### Dashboard

**`DealsManager.tsx`**
- Gestion complète des bons plans
- Liste organisée (actifs, à venir, passés)
- Formulaire de création/édition
- Upload de médias
- Actions (modifier, dupliquer, supprimer)

#### Page publique

**`DailyDealModal.tsx`**
- Modal d'affichage complet
- Affichage automatique au chargement (1x par jour)
- Design attractif avec bordure néon

**`DailyDealCard.tsx`**
- Card compacte pour affichage permanent
- Positionnée au-dessus des "Informations de contact"
- Cliquable pour rouvrir le modal

### Utilitaires

**`deal-utils.ts`**
- `isDealActive(deal)`: Vérifie si un bon plan est dans sa période de validité
- `formatDealTime(deal)`: Formate l'affichage des horaires
- `formatPrice(price)`: Formate un prix avec le symbole €
- `calculateDiscount(original, discounted)`: Calcule le pourcentage de réduction
- `hasSeenDealToday(dealId)`: Vérifie si l'utilisateur a déjà vu le modal aujourd'hui
- `markDealAsSeen(dealId)`: Marque le modal comme vu dans localStorage

## Accès Dashboard

Les établissements Premium peuvent accéder à la gestion des bons plans via :

**Dashboard → Onglet "Bons plans"**

L'onglet n'est visible que pour les comptes Premium.

## Affichage Public

Les bons plans s'affichent sur la page établissement de deux façons :

1. **Modal automatique** : S'affiche au premier chargement de la page (1x par jour par bon plan)
2. **Card permanente** : Visible dans la colonne de droite, au-dessus des "Informations de contact"

## Logique de validation

Un bon plan est considéré comme **actif** si :
- `isActive === true`
- Date actuelle entre `dateDebut` et `dateFin`
- Si des horaires sont définis : heure actuelle entre `heureDebut` et `heureFin`

## Design

### Couleurs
- Bordure orange néon : `border-2 border-orange-500 shadow-lg shadow-orange-500/20`
- Fond blanc crème : `bg-gradient-to-br from-orange-50/80 to-white`
- Prix réduit : `text-orange-600`
- Prix initial : `text-gray-400 line-through`

### Responsive
- Mobile : Card pleine largeur
- Desktop : Card dans colonne latérale

## Stockage des médias

Les fichiers sont stockés dans :
```
public/uploads/deals/
  ├── {timestamp}_{random}.jpg
  ├── {timestamp}_{random}.png
  └── {timestamp}_{random}.pdf
```

## Limitations

- **Compte Premium uniquement** : Les comptes Free ne peuvent pas créer de bons plans
- **Un bon plan actif à la fois** : Le système affiche le bon plan le plus récent parmi ceux actifs
- **Stockage local** : Le tracking des modals vus est stocké dans localStorage (par navigateur)
- **Taille des fichiers** :
  - Images : 5 MB maximum
  - PDFs : 10 MB maximum

## Exemples d'utilisation

### Cas d'usage typiques

1. **Happy Hour**
   - Titre : "Happy Hour : Bières à 3€"
   - Horaires : 17:00 - 19:00
   - Dates : Tous les vendredis

2. **Menu du jour**
   - Titre : "Menu du jour à 12€"
   - Horaires : 12:00 - 14:00
   - PDF : Menu complet

3. **Promotion weekend**
   - Titre : "Brunch à -30%"
   - Dates : Samedi et dimanche
   - Horaires : 10:00 - 15:00

## Sécurité

- ✅ Vérification de propriété de l'établissement
- ✅ Vérification du statut Premium
- ✅ Validation des fichiers uploadés (type, taille, contenu)
- ✅ Protection CSRF sur les mutations
- ✅ Validation des dates et horaires

## Performance

- Les bons plans sont chargés de manière asynchrone
- Pas d'impact sur le temps de chargement initial
- Requêtes optimisées avec index sur `[establishmentId, isActive, dateDebut, dateFin]`

## Migration

La migration `20251010152647_add_daily_deals` a créé la table `daily_deals` avec tous les champs nécessaires et les index optimisés.

Pour appliquer la migration sur un autre environnement :
```bash
npx prisma migrate deploy
```



