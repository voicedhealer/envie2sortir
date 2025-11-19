# 🔧 Dépannage des Scripts

## ❌ Erreur : "SUPABASE_SERVICE_ROLE_KEY manquante"

### Cause
La clé `SUPABASE_SERVICE_ROLE_KEY` n'est pas définie dans `.env.local` ou `.env`.

### Solution

1. **Aller dans Supabase Dashboard** :
   - https://supabase.com/dashboard
   - Sélectionner votre projet

2. **Récupérer la clé** :
   - Settings > API
   - Section **"service_role"**
   - ⚠️ **Cette clé est secrète, gardez-la privée !**

3. **Ajouter dans `.env.local`** :
```bash
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role-ici
```

### Pourquoi cette clé est nécessaire ?

- **Anon key** : Permet de lire/écrire selon les RLS policies
- **Service role key** : Permet de bypasser les RLS (nécessaire pour les scripts d'import/nettoyage)

## ❌ Erreur : "NEXT_PUBLIC_SUPABASE_URL manquante"

### Solution

Ajouter dans `.env.local` :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qzmduszbsmxitsvciwzq.supabase.co
```

## ❌ Erreur : "Table does not exist"

### Cause
Les migrations SQL ne sont pas appliquées dans Supabase.

### Solution

1. Supabase Dashboard > SQL Editor
2. Exécuter les migrations dans l'ordre :
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_storage_setup.sql`

## ❌ Erreur : "Permission denied" ou "RLS policy violation"

### Cause
Les RLS policies bloquent l'accès.

### Solution

Utiliser la **SERVICE_ROLE_KEY** (pas l'anon key) pour les scripts d'import/nettoyage.

## ✅ Vérifier la Configuration

```bash
# Tester la connexion
npm run test:supabase

# Si ça fonctionne, les clés sont bonnes
```

## 📋 Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` dans `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` (pour les scripts)
- [ ] Migrations SQL appliquées dans Supabase Dashboard
- [ ] Test de connexion réussi : `npm run test:supabase`

