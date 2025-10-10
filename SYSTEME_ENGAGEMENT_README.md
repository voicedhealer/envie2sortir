# Système d'Engagement Événementiel 🎉

## Vue d'ensemble

Le système d'engagement événementiel est une fonctionnalité complète de gamification permettant aux utilisateurs de réagir aux événements et de débloquer des badges en fonction de leur activité.

## 🎯 Fonctionnalités Principales

### 1. Jauge d'Engagement Progressive (0-150%)
- **Gradient de couleurs** : Vert → Jaune → Orange → Rouge → Violet
- **Animation spéciale** : Effet "fire mode" pour 100-150% (violet pulsé)
- **Calcul dynamique** : Score basé sur les types de réactions

### 2. Types de Réactions
Les utilisateurs peuvent exprimer 4 types d'engagement :

| Type | Score | Emoji | Label |
|------|-------|-------|-------|
| `envie` | +1 | 🌟 | Envie d'y être ! |
| `grande-envie` | +3 | 🔥 | Ultra envie ! |
| `decouvrir` | +2 | 🔍 | Envie de découvrir |
| `pas-envie` | -1 | ❌ | Pas mon envie |

### 3. Badges d'Événement
Les événements reçoivent automatiquement des badges selon leur score :

- **👍 Apprécié** (50-74%) - Bronze
- **⭐ Populaire** (75-99%) - Argent  
- **🏆 Coup de Cœur** (100-149%) - Or
- **🔥 C'EST LE FEU !** (150%+) - Violet (effet spécial)

### 4. Gamification Utilisateur
- **Karma Points** : Cumulés à chaque engagement
- **Badges Personnels** :
  - 🔍 **Curieux** : 5 engagements
  - 🗺️ **Explorateur** : 15 engagements
  - 👑 **Ambassadeur** : 50 engagements
  - 🎆 **Feu d'artifice** : Contribuer à un événement atteignant 150%

## 📁 Structure des Fichiers

### Base de Données (Prisma)
```
prisma/
├── schema.prisma                    # Modèles EventEngagement, User (gamification), Event
└── migrations/
    └── 20251009173654_add_event_engagement_system/
        └── migration.sql
```

**Modèles ajoutés :**
- `EventEngagement` : Stockage des réactions utilisateurs
- Champs User : `karmaPoints`, `gamificationBadges`
- Relation Event : `engagements[]`

### Routes API
```
src/app/api/
├── events/
│   ├── [eventId]/
│   │   └── engage/
│   │       └── route.ts          # POST/GET - Créer/Récupérer engagements
│   └── upcoming/
│       └── route.ts               # GET - Liste événements à venir
└── user/
    └── gamification/
        └── route.ts               # GET/POST - Badges et karma
```

### Composants React
```
src/components/
├── EventEngagementGauge.tsx       # Jauge progressive avec gradient
├── EventEngagementButtons.tsx     # Boutons de réaction
├── UserBadges.tsx                 # Affichage badges utilisateur
├── EventEngagement.module.css     # Styles et animations
└── EventCard.tsx                  # Intégration du système (modifié)
```

### Pages
```
src/app/
├── evenements/
│   ├── page.tsx                   # Liste de tous les événements
│   └── [establishmentSlug]/
│       └── page.tsx               # Événements par établissement
└── mon-compte/
    └── page.tsx                   # Profil + onglet Badges & Karma (modifié)
```

## 🔌 API Endpoints

### POST `/api/events/[eventId]/engage`
Créer ou mettre à jour un engagement utilisateur.

**Body :**
```json
{
  "type": "grande-envie"
}
```

**Response :**
```json
{
  "success": true,
  "engagement": { ... },
  "stats": {
    "envie": 5,
    "grande-envie": 12,
    "decouvrir": 3,
    "pas-envie": 1
  },
  "gaugePercentage": 85,
  "eventBadge": {
    "type": "silver",
    "label": "⭐ Populaire",
    "color": "#C0C0C0"
  },
  "userEngagement": "grande-envie",
  "newBadge": null,
  "userKarma": 15
}
```

### GET `/api/events/[eventId]/engage`
Récupérer les statistiques d'engagement d'un événement.

### GET `/api/events/upcoming`
Liste des événements à venir avec scores d'engagement.

**Query params :**
- `city` (optional) : Filtrer par ville
- `limit` (optional) : Nombre max d'événements (défaut: 50)

### GET `/api/user/gamification`
Récupérer les badges et karma de l'utilisateur connecté.

## 🎨 Composants d'Interface

### EventEngagementGauge
```tsx
<EventEngagementGauge
  percentage={85}
  eventBadge={{
    type: 'silver',
    label: '⭐ Populaire',
    color: '#C0C0C0'
  }}
/>
```

### EventEngagementButtons
```tsx
<EventEngagementButtons
  eventId="evt_123"
  stats={{
    envie: 5,
    'grande-envie': 12,
    decouvrir: 3,
    'pas-envie': 1
  }}
  userEngagement="grande-envie"
  onEngagementUpdate={(data) => console.log(data)}
/>
```

### UserBadges
```tsx
<UserBadges 
  compact={false}
  showProgress={true}
/>
```

## 🔐 Authentification

- **Requis pour réagir** : Les utilisateurs doivent être connectés
- **Consultation publique** : Les stats sont visibles par tous
- **One reaction per user** : Contrainte unique (eventId, userId)

## 🎯 Formule de Calcul

### Score Total
```
Score = (envie × 1) + (grande-envie × 3) + (decouvrir × 2) + (pas-envie × -1)
```

### Pourcentage Jauge
```
Percentage = min((Score / 15) × 100, 150)
```

- **Score 15** = 100%
- **Score 22.5** = 150% (maximum)

### Karma Utilisateur
Le karma est incrémenté selon le type d'engagement :
- `envie` : +1 karma
- `grande-envie` : +3 karma
- `decouvrir` : +2 karma
- `pas-envie` : -1 karma

## 🎭 Animations CSS

### Fire Mode (100-150%)
```css
@keyframes fireMode {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(156, 39, 176, 0.6);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 30px rgba(156, 39, 176, 0.9);
  }
}
```

### Badge Appear
```css
@keyframes badgeAppear {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

## 📊 Statistiques Disponibles

### Par Événement
- Nombre total d'engagements
- Répartition par type
- Score total et pourcentage
- Badge attribué

### Par Utilisateur
- Karma total
- Badges débloqués
- Historique des engagements
- Progression vers prochains badges

## 🧪 Tests Recommandés

### Phase 1 - Base de données
- [x] Migration appliquée sans erreur
- [x] Relations Prisma fonctionnelles
- [x] Contraintes uniques respectés

### Phase 2 - API
- [ ] Route engage : POST avec authentification
- [ ] Calcul correct du score (0-150%)
- [ ] Mise à jour karma utilisateur
- [ ] Gestion des erreurs (non connecté, événement inexistant)

### Phase 3 - Composants
- [ ] Jauge affiche correctement 0-150%
- [ ] Gradient violet visible pour 100-150%
- [ ] Boutons fonctionnels avec compteurs
- [ ] Badges s'affichent selon seuils

### Phase 4 - Intégration
- [ ] EventCard avec engagement
- [ ] Page événements fonctionnelle
- [ ] Navigation fluide
- [ ] Responsive mobile/desktop

### Phase 5 - Gamification
- [ ] Déblocage badges automatique
- [ ] Notification toast badges
- [ ] Karma points calculés
- [ ] Profil utilisateur à jour

## 🚀 Utilisation

### 1. Voir les événements
```
/evenements
```

### 2. Voir les événements d'un établissement
```
/evenements/[slug-etablissement]
```

### 3. Réagir à un événement
Cliquer sur un bouton d'engagement (nécessite connexion)

### 4. Voir ses badges
```
/mon-compte?tab=badges
```

## 📱 Responsive Design

Le système est entièrement responsive :
- **Desktop** : Grille 4 colonnes pour boutons
- **Tablet** : Grille 2 colonnes
- **Mobile** : Grille 2 colonnes compacte

## 🎁 Améliorations Futures

### Potentielles
- [ ] Notifications push lors du déblocage de badges
- [ ] Classement (leaderboard) des utilisateurs
- [ ] Badges spéciaux pour événements (ex: "Early bird")
- [ ] Système de streaks (engagement quotidien)
- [ ] Récompenses pour les établissements populaires
- [ ] Partage sur réseaux sociaux avec badge

### Performance
- [ ] Cache Redis pour scores d'événements
- [ ] Aggregation périodique des stats
- [ ] Lazy loading des badges
- [ ] Service worker pour notifications

## 🔧 Configuration

### Variables d'environnement
Aucune variable spécifique requise. Le système utilise :
- NextAuth pour l'authentification
- Prisma pour la base de données

### Dépendances ajoutées
Aucune nouvelle dépendance. Utilise :
- `next-auth` (existant)
- `@prisma/client` (existant)
- `lucide-react` (existant)

## 📝 Notes de Migration

La migration `20251009173654_add_event_engagement_system` crée :
1. Table `event_engagements`
2. Champs `karmaPoints` et `gamificationBadges` dans `users`
3. Index unique sur (eventId, userId)
4. Foreign keys avec CASCADE delete

## 🐛 Debugging

### Problème : La jauge ne s'affiche pas
- Vérifier que l'API `/api/events/[eventId]/engage` retourne bien les données
- Vérifier la console pour les erreurs de fetch

### Problème : Les réactions ne fonctionnent pas
- Vérifier que l'utilisateur est connecté
- Vérifier les permissions NextAuth
- Vérifier que l'eventId est valide

### Problème : Les badges ne se débloquent pas
- Vérifier le calcul du seuil dans l'API
- Vérifier la mise à jour de `gamificationBadges` en base
- Vérifier les logs de la route `/api/events/[eventId]/engage`

---

**Créé le :** 9 octobre 2025  
**Version :** 1.0.0  
**Auteur :** Système d'engagement événementiel - envie2sortir.fr

