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
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/[...nextauth]

### Routes CRUD
- [ ] POST /api/etablissements (création)
- [ ] GET /api/establishments/all
- [ ] GET /api/establishments/random

### Routes Upload
- [ ] POST /api/upload/image
- [ ] POST /api/upload/optimized-image
- [ ] POST /api/upload/deal-media
- [ ] POST /api/upload/event-image

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

## 📊 Statistiques

- **Routes migrées** : 5
- **Helpers créés** : 1
- **Fichiers modifiés** : 3
- **Routes restantes** : ~80+

## 🔄 Prochaines Étapes

1. Continuer la migration route par route
2. Tester chaque route migrée
3. Migrer les routes d'authentification
4. Adapter le middleware
5. Migrer les routes upload (nécessite Supabase Storage)

