# 🌿 Guide Complet : Branches Supabase

## 🎯 Concept

Supabase supporte les **branches** (comme Git) pour créer des environnements isolés :
- Chaque branche = une base de données PostgreSQL séparée
- Chaque branche = ses propres clés API
- Chaque branche = ses propres données

## 📊 Architecture Recommandée

```
Supabase Project
├── main (Production)
│   ├── Base de données vide (pour l'instant)
│   └── Clés API production
│
└── demo (Démonstration)
    ├── Base de données avec données de test
    ├── Migrations appliquées
    └── Clés API demo
```

## 🚀 Créer la Branche "Demo"

### Dans Supabase Dashboard

1. **Ouvrir le menu de branche** :
   - Cliquer sur le menu déroulant à côté de "Production" (ou "main")
   - Vous verrez : "main" (actuel) avec un checkmark

2. **Créer une nouvelle branche** :
   - Cliquer sur **"+ Create branch"**
   - Nom : `demo`
   - Description (optionnel) : "Branche pour démonstration avec données de test"
   - Cliquer sur **Create**

3. **Basculer vers la branche demo** :
   - Le menu déroulant permet de basculer entre les branches
   - Sélectionner "demo"

## 🔑 Récupérer les Clés de la Branche Demo

Chaque branche a ses propres clés API :

1. **Basculer vers la branche "demo"** (menu déroulant)
2. Aller dans **Settings > API**
3. Noter les clés :
   - **Project URL** : `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** : `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (secrète)

## 📝 Configuration pour la Branche Demo

### Option 1 : Fichier .env.local

```bash
# Branche Demo Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-branche-demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=clé-anon-de-la-branche-demo
SUPABASE_SERVICE_ROLE_KEY=clé-service-role-de-la-branche-demo

# Prisma (toujours local)
DATABASE_URL=file:./prisma/dev.db
```

### Option 2 : Fichier .env.demo

Créer un fichier séparé pour la branche demo :

```bash
# .env.demo
NEXT_PUBLIC_SUPABASE_URL=https://votre-branche-demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=clé-anon-de-la-branche-demo
SUPABASE_SERVICE_ROLE_KEY=clé-service-role-de-la-branche-demo
```

Puis utiliser :
```bash
# Charger les variables demo
export $(cat .env.demo | xargs)
npm run export:prisma-to-supabase
```

## 📥 Importer les Données dans la Branche Demo

### Méthode 1 : Script d'Export (Recommandé)

```bash
# 1. Configurer .env.local avec les clés de la branche demo
# 2. Exécuter
npm run export:prisma-to-supabase
```

### Méthode 2 : Via Prisma (Comme Perplexity)

Créer un script qui utilise Prisma pour migrer directement :

```typescript
// scripts/migrate-prisma-to-supabase-demo.ts
import { PrismaClient } from '@prisma/client';

const localDb = new PrismaClient({
  datasources: {
    db: { url: 'file:./prisma/dev.db' }
  }
});

// Pour Supabase, il faut d'abord adapter le schéma Prisma
// Voir la section "Adapter le Schéma Prisma" ci-dessous
```

## 🔧 Adapter le Schéma Prisma pour PostgreSQL

Si vous voulez utiliser Prisma directement avec Supabase (comme suggéré par Perplexity) :

### Étape 1 : Créer un Schéma Prisma pour PostgreSQL

Créer `prisma/schema.postgresql.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL_SUPABASE")
}

// Copier tout le reste du schéma depuis schema.prisma
```

### Étape 2 : Script de Migration

```typescript
// scripts/migrate-to-supabase-demo.ts
import { PrismaClient as PrismaSQLite } from '@prisma/client';
import { PrismaClient as PrismaPostgres } from '@prisma/client';

const sqliteDb = new PrismaSQLite({
  datasources: {
    db: { url: 'file:./prisma/dev.db' }
  }
});

const postgresDb = new PrismaPostgres({
  datasources: {
    db: { url: process.env.DATABASE_URL_SUPABASE_DEMO }
  }
});

async function migrate() {
  // Migrer users
  const users = await sqliteDb.user.findMany();
  for (const user of users) {
    await postgresDb.user.create({ data: user });
  }
  
  // Migrer professionals
  const professionals = await sqliteDb.professional.findMany();
  for (const pro of professionals) {
    await postgresDb.professional.create({ data: pro });
  }
  
  // Migrer establishments
  const establishments = await sqliteDb.establishment.findMany();
  for (const est of establishments) {
    await postgresDb.establishment.create({ data: est });
  }
  
  // etc.
}
```

## 🎯 Workflow Recommandé

### Pour Tester avec les Données de Démo

1. **Créer la branche "demo"** dans Supabase Dashboard
2. **Appliquer les migrations** dans cette branche
3. **Configurer .env.local** avec les clés de la branche demo
4. **Exporter les données** : `npm run export:prisma-to-supabase`
5. **Tester les routes** : `./scripts/test-routes-migrees.sh`

### Pour la Production

1. **Rester sur la branche "main"**
2. **Garder "main" vide** (ou avec des données de production)
3. **Utiliser les clés de "main"** pour la production

## 📋 Avantages des Branches

✅ **Isolation complète** : Chaque branche est indépendante  
✅ **Sécurité** : Pas de risque pour la production  
✅ **Tests** : Parfait pour tester avec des données réelles  
✅ **Rollback facile** : Basculer entre les branches  
✅ **Multi-environnements** : dev, demo, staging, prod

## 🔄 Basculer Entre les Branches

Dans Supabase Dashboard :
- Menu déroulant en haut à droite
- Sélectionner la branche souhaitée
- Les clés API changent automatiquement

Dans votre code :
- Changer les variables d'environnement
- Redémarrer le serveur Next.js

## 💡 Recommandation Finale

**Utilisez la branche "demo" pour :**
- Tester les routes migrées
- Démonstrations
- Développement avec données réelles

**Gardez la branche "main" pour :**
- Production future
- Données de production (quand prêtes)

