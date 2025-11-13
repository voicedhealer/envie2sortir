# Guide Complet de Migration vers Supabase

## 📋 Vue d'Ensemble

Ce guide détaille toutes les étapes pour migrer envie2sortir de Prisma/SQLite vers Supabase.

## 🚀 Étapes de Migration

### Phase 1 : Préparation

1. **Créer un projet Supabase**
   - Aller sur https://supabase.com
   - Créer un nouveau projet
   - Noter l'URL et les clés API

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   # Remplir les valeurs Supabase
   ```

3. **Installer les dépendances**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

### Phase 2 : Migration du Schéma

1. **Appliquer les migrations SQL**
   ```bash
   # Via Supabase CLI (recommandé)
   supabase db push
   
   # Ou via le Dashboard Supabase
   # Aller dans SQL Editor et exécuter les fichiers dans l'ordre :
   # - 001_initial_schema.sql
   # - 002_rls_policies.sql
   # - 003_storage_setup.sql
   ```

2. **Vérifier les tables créées**
   - Aller dans Table Editor du Dashboard
   - Vérifier que toutes les tables sont présentes

### Phase 3 : Configuration Auth

1. **Configurer OAuth dans Supabase Dashboard**
   - Authentication > Providers
   - Activer Google et Facebook
   - Ajouter les Client ID et Secret

2. **Tester l'authentification**
   - Créer un compte test
   - Vérifier que les sessions fonctionnent

### Phase 4 : Configuration Storage

1. **Créer les buckets** (déjà fait via migration SQL)
   - Vérifier dans Storage du Dashboard

2. **Tester l'upload**
   - Uploader une image test
   - Vérifier l'URL publique

### Phase 5 : Migration du Code

1. **Remplacer Prisma par Supabase**
   - Créer les helpers Supabase
   - Migrer les API routes une par une
   - Tester chaque endpoint

2. **Adapter le middleware**
   - Remplacer NextAuth par Supabase middleware

3. **Adapter les composants**
   - Remplacer les appels Prisma par Supabase

### Phase 6 : Tests

1. **Tests unitaires**
   ```bash
   npm run test
   ```

2. **Tests E2E**
   ```bash
   npm run test:e2e
   ```

3. **Tests manuels**
   - Inscription utilisateur
   - Inscription professionnel
   - Recherche
   - Création établissement
   - Upload image
   - etc.

## 🔧 Commandes Utiles

### Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser (déjà fait)
supabase init

# Démarrer localement
supabase start

# Appliquer les migrations
supabase db push

# Générer les types TypeScript
supabase gen types typescript --local > src/types/supabase.ts
```

### Migration des Données (si nécessaire)

```bash
# Exporter depuis SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Importer dans Supabase (via Dashboard SQL Editor)
# Note: Nécessite des adaptations pour PostgreSQL
```

## 📝 Checklist de Migration

### Schéma
- [ ] Toutes les tables créées
- [ ] Tous les indexes créés
- [ ] Toutes les relations définies
- [ ] Tous les triggers créés

### RLS
- [ ] Toutes les policies RLS en place
- [ ] Tests de sécurité effectués
- [ ] Vérification des permissions

### Auth
- [ ] Supabase Auth configuré
- [ ] OAuth Google configuré
- [ ] OAuth Facebook configuré
- [ ] Middleware adapté
- [ ] Sessions fonctionnelles

### Storage
- [ ] Tous les buckets créés
- [ ] Toutes les policies Storage en place
- [ ] Upload fonctionnel
- [ ] URLs publiques accessibles

### Code
- [ ] Client Supabase configuré
- [ ] Server Supabase configuré
- [ ] Toutes les API routes migrées
- [ ] Tous les composants adaptés
- [ ] Types TypeScript générés

### Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Tests de sécurité passent

## 🐛 Dépannage

### Erreurs Courantes

1. **"Missing Supabase environment variables"**
   - Vérifier que `.env.local` contient les bonnes valeurs
   - Redémarrer le serveur de développement

2. **"RLS policy violation"**
   - Vérifier que l'utilisateur est authentifié
   - Vérifier les policies RLS dans le Dashboard

3. **"Storage bucket not found"**
   - Vérifier que les buckets sont créés
   - Vérifier les policies Storage

4. **"Auth session expired"**
   - Vérifier la configuration du refresh token
   - Vérifier les cookies

## 📚 Documentation

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 Rollback

Si nécessaire, pour revenir à Prisma :

1. **Restaurer le code**
   ```bash
   git checkout dev
   ```

2. **Restaurer la base de données**
   ```bash
   # Si backup disponible
   sqlite3 prisma/dev.db < backup.sql
   ```

3. **Rétablir les variables d'environnement**
   - Utiliser les anciennes valeurs

## ✅ Validation Finale

Avant de merger dans `dev` :

1. [ ] Tous les tests passent
2. [ ] Documentation complète
3. [ ] Code review effectué
4. [ ] Tests manuels complets
5. [ ] Performance vérifiée
6. [ ] Sécurité vérifiée

