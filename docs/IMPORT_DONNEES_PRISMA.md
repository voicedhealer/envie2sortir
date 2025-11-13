# 📥 Importer les Données de Prisma vers Supabase

## 🎯 Objectif

Ce guide vous permet d'importer vos données de démonstration depuis Prisma (`prisma/dev.db`) vers Supabase pour tester les routes migrées.

## ⚠️ Important

- **Votre base Prisma reste intacte** ✅
- Les données sont **copiées** (pas déplacées) vers Supabase
- Les données existantes dans Supabase ne sont **pas supprimées**
- Le script utilise `upsert` (insert ou update si existe déjà)

## 🚀 Utilisation

### Étape 1 : Vérifier la Configuration

Assurez-vous que vos variables Supabase sont configurées dans `.env` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qzmduszbsmxitsvciwzq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

**⚠️ Important** : Il faut la **SERVICE_ROLE_KEY** (pas l'anon key) pour pouvoir insérer des données.

### Étape 2 : Exécuter le Script

```bash
npm run export:prisma-to-supabase
```

Ou directement :

```bash
npx tsx scripts/export-prisma-to-supabase.ts
```

### Étape 3 : Vérifier les Données

Dans Supabase Dashboard > **Table Editor**, vérifier que les données sont présentes :
- `users` : Vos utilisateurs
- `professionals` : Vos professionnels
- `establishments` : Vos établissements
- `etablissement_tags` : Vos tags
- `images` : Vos images

## 📊 Ce qui est Exporté

Le script exporte les tables principales :

1. ✅ **users** - Tous les utilisateurs
2. ✅ **professionals** - Tous les professionnels
3. ✅ **establishments** - Tous les établissements
4. ✅ **etablissement_tags** - Tous les tags
5. ✅ **images** - Toutes les images

### Tables Non Exportées (pour l'instant)

Ces tables peuvent être ajoutées si nécessaire :
- `events`
- `daily_deals`
- `user_comments`
- `user_favorites`
- `user_likes`
- etc.

## 🔄 Conversion Automatique

Le script effectue automatiquement :

1. **Conversion des IDs** : CUID → UUID (génération d'UUIDs)
2. **Conversion camelCase → snake_case** : `firstName` → `first_name`
3. **Parsing JSON** : Les champs JSON sont correctement formatés
4. **Conversion des dates** : Format ISO pour Supabase

## ⚠️ Limitations

### IDs des Utilisateurs

Les IDs Prisma (CUID) sont convertis en UUID. Cela signifie que :
- Les utilisateurs dans Supabase auront des IDs différents de Prisma
- Les relations sont maintenues (owner_id, etc.)
- Les utilisateurs Supabase Auth ne sont **pas créés automatiquement**

### Authentification

Les utilisateurs exportés dans la table `users` ne sont **pas** créés dans Supabase Auth. Pour l'authentification :
- Créer les comptes via l'API `/api/auth/register`
- Ou utiliser Supabase Dashboard > Authentication

### Relations

Les relations sont maintenues grâce à la conversion des IDs :
- `establishments.owner_id` → pointe vers le bon `professionals.id`
- `images.establishment_id` → pointe vers le bon `establishments.id`
- etc.

## 🧪 Après l'Import

Une fois les données importées :

1. **Tester les routes** :
```bash
./scripts/test-routes-migrees.sh
```

2. **Vérifier dans Supabase Dashboard** :
   - Table Editor > Voir les données
   - Vérifier les relations

3. **Tester une route spécifique** :
```bash
# Utiliser un slug réel de votre base
curl http://localhost:3000/api/etablissements/battlekart-dijon
```

## 🔧 Dépannage

### Erreur : "SUPABASE_SERVICE_ROLE_KEY is not defined"

**Solution** : Ajouter la clé dans `.env` :
```bash
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

Pour trouver la clé :
1. Supabase Dashboard > Settings > API
2. Section "service_role" (⚠️ gardez-la secrète !)

### Erreur : "permission denied"

**Solution** : Vérifier que vous utilisez la **SERVICE_ROLE_KEY** (pas l'anon key)

### Erreur : "foreign key constraint"

**Solution** : Le script exporte dans l'ordre (users → professionals → establishments → tags/images)

Si erreur, réexécuter le script (il utilise `upsert`, donc c'est idempotent)

## 📝 Notes

- Le script est **idempotent** : vous pouvez le relancer plusieurs fois
- Les données existantes sont **mises à jour** si elles existent déjà
- Les nouvelles données sont **ajoutées**

## 🎯 Alternative : Projet Supabase Séparé

Si vous préférez un environnement complètement séparé :

1. Créer un nouveau projet Supabase (gratuit)
2. Appliquer les migrations dans ce nouveau projet
3. Exécuter le script d'export avec les nouvelles clés
4. Tester dans ce projet séparé

Cela permet d'avoir :
- **Projet principal** : Production
- **Projet test** : Démonstration avec données

