# 🌿 Créer une Branche "Demo" dans Supabase

## ✅ Supabase Supporte les Branches !

Vous avez raison ! Supabase permet de créer des **branches** (comme Git) pour isoler vos environnements :
- **main** : Production
- **demo** : Démonstration avec données de test
- **dev** : Développement

## 🚀 Créer la Branche "Demo"

### Étape 1 : Dans Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Dans le header, cliquer sur le menu déroulant à côté de "Production" (ou "main")
4. Cliquer sur **"+ Create branch"**
5. Nommer la branche : `demo`
6. Cliquer sur **Create**

### Étape 2 : Appliquer les Migrations dans la Branche Demo

Une fois la branche créée :

1. **Basculer vers la branche "demo"** (menu déroulant)
2. Aller dans **SQL Editor**
3. Exécuter les 3 migrations dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_setup.sql`

### Étape 3 : Obtenir les Nouvelles Clés

Chaque branche a ses propres clés API :

1. Aller dans **Settings > API**
2. Noter les nouvelles clés pour la branche "demo" :
   - `NEXT_PUBLIC_SUPABASE_URL` (URL de la branche demo)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key de la branche demo)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service role key de la branche demo)

### Étape 4 : Configurer .env pour la Branche Demo

Créer un fichier `.env.demo` ou modifier `.env.local` :

```bash
# Branche Demo Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-branche-demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=clé-anon-de-la-branche-demo
SUPABASE_SERVICE_ROLE_KEY=clé-service-role-de-la-branche-demo

# Garder Prisma pour les routes non migrées
DATABASE_URL=file:./prisma/dev.db
```

## 📥 Importer les Données dans la Branche Demo

### Option A : Utiliser le Script d'Export (Recommandé)

```bash
# 1. Configurer .env.local avec les clés de la branche demo
# 2. Exécuter le script
npm run export:prisma-to-supabase
```

### Option B : Utiliser Prisma Directement

Comme suggéré par Perplexity, vous pouvez aussi utiliser Prisma pour migrer directement :

1. **Créer un script de migration Prisma** :
```typescript
// scripts/migrate-to-supabase-demo.ts
import { PrismaClient } from '@prisma/client';

const localDb = new PrismaClient({
  datasources: {
    db: { url: 'file:./prisma/dev.db' } // SQLite local
  }
});

const supabaseDemo = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_DEMO } // PostgreSQL Supabase demo
  }
});

async function migrate() {
  // Migrer les données...
}
```

2. **Configurer le schéma Prisma pour PostgreSQL** :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🎯 Avantages des Branches Supabase

1. **Isolation** : Chaque branche est indépendante
2. **Sécurité** : Pas de risque pour la production
3. **Tests** : Parfait pour tester avec des données réelles
4. **Rollback** : Facile de revenir en arrière

## 📋 Checklist

- [ ] Branche "demo" créée dans Supabase Dashboard
- [ ] Migrations SQL appliquées dans la branche demo
- [ ] Clés API de la branche demo récupérées
- [ ] `.env.local` configuré avec les clés demo
- [ ] Données exportées depuis Prisma vers la branche demo
- [ ] Tests effectués sur la branche demo

## 🔄 Basculer Entre les Branches

Dans Supabase Dashboard, utilisez le menu déroulant pour basculer entre :
- **main** : Production
- **demo** : Démonstration
- Autres branches créées

Chaque branche a :
- Sa propre base de données
- Ses propres clés API
- Ses propres données

## 💡 Recommandation

1. **Créer la branche "demo"** dans Supabase
2. **Appliquer les migrations** dans cette branche
3. **Exporter les données Prisma** vers cette branche
4. **Tester les routes migrées** avec les vraies données
5. **Garder "main" vide** pour la production future

## 🛠️ Script d'Export Adapté

Le script `export-prisma-to-supabase.ts` fonctionne avec n'importe quelle branche :
- Il utilise les variables d'environnement
- Changez simplement les clés dans `.env.local`
- Relancez le script

