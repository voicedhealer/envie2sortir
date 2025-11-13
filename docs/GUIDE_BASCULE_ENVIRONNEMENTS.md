# Guide : Basculer entre Prisma (Local) et Supabase

## 🎯 Objectif

Ce guide vous permet de basculer facilement entre :
- **Prisma (Local)** : Votre base SQLite locale (`prisma/dev.db`) - **TOUJOURS INTACTE** ✅
- **Supabase** : La nouvelle base PostgreSQL dans le cloud

## 📁 Fichiers d'Environnement

### Fichiers existants
- `.env` : Configuration actuelle (Prisma local)
- `.env.example` : Exemple de configuration
- `.env.dev` : Configuration Supabase (nouveau)

### Fichier utilisé par Next.js
- `.env.local` : **C'est celui-ci qui est lu par Next.js !**

## 🔄 Comment Basculer

### Option 1 : Utiliser Prisma (Local) - Par Défaut

```bash
# Votre .env actuel fonctionne déjà
# Next.js lit automatiquement .env.local s'il existe
# Sinon, il lit .env

# Pour être sûr d'utiliser Prisma, vérifiez que .env.local n'existe pas
# ou qu'il ne contient pas les variables Supabase
```

### Option 2 : Utiliser Supabase (Migration)

```bash
# 1. Copier .env.dev vers .env.local
cp .env.dev .env.local

# 2. Éditer .env.local et remplir vos vraies clés Supabase
nano .env.local
# ou
code .env.local

# 3. Redémarrer le serveur Next.js
npm run dev
```

### Option 3 : Garder les Deux (Recommandé)

```bash
# 1. Créer .env.local avec les variables Supabase
cp .env.dev .env.local

# 2. Ajouter aussi les variables Prisma dans .env.local
# (pour les routes non migrées)
echo "DATABASE_URL=file:./prisma/dev.db" >> .env.local

# 3. Les deux systèmes coexistent !
# - Routes migrées → Supabase
# - Routes non migrées → Prisma
```

## 🔍 Vérifier Quel Environnement est Actif

### Méthode 1 : Vérifier les Variables

```bash
# Voir quelles variables sont chargées
npm run test:supabase
```

### Méthode 2 : Tester une Route Migrée

```bash
# Si cette route fonctionne, Supabase est actif
curl http://localhost:3000/api/categories
```

### Méthode 3 : Vérifier les Logs

Dans les logs du serveur (`npm run dev`), vous verrez :
- **Prisma** : `prisma.establishment.findMany()`
- **Supabase** : `supabase.from('establishments').select()`

## 📊 Routes Migrées vs Non Migrées

### Routes Migrées (Utilisent Supabase) ✅
- `GET /api/etablissements/[slug]`
- `PUT /api/etablissements/[slug]`
- `DELETE /api/etablissements/[slug]`
- `GET /api/categories`
- `GET /api/recherche/envie`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Routes Non Migrées (Utilisent Prisma) ⏳
- Toutes les autres routes (80+)
- Elles continuent d'utiliser `prisma/dev.db`

## 🛡️ Protection de Votre Base Prisma

### ✅ Votre Base Prisma est PROTÉGÉE

1. **Backup automatique créé** : `backups/dev.db.backup.20251113_120433`
2. **Aucune modification** : Le fichier `prisma/dev.db` n'est jamais modifié par Supabase
3. **Coexistence** : Les deux systèmes fonctionnent en parallèle

### Créer un Backup Manuel

```bash
# Backup avec timestamp
cp prisma/dev.db backups/dev.db.backup.$(date +%Y%m%d_%H%M%S)

# Voir tous les backups
ls -lh backups/
```

### Restaurer un Backup

```bash
# Restaurer le dernier backup
cp backups/dev.db.backup.20251113_120433 prisma/dev.db
```

## 🧪 Tester les Deux Environnements

### Test 1 : Prisma (Local)

```bash
# 1. S'assurer que .env.local n'existe pas ou ne contient pas Supabase
rm .env.local  # ou renommez-le

# 2. Démarrer le serveur
npm run dev

# 3. Tester une route non migrée
curl http://localhost:3000/api/establishments/all
```

### Test 2 : Supabase

```bash
# 1. Créer .env.local avec Supabase
cp .env.dev .env.local
# Puis éditer avec vos vraies clés

# 2. Démarrer le serveur
npm run dev

# 3. Tester une route migrée
curl http://localhost:3000/api/categories
```

## ⚠️ Points Importants

1. **`.env.local` est prioritaire** : Next.js lit d'abord `.env.local`, puis `.env`
2. **Les deux peuvent coexister** : Routes migrées → Supabase, autres → Prisma
3. **Votre base Prisma est sûre** : Aucun risque de suppression ou modification
4. **Backup automatique** : Un backup a été créé dans `backups/`

## 🔧 Dépannage

### Erreur : "Cannot find module '@supabase/supabase-js'"

```bash
# Installer les dépendances Supabase
npm install @supabase/supabase-js
```

### Erreur : "NEXT_PUBLIC_SUPABASE_URL is not defined"

```bash
# Vérifier que .env.local existe et contient les variables
cat .env.local | grep SUPABASE
```

### Erreur : "Table does not exist" (Supabase)

Les migrations SQL ne sont pas appliquées. Voir `docs/SUPABASE_CONFIGURATION_KEYS.md`

### Revenir à Prisma uniquement

```bash
# Supprimer ou renommer .env.local
mv .env.local .env.local.supabase
# Redémarrer le serveur
npm run dev
```

## 📝 Checklist

- [x] Backup de `prisma/dev.db` créé
- [ ] `.env.dev` créé avec vos clés Supabase
- [ ] `.env.local` configuré (optionnel)
- [ ] Test de connexion Supabase réussi (`npm run test:supabase`)
- [ ] Migrations SQL appliquées dans Supabase Dashboard
- [ ] Routes migrées testées

## 🎯 Recommandation

**Pour l'instant, gardez les deux systèmes actifs** :
- Routes migrées → Supabase
- Routes non migrées → Prisma
- Votre base Prisma locale reste intacte et fonctionnelle

Quand toutes les routes seront migrées, vous pourrez basculer complètement vers Supabase.

