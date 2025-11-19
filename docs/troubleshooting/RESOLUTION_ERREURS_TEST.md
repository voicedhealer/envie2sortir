# 🔧 Résolution des Erreurs de Test

## 📊 Analyse des Erreurs

### ✅ Ce qui Fonctionne
- ✅ Serveur Next.js actif
- ✅ Connexion Supabase OK
- ✅ Route `/api/categories` répond (mais 0 catégories - normal, base vide)

### ❌ Erreurs Détectées

1. **Route `/api/recherche/envie`** : `"Erreur lors du chargement des établissements"`
2. **Route `/api/etablissements/[slug]`** : `"Établissement non trouvé"`

## 🎯 Cause Principale

**La base Supabase est vide ET/OU les migrations SQL ne sont pas appliquées.**

C'est **normal** car :
- Vos données sont dans Prisma (`prisma/dev.db`) ✅
- Supabase est une **nouvelle base vide** ⚠️
- Les routes migrées cherchent dans Supabase (vide)
- Les routes non migrées cherchent dans Prisma (avec données)

## 🛠️ Solution : Appliquer les Migrations SQL

### Étape 1 : Aller dans Supabase Dashboard

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet : `qzmduszbsmxitsvciwzq`
3. Cliquer sur **SQL Editor** dans le menu de gauche

### Étape 2 : Appliquer les Migrations

Exécuter les 3 fichiers dans l'ordre :

#### Migration 1 : Schéma Initial
1. Ouvrir le fichier : `supabase/migrations/001_initial_schema.sql`
2. Copier tout le contenu
3. Coller dans SQL Editor
4. Cliquer sur **Run** (ou `Cmd+Enter`)
5. Vérifier qu'il n'y a pas d'erreur

#### Migration 2 : RLS Policies
1. Ouvrir le fichier : `supabase/migrations/002_rls_policies.sql`
2. Copier tout le contenu
3. Coller dans SQL Editor
4. Cliquer sur **Run**
5. Vérifier qu'il n'y a pas d'erreur

#### Migration 3 : Storage Setup
1. Ouvrir le fichier : `supabase/migrations/003_storage_setup.sql`
2. Copier tout le contenu
3. Coller dans SQL Editor
4. Cliquer sur **Run**
5. Vérifier qu'il n'y a pas d'erreur

### Étape 3 : Vérifier les Tables

Dans Supabase Dashboard > **Table Editor**, vérifier que ces tables existent :
- ✅ `establishments`
- ✅ `users`
- ✅ `professionals`
- ✅ `etablissement_tags`
- ✅ `images`
- ✅ `events`
- etc.

## 📝 Créer des Données de Test (Optionnel)

Une fois les migrations appliquées, vous pouvez créer des données de test.

### Option A : Utiliser le Fichier Seed

Le fichier `supabase/seed.sql` contient des exemples. **Attention** : Il faut d'abord créer les utilisateurs via l'API Auth.

### Option B : Créer un Établissement de Test Simple

Dans SQL Editor, exécuter :

```sql
-- 1. Créer un professionnel de test (sans auth pour l'instant)
INSERT INTO professionals (
  id, siret, first_name, last_name, email, phone, company_name, legal_status
)
VALUES (
  gen_random_uuid(),
  '12345678901234',
  'Test',
  'Professional',
  'test-pro@example.com',
  '0612345678',
  'Test Company',
  'SARL'
)
RETURNING id;

-- 2. Noter l'ID retourné, puis créer un établissement
-- (Remplacer 'VOTRE_ID_PRO' par l'ID retourné ci-dessus)
INSERT INTO establishments (
  id, name, slug, description, address, city, postal_code,
  latitude, longitude, status, subscription, owner_id
)
VALUES (
  gen_random_uuid(),
  'Restaurant Test',
  'restaurant-test',
  'Un restaurant de test pour valider la migration',
  '1 Rue de Test, 75001 Paris',
  'Paris',
  '75001',
  48.8566,
  2.3522,
  'approved',
  'FREE',
  'VOTRE_ID_PRO'  -- ⚠️ Remplacer par l'ID du professionnel créé
);
```

### Option C : Tester avec l'API d'Inscription

```bash
# Créer un compte utilisateur via l'API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "password": "test123456",
    "acceptTerms": true
  }'
```

## 🧪 Relancer les Tests

Une fois les migrations appliquées :

```bash
# Relancer les tests
./scripts/test-routes-migrees.sh

# Ou tests manuels
curl http://localhost:3000/api/categories
curl "http://localhost:3000/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5"
```

## 📋 Checklist

- [ ] Migrations SQL appliquées dans Supabase Dashboard
- [ ] Tables créées (vérifier dans Table Editor)
- [ ] RLS policies activées
- [ ] Données de test créées (optionnel)
- [ ] Tests relancés

## ⚠️ Important

**Même avec les migrations appliquées, la base Supabase sera vide.**

C'est normal car :
- Vos données sont dans Prisma
- Supabase est une nouvelle base
- Pour tester complètement, il faut créer des données de test dans Supabase

**Les routes non migrées continuent de fonctionner avec Prisma !**

## 🎯 Prochaines Étapes

1. **Appliquer les migrations SQL** (priorité absolue)
2. **Vérifier que les tables existent**
3. **Créer des données de test** si nécessaire
4. **Relancer les tests**

Une fois les migrations appliquées, les erreurs "table does not exist" disparaîtront. Les erreurs "not found" seront normales si la base est vide.

