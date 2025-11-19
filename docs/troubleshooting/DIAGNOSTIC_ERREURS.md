# Diagnostic des Erreurs de Test

## 📊 Résultats des Tests

### ✅ Ce qui Fonctionne
- Serveur Next.js actif
- Connexion Supabase OK
- Route `/api/categories` répond (mais 0 catégories)

### ❌ Erreurs Détectées

#### 1. Route `/api/recherche/envie`
**Erreur** : `{"error":"Erreur lors du chargement des établissements"}`

**Causes possibles** :
- Les migrations SQL ne sont pas appliquées dans Supabase
- La table `establishments` n'existe pas dans Supabase
- Les RLS policies bloquent l'accès

#### 2. Route `/api/etablissements/[slug]`
**Erreur** : `{"error":"Établissement non trouvé"}`

**Causes possibles** :
- La base Supabase est vide (pas de données)
- Les établissements existent dans Prisma mais pas dans Supabase
- Le slug n'existe pas dans Supabase

## 🔍 Diagnostic

### Étape 1 : Vérifier les Migrations SQL

Les migrations SQL doivent être appliquées dans Supabase Dashboard :

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **SQL Editor**
4. Exécuter dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_setup.sql`

### Étape 2 : Vérifier les Tables

Dans Supabase Dashboard > Table Editor, vérifier que ces tables existent :
- `establishments`
- `users`
- `professionals`
- `etablissement_tags`
- `images`
- etc.

### Étape 3 : Vérifier les Données

La base Supabase est probablement **vide**. C'est normal car :
- Les données sont dans Prisma (`prisma/dev.db`)
- Supabase est une nouvelle base vide
- Il faut soit :
  - Créer des données de test dans Supabase
  - Migrer les données de Prisma vers Supabase (optionnel)

## 🛠️ Solutions

### Solution 1 : Appliquer les Migrations SQL

**C'est la priorité !** Sans les migrations, les tables n'existent pas.

1. Ouvrir Supabase Dashboard
2. SQL Editor
3. Copier-coller et exécuter chaque fichier de migration

### Solution 2 : Créer des Données de Test

Une fois les migrations appliquées, créer des données de test :

```sql
-- Exemple : Créer un établissement de test
INSERT INTO establishments (
  id, name, slug, address, city, status, owner_id, created_at
) VALUES (
  gen_random_uuid(),
  'Test Restaurant',
  'test-restaurant',
  '1 Rue de Test, 75001 Paris',
  'Paris',
  'approved',
  (SELECT id FROM professionals LIMIT 1),
  NOW()
);
```

### Solution 3 : Vérifier les Logs du Serveur

Dans le terminal où tourne `npm run dev`, regarder les erreurs détaillées.

## 📋 Checklist de Diagnostic

- [ ] Migrations SQL appliquées dans Supabase Dashboard
- [ ] Tables créées (vérifier dans Table Editor)
- [ ] RLS policies activées
- [ ] Données de test créées (optionnel)
- [ ] Logs du serveur vérifiés

## 🎯 Prochaines Étapes

1. **Appliquer les migrations SQL** (priorité absolue)
2. **Vérifier que les tables existent**
3. **Créer des données de test** si nécessaire
4. **Relancer les tests**

## 💡 Note Importante

**C'est normal que Supabase soit vide !** 

- Votre base Prisma locale contient vos données
- Supabase est une nouvelle base vide
- Les routes migrées cherchent dans Supabase (vide)
- Les routes non migrées cherchent dans Prisma (avec données)

Pour tester les routes migrées, il faut soit :
- Créer des données de test dans Supabase
- Ou migrer les données de Prisma vers Supabase (plus complexe)

