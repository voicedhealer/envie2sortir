# Routes Migrées vers Supabase

## ✅ Routes Migrées

### 1. GET /api/etablissements/[slug] ✅
**Fichier** : `src/app/api/etablissements/[slug]/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.findUnique` par `supabase.from('establishments').select()`
- Adaptation des relations (include → select avec syntaxe Supabase)
- Conversion des noms de colonnes (camelCase → snake_case)
- Récupération des compteurs (favorites, likes, comments) via requêtes séparées
- Parsing des champs JSON

**Test** : 
```bash
curl http://localhost:3000/api/etablissements/votre-slug-test
```

### 2. PUT /api/etablissements/[slug] ✅
**Fichier** : `src/app/api/etablissements/[slug]/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.update` par `supabase.from('establishments').update()`
- Conversion camelCase → snake_case pour les champs
- Gestion des tags via Supabase (suppression puis insertion)
- Adaptation de `requireEstablishment` pour Supabase

**Test** :
```bash
curl -X PUT http://localhost:3000/api/etablissements/votre-slug \
  -H "Content-Type: application/json" \
  -d '{"name": "Nouveau nom"}'
```

### 3. DELETE /api/etablissements/[slug] ✅
**Fichier** : `src/app/api/etablissements/[slug]/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.delete` par `supabase.from('establishments').delete()`
- Récupération des statistiques avant suppression via requêtes séparées
- La suppression en cascade est gérée par les foreign keys PostgreSQL

**Test** :
```bash
curl -X DELETE http://localhost:3000/api/etablissements/votre-slug
```

### 4. GET /api/categories ✅
**Fichier** : `src/app/api/categories/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.findMany` par `supabase.from('establishments').select()`
- Utilisation de `.or()` pour la recherche (nom ou adresse)
- Parsing des champs JSON (activities)

**Test** :
```bash
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/categories?q=paris
```

### 5. GET /api/recherche/envie ✅
**Fichier** : `src/app/api/recherche/envie/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.findMany` par `supabase.from('establishments').select()`
- Chargement des tags et images via relations Supabase
- Parsing des champs JSON (activities, services, etc.)
- Logique de scoring et filtrage conservée (traitement en mémoire)

**Test** :
```bash
curl "http://localhost:3000/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5"
```

## 🔄 Helpers Créés

### `requireEstablishment()` ✅
**Fichier** : `src/lib/supabase/helpers.ts`

Fonction helper pour vérifier qu'un utilisateur est authentifié et est un professionnel avec un établissement.

**Utilisation** :
```typescript
import { requireEstablishment } from '@/lib/supabase/helpers';

const user = await requireEstablishment();
```

## 📝 Notes Importantes

### Conversion camelCase → snake_case

Les noms de colonnes doivent être convertis :
- `postalCode` → `postal_code`
- `imageUrl` → `image_url`
- `ownerId` → `owner_id`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `paymentMethods` → `payment_methods`
- `horairesOuverture` → `horaires_ouverture`
- etc.

### Relations Supabase

**Avant (Prisma)** :
```typescript
include: {
  owner: { select: { ... } },
  images: true
}
```

**Après (Supabase)** :
```typescript
.select(`
  *,
  owner:professionals!establishments_owner_id_fkey (...),
  images (*)
`)
```

### Parsing des Champs JSON

Supabase retourne les champs JSONB comme objets ou strings selon le cas. Il faut parser :
```typescript
const parseJsonField = (field: any) => {
  if (!field) return null;
  if (typeof field === 'object') return field;
  if (typeof field !== 'string') return field;
  try {
    return JSON.parse(field);
  } catch {
    return null;
  }
};
```

## ⏳ Routes Restantes à Migrer

### Routes Authentification
- [x] POST /api/auth/register ✅
- [x] POST /api/auth/login ✅
- [ ] GET /api/auth/[...nextauth]

### Routes CRUD
- [x] POST /api/professional-registration ✅
- [ ] POST /api/etablissements (création)
- [x] GET /api/establishments/all ✅
- [x] GET /api/establishments/random ✅
- [x] GET /api/events/upcoming ✅

### Routes Upload
- [x] POST /api/upload/image ✅
- [x] POST /api/upload/optimized-image ✅
- [x] POST /api/upload/deal-media ✅
- [x] POST /api/upload/event-image ✅

### Routes Recherche
- [ ] GET /api/recherche/filtered

### Routes Dashboard
- [ ] GET /api/dashboard/stats
- [ ] GET /api/dashboard/establishments
- [ ] GET /api/dashboard/events

### Routes Admin
- [ ] GET /api/admin/establishments
- [ ] POST /api/admin/establishments/actions

### Routes Autres
- [ ] GET /api/events/upcoming
- [ ] POST /api/events/[eventId]/engage
- [ ] GET /api/deals/all
- [ ] POST /api/deals
- [ ] GET /api/messaging/conversations
- [ ] etc.

## 🧪 Tests Recommandés

Pour chaque route migrée, tester :

1. **Requête basique** : Vérifier que la route répond
2. **Données** : Vérifier que les données sont correctes
3. **Relations** : Vérifier que les relations sont bien chargées
4. **Erreurs** : Tester les cas d'erreur (404, 403, etc.)
5. **Permissions** : Vérifier que les RLS policies fonctionnent

### 6. POST /api/auth/register ✅
**Fichier** : `src/app/api/auth/register/route.ts`

**Changements** :
- Utilisation de `signUp()` depuis `src/lib/supabase/auth-actions.ts`
- Migration vers Supabase Auth
- Création du profil utilisateur dans la table `users`

### 7. POST /api/auth/login ✅
**Fichier** : `src/app/api/auth/login/route.ts`

**Changements** :
- Utilisation de `signIn()` depuis `src/lib/supabase/auth-actions.ts`
- Migration vers Supabase Auth

### 8. GET /api/establishments/all ✅
**Fichier** : `src/app/api/establishments/all/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.findMany` par Supabase
- Chargement des relations (tags, images, events) via Supabase
- Parsing des champs JSON
- Tri et pagination conservés

### 9. GET /api/establishments/random ✅
**Fichier** : `src/app/api/establishments/random/route.ts`

**Changements** :
- Remplacement de `prisma.establishment.findMany` par Supabase
- Conversion snake_case → camelCase pour compatibilité
- Filtrage géographique conservé

### 10. GET /api/events/upcoming ✅
**Fichier** : `src/app/api/events/upcoming/route.ts`

**Changements** :
- Remplacement de `prisma.event.findMany` par Supabase
- Chargement des relations (establishment, engagements)
- Conversion snake_case → camelCase
- Logique de filtrage récurrent conservée

### 11. POST /api/upload/image ✅
**Fichier** : `src/app/api/upload/image/route.ts`

**Changements** :
- Migration vers Supabase Storage (bucket `images`)
- Upload après optimisation locale
- Création d'entrée dans table `images` via Supabase
- Mise à jour `image_url` de l'établissement

### 12. POST /api/upload/optimized-image ✅
**Fichier** : `src/app/api/upload/optimized-image/route.ts`

**Changements** :
- Migration vers Supabase Storage
- Upload de toutes les variantes optimisées
- Utilisation de `requireEstablishment()` pour l'authentification

### 13. POST /api/upload/deal-media ✅
**Fichier** : `src/app/api/upload/deal-media/route.ts`

**Changements** :
- Migration vers Supabase Storage (bucket `menus` pour PDF, `images` pour images)
- Vérification Premium requise
- Upload direct sans optimisation

### 14. POST /api/upload/event-image ✅
**Fichier** : `src/app/api/upload/event-image/route.ts`

**Changements** :
- Migration vers Supabase Storage (bucket `images`)
- Vérification Premium requise
- Upload d'images pour événements

### 15. POST /api/professional-registration ✅
**Fichier** : `src/app/api/professional-registration/route.ts`

**Changements** :
- Migration vers Supabase Auth pour la création du compte
- Utilisation de `signUpProfessional()` dans `auth-actions.ts`
- Création du professional, établissement et tags en une seule transaction
- Gestion du rollback en cas d'erreur
- Conservation de toute la logique de géocodage et parsing

**Fonction créée** : `signUpProfessional()` dans `src/lib/supabase/auth-actions.ts`

### 16. GET /api/dashboard/events ✅
**Fichier** : `src/app/api/dashboard/events/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les événements
- Vérification Premium requise
- Conversion snake_case → camelCase

### 17. POST /api/dashboard/events ✅
**Fichier** : `src/app/api/dashboard/events/route.ts`

**Changements** :
- Migration vers Supabase pour créer un événement
- Vérification Premium requise
- Conversion des dates et champs

### 18. PUT /api/dashboard/events/[id] ✅
**Fichier** : `src/app/api/dashboard/events/[id]/route.ts`

**Changements** :
- Migration vers Supabase pour modifier un événement
- Vérification que l'événement appartient à l'établissement
- Vérification Premium requise

### 19. DELETE /api/dashboard/events/[id] ✅
**Fichier** : `src/app/api/dashboard/events/[id]/route.ts`

**Changements** :
- Migration vers Supabase pour supprimer un événement
- Vérification que l'événement appartient à l'établissement
- Vérification Premium requise

### 20. GET /api/dashboard/images ✅
**Fichier** : `src/app/api/dashboard/images/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les images
- Conversion snake_case → camelCase
- Tri par ordre conservé

### 21. POST /api/dashboard/images ✅
**Fichier** : `src/app/api/dashboard/images/route.ts`

**Changements** :
- Migration vers Supabase Storage pour l'upload
- Vérification des limites d'abonnement
- Création automatique de l'image principale si première image

### 22. DELETE /api/dashboard/images/[id] ✅
**Fichier** : `src/app/api/dashboard/images/[id]/route.ts`

**Changements** :
- Migration vers Supabase Storage pour la suppression
- Suppression du fichier dans Supabase Storage
- Mise à jour automatique de l'imageUrl de l'établissement

### 23. POST /api/dashboard/change-password ✅
**Fichier** : `src/app/api/dashboard/change-password/route.ts`

**Changements** :
- Migration vers Supabase Auth pour le changement de mot de passe
- Utilisation de `updateUser()` de Supabase Auth
- Validation du mot de passe actuel via `signInWithPassword()`

### 24. GET /api/admin/establishments ✅
**Fichier** : `src/app/api/admin/establishments/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les établissements
- Utilisation de `isAdmin()` pour vérifier les permissions
- Calcul des compteurs (_count) via requêtes séparées
- Statistiques par statut
- Pagination et recherche

### 25. PATCH /api/admin/establishments ✅
**Fichier** : `src/app/api/admin/establishments/route.ts`

**Changements** :
- Migration vers Supabase pour approuver/rejeter les établissements
- Utilisation de `isAdmin()` pour vérifier les permissions
- Conversion snake_case → camelCase

### 26. GET /api/deals/all ✅
**Fichier** : `src/app/api/deals/all/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer tous les deals actifs
- Conversion snake_case → camelCase
- Filtrage avec `isDealActive`

### 27. GET /api/user/favorites ✅
**Fichier** : `src/app/api/user/favorites/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les favoris
- Utilisation de `getCurrentUser()` pour l'authentification
- Conversion snake_case → camelCase

### 28. POST /api/user/favorites ✅
**Fichier** : `src/app/api/user/favorites/route.ts`

**Changements** :
- Migration vers Supabase pour créer/upsert un favori
- Vérification de l'existence avant création

### 29. DELETE /api/user/favorites/[id] ✅
**Fichier** : `src/app/api/user/favorites/[id]/route.ts`

**Changements** :
- Migration vers Supabase pour supprimer un favori
- Vérification de propriété avant suppression

### 30. GET /api/user/comments ✅
**Fichier** : `src/app/api/user/comments/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les commentaires
- Conversion snake_case → camelCase

### 31. POST /api/user/comments ✅
**Fichier** : `src/app/api/user/comments/route.ts`

**Changements** :
- Migration vers Supabase pour créer/mettre à jour un commentaire
- Validation du contenu (bad-words filter)
- Mise à jour automatique de `avg_rating` et `total_comments` de l'établissement

### 32. POST /api/deals ✅
**Fichier** : `src/app/api/deals/route.ts`

**Changements** :
- Migration vers Supabase pour créer un deal
- Vérification Premium subscription
- Utilisation de `requireEstablishment()`
- Conversion snake_case → camelCase

### 33. PUT /api/deals/[dealId] ✅
**Fichier** : `src/app/api/deals/[dealId]/route.ts`

**Changements** :
- Migration vers Supabase pour mettre à jour un deal
- Vérification de propriété
- Conversion snake_case → camelCase

### 34. DELETE /api/deals/[dealId] ✅
**Fichier** : `src/app/api/deals/[dealId]/route.ts`

**Changements** :
- Migration vers Supabase pour supprimer un deal
- Vérification de propriété

### 35. GET /api/deals/by-establishment/[establishmentId] ✅
**Fichier** : `src/app/api/deals/by-establishment/[establishmentId]/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer tous les deals d'un établissement
- Conversion snake_case → camelCase

### 36. GET /api/deals/active/[establishmentId] ✅
**Fichier** : `src/app/api/deals/active/[establishmentId]/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les deals actifs d'un établissement
- Filtrage avec `isDealActive`
- Conversion snake_case → camelCase

### 37. POST /api/deals/engagement ✅
**Fichier** : `src/app/api/deals/engagement/route.ts`

**Changements** :
- Migration vers Supabase pour enregistrer les engagements (liked/disliked)
- Utilisation de l'IP pour éviter les doublons
- Upsert des engagements existants

### 38. GET /api/deals/engagement ✅
**Fichier** : `src/app/api/deals/engagement/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les statistiques d'engagement
- Calcul des stats (liked, disliked, engagementRate)
- Conversion snake_case → camelCase

### 39. GET /api/public/establishments/[slug]/comments ✅
**Fichier** : `src/app/api/public/establishments/[slug]/comments/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les commentaires publics d'un établissement
- Jointure avec la table `users` pour les infos utilisateur
- Conversion snake_case → camelCase

### 40. GET /api/admin/stats ✅
**Fichier** : `src/app/api/admin/stats/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les statistiques admin
- Comptage des établissements par statut
- Récupération des établissements récents avec infos propriétaire
- Conversion snake_case → camelCase

### 41. GET /api/admin/pending-count ✅
**Fichier** : `src/app/api/admin/pending-count/route.ts`

**Changements** :
- Migration vers Supabase pour compter les éléments en attente
- Comptage des établissements et demandes de modification en attente
- Utilisation de `isAdmin()` pour vérifier les permissions

### 42. GET /api/admin/metrics ✅
**Fichier** : `src/app/api/admin/metrics/route.ts`

**Changements** :
- Migration vers Supabase pour les métriques système
- Comptage des établissements via Supabase
- Métriques système (mémoire, CPU, API) conservées

### 43. PATCH /api/admin/establishments/actions ✅
**Fichier** : `src/app/api/admin/establishments/actions/route.ts`

**Changements** :
- Migration vers Supabase pour les actions admin sur les établissements
- Support des actions : approve, reject, pending, delete
- Création automatique d'actions admin dans l'historique
- Conversion snake_case → camelCase

### 44. POST /api/admin/actions ✅
**Fichier** : `src/app/api/admin/actions/route.ts`

**Changements** :
- Migration vers Supabase pour créer des actions admin
- Jointure avec users et establishments
- Conversion snake_case → camelCase

### 45. GET /api/admin/actions ✅
**Fichier** : `src/app/api/admin/actions/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer l'historique des actions
- Pagination et filtrage par établissement
- Conversion snake_case → camelCase

### 46. POST /api/dashboard/images/set-card-image ✅
**Fichier** : `src/app/api/dashboard/images/set-card-image/route.ts`

**Changements** :
- Migration vers Supabase pour définir l'image de card
- Utilisation de `requireEstablishment()`
- Conversion snake_case → camelCase

### 47. PUT /api/dashboard/images/reorder ✅
**Fichier** : `src/app/api/dashboard/images/reorder/route.ts`

**Changements** :
- Migration vers Supabase pour réorganiser les images
- Mise à jour de l'ordre et de l'image principale
- Conversion snake_case → camelCase

### 48. PUT /api/professional/profile ✅
**Fichier** : `src/app/api/professional/profile/route.ts`

**Changements** :
- Migration vers Supabase pour mettre à jour le profil professionnel
- Utilisation de `requireEstablishment()`
- Mise à jour de l'établissement avec statut "pending" pour modération
- Conversion snake_case → camelCase

### 49. GET /api/professional/pricing ✅
**Fichier** : `src/app/api/professional/pricing/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les tarifs
- Conversion des tarifs en format clé-valeur
- Conversion snake_case → camelCase

### 50. PUT /api/professional/pricing ✅
**Fichier** : `src/app/api/professional/pricing/route.ts`

**Changements** :
- Migration vers Supabase pour mettre à jour les tarifs
- Suppression et recréation des tarifs
- Mise à jour du statut de l'établissement pour modération

### 51. GET /api/professional/dashboard ✅
**Fichier** : `src/app/api/professional/dashboard/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les données du dashboard
- Récupération du professionnel, établissement, événements et images
- Conversion snake_case → camelCase

### 52. GET /api/professional/establishment ✅
**Fichier** : `src/app/api/professional/establishment/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer l'établissement du professionnel
- Utilisation de `requireEstablishment()`

### 53-55. POST/PUT/DELETE /api/professional/events ✅
**Fichier** : `src/app/api/professional/events/route.ts`

**Changements** :
- Migration vers Supabase pour créer, modifier et supprimer des événements
- Vérification de propriété des événements
- Conversion snake_case → camelCase

### 56. GET /api/professional/update-requests ✅
**Fichier** : `src/app/api/professional/update-requests/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les demandes de mise à jour
- Conversion snake_case → camelCase

### 57. PUT /api/user/update-profile ✅
**Fichier** : `src/app/api/user/update-profile/route.ts`

**Changements** :
- Migration vers Supabase pour mettre à jour le profil utilisateur
- Utilisation de Supabase Auth pour la vérification et la mise à jour du mot de passe
- Conversion snake_case → camelCase

### 58. DELETE /api/user/delete-account ✅
**Fichier** : `src/app/api/user/delete-account/route.ts`

**Changements** :
- Migration vers Supabase pour supprimer le compte utilisateur
- Suppression en cascade des données associées (favoris, commentaires, likes)

### 59-65. Routes Messaging ✅
**Fichiers** :
- `src/app/api/messaging/conversations/route.ts` (GET, POST)
- `src/app/api/messaging/conversations/[id]/route.ts` (GET)
- `src/app/api/messaging/conversations/[id]/messages/route.ts` (POST)
- `src/app/api/messaging/conversations/[id]/read/route.ts` (PATCH)
- `src/app/api/messaging/conversations/[id]/status/route.ts` (PATCH)
- `src/app/api/messaging/unread-count/route.ts` (GET)

**Changements** :
- Migration complète du système de messagerie vers Supabase
- Gestion des conversations et messages avec relations complexes
- Permissions admin/professional
- Conversion snake_case → camelCase

### 66. POST /api/professional/request-update ✅
**Fichier** : `src/app/api/professional/request-update/route.ts`

**Changements** :
- Migration vers Supabase pour créer des demandes de mise à jour
- Gestion des champs avec mise à jour immédiate vs validation admin
- Vérification d'unicité pour email et SIRET
- Conversion snake_case → camelCase

### 67. GET /api/professional/verify-email ✅
**Fichier** : `src/app/api/professional/verify-email/route.ts`

**Changements** :
- Migration vers Supabase pour vérifier l'email via token
- Mise à jour du statut de vérification

### 68. GET /api/admin/professionals ✅
**Fichier** : `src/app/api/admin/professionals/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer la liste des professionnels
- Utilisation de `isAdmin()` pour l'autorisation
- Conversion snake_case → camelCase

### 69. POST /api/admin/review-update ✅
**Fichier** : `src/app/api/admin/review-update/route.ts`

**Changements** :
- Migration vers Supabase pour approuver/rejeter les demandes de mise à jour
- Mise à jour du professionnel si approuvé
- Conversion snake_case → camelCase

### 70. GET /api/recherche/filtered ✅
**Fichier** : `src/app/api/recherche/filtered/route.ts`

**Changements** :
- Migration vers Supabase pour la recherche filtrée
- Parsing des champs JSONB (activities, horairesOuverture)
- Filtrage des images primaires et événements à venir
- Conversion snake_case → camelCase

### 71. POST /api/professional/send-verification-sms ✅
**Fichier** : `src/app/api/professional/send-verification-sms/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer le professionnel
- Utilisation de `requireEstablishment()` pour l'authentification
- Génération et stockage du code SMS (en mémoire, à migrer vers Redis en production)

### 72. POST /api/professional/verify-sms-code ✅
**Fichier** : `src/app/api/professional/verify-sms-code/route.ts`

**Changements** :
- Migration vers Supabase pour l'authentification
- Utilisation de `requireEstablishment()` pour l'authentification
- Vérification du code SMS stocké en mémoire

### 73. POST /api/establishments/enrich ✅
**Fichier** : `src/app/api/establishments/enrich/route.ts`

**Changements** :
- Migration vers Supabase pour enrichir un établissement
- Parsing des champs JSON existants avant mise à jour
- Conversion snake_case → camelCase
- Gestion de l'enrichissement conditionnel (ne pas écraser les choix manuels)

### 74-77. Routes Newsletter Admin ✅
**Fichiers** :
- `src/app/api/admin/newsletter/subscribers/route.ts` (GET)
- `src/app/api/admin/newsletter/stats/route.ts` (GET)
- `src/app/api/admin/newsletter/toggle/route.ts` (POST)
- `src/app/api/admin/newsletter/delete/route.ts` (DELETE)
- `src/app/api/admin/newsletter/export/route.ts` (GET)

**Changements** :
- Migration complète de la gestion newsletter admin vers Supabase
- Utilisation de `isAdmin()` pour l'autorisation
- Conversion snake_case → camelCase
- Export CSV des abonnés

### 78-79. Routes Newsletter Publique ✅
**Fichiers** :
- `src/app/api/newsletter/subscribe/route.ts` (POST)
- `src/app/api/newsletter/unsubscribe/route.ts` (POST, GET)

**Changements** :
- Migration vers Supabase pour l'inscription/désinscription newsletter
- Gestion de la réactivation d'inscription existante
- Création d'utilisateur avec newsletter activée
- Conversion snake_case → camelCase

### 80. POST /api/establishments/[id]/stats ✅
**Fichier** : `src/app/api/establishments/[id]/stats/route.ts`

**Changements** :
- Migration vers Supabase pour incrémenter les statistiques (vues/clics)
- Vérification que le propriétaire ne compte pas ses propres vues
- Conversion snake_case → camelCase

### 81. GET /api/establishments/[id]/menus ✅
**Fichier** : `src/app/api/establishments/[id]/menus/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les menus d'un établissement
- Vérification Premium subscription
- Conversion snake_case → camelCase

### 82. GET /api/public/establishments/[slug]/menus ✅
**Fichier** : `src/app/api/public/establishments/[slug]/menus/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les menus publics
- Vérification Premium subscription
- Conversion snake_case → camelCase

### 83. POST /api/analytics/track ✅
**Fichier** : `src/app/api/analytics/track/route.ts`

**Changements** :
- Migration vers Supabase pour enregistrer les événements de clic
- Insertion dans la table `click_analytics`
- Conversion snake_case → camelCase

### 84. GET /api/analytics/track ✅
**Fichier** : `src/app/api/analytics/track/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les statistiques analytics
- Groupement en mémoire des données (remplace Prisma groupBy)
- Calcul des statistiques par type et par heure
- Conversion snake_case → camelCase

### 85. GET /api/analytics/search ✅
**Fichier** : `src/app/api/analytics/search/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les statistiques de recherche
- Groupement en mémoire des recherches par terme
- Calcul des tendances temporelles
- Conversion snake_case → camelCase

### 86. POST /api/analytics/search/track ✅
**Fichier** : `src/app/api/analytics/search/track/route.ts`

**Changements** :
- Migration vers Supabase pour enregistrer les recherches
- Insertion dans la table `search_analytics`
- Conversion snake_case → camelCase

### 87. GET /api/analytics/detailed ✅
**Fichier** : `src/app/api/analytics/detailed/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les analytics détaillées
- Conversion des données Supabase en format utilisable
- Calcul des statistiques horaires, quotidiennes, éléments populaires
- Conversion snake_case → camelCase

### 88. GET /api/admin/learning/stats ✅
**Fichier** : `src/app/api/admin/learning/stats/route.ts`

**Changements** :
- Migration vers Supabase pour l'autorisation admin
- Utilisation de `isAdmin()` pour vérifier les permissions
- Service d'apprentissage conservé (non lié à la base de données)

### 89. GET /api/admin/learning/patterns ✅
**Fichier** : `src/app/api/admin/learning/patterns/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les patterns d'apprentissage
- Parsing des champs JSON (google_types, keywords)
- Conversion snake_case → camelCase

### 90. GET /api/etablissements/[slug]/images ✅
**Fichier** : `src/app/api/etablissements/[slug]/images/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les images d'un établissement
- Chargement des images via relation Supabase
- Tri par ordre conservé
- Conversion snake_case → camelCase

### 91. PUT /api/etablissements/[slug]/images ✅
**Fichier** : `src/app/api/etablissements/[slug]/images/route.ts`

**Changements** :
- Migration vers Supabase pour mettre à jour l'image principale
- Utilisation de `requireEstablishment()` pour l'authentification
- Conversion snake_case → camelCase

### 92-93. GET/POST /api/etablissements/[slug]/events ✅
**Fichier** : `src/app/api/etablissements/[slug]/events/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer et créer des événements
- Filtrage des événements à venir/en cours en mémoire
- Logique de détection d'événements récurrents conservée
- Conversion snake_case → camelCase

### 94. POST /api/establishments/[id]/menus/upload ✅
**Fichier** : `src/app/api/establishments/[id]/menus/upload/route.ts`

**Changements** :
- Migration vers Supabase Storage (bucket `menus`) pour l'upload de PDF
- Vérification Premium subscription
- Rollback automatique si insertion DB échoue
- Conversion snake_case → camelCase

### 95-96. DELETE/PUT /api/establishments/[id]/menus/[menuId] ✅
**Fichier** : `src/app/api/establishments/[id]/menus/[menuId]/route.ts`

**Changements** :
- Migration vers Supabase Storage pour la suppression de fichiers
- Migration vers Supabase pour la mise à jour de menus
- Extraction du chemin depuis l'URL Supabase Storage
- Conversion snake_case → camelCase

### 97. POST /api/comments/[id]/report ✅
**Fichier** : `src/app/api/comments/[id]/report/route.ts`

**Changements** :
- Migration vers Supabase pour signaler un commentaire
- Utilisation de `getCurrentUser()` pour l'authentification
- Conversion snake_case → camelCase

### 98. POST /api/comments/[id]/reply ✅
**Fichier** : `src/app/api/comments/[id]/reply/route.ts`

**Changements** :
- Migration vers Supabase pour répondre à un commentaire
- Utilisation de `requireEstablishment()` pour l'authentification
- Vérification de propriété de l'établissement
- Conversion snake_case → camelCase

### 99-100. POST/GET /api/events/[eventId]/engage ✅
**Fichier** : `src/app/api/events/[eventId]/engage/route.ts`

**Changements** :
- Migration vers Supabase pour créer/récupérer les engagements d'événements
- Gestion du karma et des badges de gamification
- Upsert manuel (vérification puis création/mise à jour)
- Calcul des statistiques d'engagement et badges d'événement
- Conversion snake_case → camelCase

### 101. GET /api/monitoring/health ✅
**Fichier** : `src/app/api/monitoring/health/route.ts`

**Changements** :
- Migration vers Supabase pour vérifier la santé de la base de données
- Test de connexion via Supabase client
- Gestion des erreurs "table not found" (normal si migrations non appliquées)

### 102. POST /api/etablissements/create-admin ✅
**Fichier** : `src/app/api/etablissements/create-admin/route.ts`

**Changements** :
- Migration vers Supabase pour créer un établissement par un admin
- Création/récupération du Professional pour l'admin
- Génération de slug unique
- Conversion snake_case → camelCase

### 103. POST /api/deals/recurrence/process ✅
**Fichier** : `src/app/api/deals/recurrence/process/route.ts`

**Changements** :
- Migration vers Supabase pour traiter la récurrence des deals
- Génération de deals récurrents (hebdomadaires/mensuels)
- Vérification d'existence avant création
- Conversion snake_case → camelCase

### 104. POST /api/admin/learning/validate ✅
**Fichier** : `src/app/api/admin/learning/validate/route.ts`

**Changements** :
- Migration vers Supabase pour valider un pattern d'apprentissage
- Utilisation de `isAdmin()` pour l'autorisation
- Mise à jour du pattern avec type validé
- Conversion snake_case → camelCase

### 105. DELETE /api/admin/learning/delete ✅
**Fichier** : `src/app/api/admin/learning/delete/route.ts`

**Changements** :
- Migration vers Supabase pour supprimer un pattern d'apprentissage
- Utilisation de `isAdmin()` pour l'autorisation

### 106. POST /api/admin/learning/correct ✅
**Fichier** : `src/app/api/admin/learning/correct/route.ts`

**Changements** :
- Migration vers Supabase pour l'autorisation admin
- Utilisation de `isAdmin()` pour vérifier les permissions
- Service d'apprentissage conservé (non lié à la base de données)

### 107. GET /api/admin/analytics/establishments ✅
**Fichier** : `src/app/api/admin/analytics/establishments/route.ts`

**Changements** :
- Migration vers Supabase pour récupérer les analytics des établissements
- Récupération séparée des établissements et analytics
- Calcul des statistiques en mémoire (top element, total clicks)
- Conversion snake_case → camelCase

### 108. GET /api/monitoring/liveness ✅
**Fichier** : `src/app/api/monitoring/liveness/route.ts`

**Changements** :
- Migration vers Supabase pour le health checker
- Suppression de la dépendance Prisma
- Utilisation de `createHealthChecker()` sans paramètre

### 109. GET /api/monitoring/readiness ✅
**Fichier** : `src/app/api/monitoring/readiness/route.ts`

**Changements** :
- Migration vers Supabase pour le health checker
- Suppression de la dépendance Prisma
- Utilisation de `createHealthChecker()` sans paramètre

### 110. POST /api/admin/cleanup-images ✅
**Fichier** : `src/app/api/admin/cleanup-images/route.ts`

**Changements** :
- Migration vers Supabase pour l'autorisation admin
- Utilisation de `isAdmin()` pour vérifier les permissions
- Fonctions de nettoyage conservées (peuvent nécessiter adaptation pour Supabase Storage)

### 111. GET /api/auth/verify-establishment ✅
**Fichier** : `src/app/api/auth/verify-establishment/route.ts`

**Changements** :
- Migration vers Supabase pour vérifier si un professionnel a un établissement
- Utilisation de `getCurrentUser()` et `getProfessionalEstablishment()`
- Conversion snake_case → camelCase

## 📊 Statistiques

- **Routes migrées** : 111
- **Helpers créés** : 7 (incluant signUpProfessional)
- **Fichiers modifiés** : 90+
- **Routes restantes** : ~10+ (principalement routes non-dépendantes de Prisma ou routes NextAuth)

## 🔄 Prochaines Étapes

1. Continuer la migration route par route
2. Tester chaque route migrée
3. Migrer les routes d'authentification
4. Adapter le middleware
5. Migrer les routes upload (nécessite Supabase Storage)

