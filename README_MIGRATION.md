# Migration vers Supabase - Branche `migration-supabase`

## 📋 Vue d'Ensemble

Cette branche contient toute la préparation pour migrer envie2sortir de Prisma/SQLite vers Supabase.

## ✅ Ce qui est Fait

### 1. Audit Complet ✅
- Inventaire de tous les modèles de données (19+ tables)
- Analyse des dépendances backend
- Documentation de l'architecture actuelle

### 2. Schéma Supabase ✅
- **001_initial_schema.sql** : Toutes les tables PostgreSQL
- **002_rls_policies.sql** : Toutes les policies RLS
- **003_storage_setup.sql** : Configuration Storage (5 buckets)

### 3. Configuration ✅
- Clients Supabase (client, server, middleware)
- Helpers utilitaires
- Configuration Supabase locale

### 4. Documentation ✅
- Guide de migration complet
- Documentation Auth
- Documentation Storage
- Exemples de migration

## 📁 Structure des Fichiers

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql    # Schéma complet
│   ├── 002_rls_policies.sql      # Policies RLS
│   └── 003_storage_setup.sql     # Configuration Storage
├── seed.sql                       # Données de test
└── config.toml                    # Configuration Supabase

src/lib/supabase/
├── client.ts                      # Client côté client
├── server.ts                      # Client côté serveur
├── middleware.ts                  # Middleware sessions
└── helpers.ts                     # Helpers utilitaires

docs/
├── MIGRATION_SUPABASE_AUDIT.md   # Audit complet
├── MIGRATION_SUPABASE_PLAN.md    # Plan de migration
├── MIGRATION_SUPABASE_GUIDE.md   # Guide complet
├── MIGRATION_SUPABASE_RESUME.md  # Résumé
├── SUPABASE_AUTH_MIGRATION.md    # Migration Auth
├── SUPABASE_STORAGE_SETUP.md     # Configuration Storage
└── EXEMPLE_MIGRATION_API.md      # Exemples de code
```

## 🚀 Démarrage Rapide

### 1. Créer un Projet Supabase

1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Noter l'URL et les clés API

### 2. Configurer les Variables d'Environnement

**Où trouver les clés API Supabase ?**

1. Créer un projet sur https://supabase.com
2. Aller dans Settings > API
3. Copier l'URL du projet et les clés API

**Ajouter dans `.env.local` :**

```bash
# Créer .env.local si pas déjà fait
cp .env.example .env.local

# Ajouter les clés Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Prisma reste configuré (pour vos devs/demos)
DATABASE_URL=file:./prisma/dev.db
```

Voir `docs/SUPABASE_CONFIGURATION_KEYS.md` pour le guide complet.

### 3. Appliquer les Migrations

**Option A : Via Dashboard Supabase**
1. Aller dans SQL Editor
2. Exécuter les fichiers dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_setup.sql`

**Option B : Via Supabase CLI**
```bash
npm install -g supabase
supabase init
supabase link --project-ref your-project-ref
supabase db push
```

### 4. Configurer OAuth (Optionnel)

1. Dans Supabase Dashboard > Authentication > Providers
2. Activer Google et/ou Facebook
3. Ajouter les Client ID et Secret

### 5. Tester

```typescript
// Test Auth
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'Test1234!'
});

// Test Storage
const { data, error } = await supabase.storage
  .from('establishments')
  .upload('test/image.jpg', file);
```

## 📚 Documentation

Toute la documentation est dans le dossier `docs/` :

- **MIGRATION_SUPABASE_GUIDE.md** : Guide complet étape par étape
- **MIGRATION_SUPABASE_RESUME.md** : Résumé de l'état d'avancement
- **SUPABASE_AUTH_MIGRATION.md** : Détails sur la migration Auth
- **SUPABASE_STORAGE_SETUP.md** : Configuration Storage
- **EXEMPLE_MIGRATION_API.md** : Exemples de code migré

## ⚠️ Important

### Prisma Reste Intact ✅

**Votre base de données Prisma locale (`prisma/dev.db`) n'a PAS été modifiée !**

- ✅ Toutes vos données de dev/demo sont préservées
- ✅ Prisma continue de fonctionner normalement
- ✅ Vous pouvez utiliser les deux systèmes en parallèle
- ✅ Migration progressive possible, route par route

Voir `docs/COEXISTENCE_PRISMA_SUPABASE.md` pour plus de détails.

### Aucune Donnée Migrée

Comme demandé, **aucune donnée existante n'est migrée**. Les tables Supabase sont créées vides.

Pour les tests, utiliser le fichier `supabase/seed.sql` qui contient des exemples de structure.

### Migration Progressive

La migration du code (API routes, composants) n'est **pas encore faite**. 

Cette branche contient uniquement :
- ✅ Le schéma Supabase
- ✅ Les policies RLS
- ✅ La configuration Storage
- ✅ La documentation
- ✅ Les helpers et clients Supabase

### Prochaines Étapes

1. Migrer les API routes une par une
2. Adapter les composants React
3. Tester chaque fonctionnalité
4. Créer les tests

## 🔐 Sécurité

### RLS Policies

Toutes les tables ont RLS activé avec des policies complètes :
- Users : Lecture publique, modification propre compte
- Professionals : Lecture publique, modification propre compte
- Establishments : Lecture publique (approuvés), modification propriétaire/admin
- Etc.

### Storage Policies

Tous les buckets ont des policies :
- Lecture publique
- Écriture contrôlée (propriétaires uniquement)
- Suppression contrôlée (propriétaires ou admins)

## 🧪 Tests

### Créer des Données de Test

1. Créer des comptes auth via l'API Supabase
2. Utiliser les IDs retournés dans `supabase/seed.sql`
3. Exécuter le script seed

### Scénarios à Tester

- [ ] Inscription utilisateur
- [ ] Inscription professionnel
- [ ] Connexion
- [ ] Création établissement
- [ ] Upload image
- [ ] Recherche
- [ ] Commentaires
- [ ] etc.

## 📝 Checklist Avant Merge

- [ ] Toutes les migrations appliquées
- [ ] RLS policies testées
- [ ] Storage fonctionnel
- [ ] Auth fonctionnel
- [ ] Documentation complète
- [ ] Code review effectué

## 🔗 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

## ❓ Questions ?

Si vous avez des questions sur la migration, consulter :
1. `docs/MIGRATION_SUPABASE_GUIDE.md` pour le guide complet
2. `docs/EXEMPLE_MIGRATION_API.md` pour des exemples de code
3. La documentation Supabase officielle

