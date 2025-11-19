# Plan de Migration vers Supabase

## 🎯 Objectifs

1. Migrer toute l'architecture backend vers Supabase
2. Conserver toutes les fonctionnalités existantes
3. Améliorer la sécurité avec RLS (Row Level Security)
4. Centraliser le stockage avec Supabase Storage
5. Simplifier l'authentification avec Supabase Auth

## 📋 Étapes de Migration

### Phase 1 : Préparation du Schéma Supabase ✅
- [x] Créer la documentation d'audit
- [ ] Créer le schéma SQL pour Supabase PostgreSQL
- [ ] Définir les relations et contraintes
- [ ] Créer les indexes nécessaires
- [ ] Préparer les migrations SQL

### Phase 2 : Configuration Supabase
- [ ] Installer @supabase/supabase-js
- [ ] Configurer les variables d'environnement
- [ ] Créer le client Supabase
- [ ] Configurer Supabase Auth
- [ ] Configurer Supabase Storage

### Phase 3 : Migration Authentification
- [ ] Migrer vers Supabase Auth (email/password)
- [ ] Configurer OAuth (Google, Facebook)
- [ ] Adapter les rôles utilisateurs
- [ ] Migrer les sessions NextAuth → Supabase
- [ ] Adapter le middleware

### Phase 4 : Migration Stockage
- [ ] Créer les buckets Supabase Storage
- [ ] Migrer la logique d'upload
- [ ] Adapter les URLs d'images
- [ ] Configurer les policies Storage

### Phase 5 : Migration Base de Données
- [ ] Créer les tables via migrations SQL
- [ ] Configurer les RLS policies
- [ ] Créer les fonctions PostgreSQL si nécessaire
- [ ] Créer les triggers si nécessaire

### Phase 6 : Migration API Routes
- [ ] Remplacer Prisma par Supabase Client
- [ ] Adapter toutes les routes API
- [ ] Tester chaque endpoint
- [ ] Optimiser les requêtes

### Phase 7 : Tests & Validation
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E (inscription, recherche, etc.)
- [ ] Tests de sécurité (RLS)
- [ ] Tests de performance

### Phase 8 : Documentation & Admin
- [ ] Documenter l'architecture
- [ ] Créer le dashboard admin
- [ ] Documenter les processus
- [ ] Guide de maintenance

## 🔄 Mapping Prisma → Supabase

### Types de Données
- `String @id @default(cuid())` → `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `String` → `text`
- `Int` → `integer`
- `Float` → `numeric` ou `double precision`
- `Boolean` → `boolean`
- `DateTime` → `timestamp with time zone`
- `Json` → `jsonb`
- `@unique` → `UNIQUE CONSTRAINT`
- `@default(now())` → `DEFAULT now()`
- `@updatedAt` → `DEFAULT now()` + trigger

### Relations
- `@relation` → `FOREIGN KEY`
- `onDelete: Cascade` → `ON DELETE CASCADE`
- `onDelete: SetNull` → `ON DELETE SET NULL`

### Indexes
- `@@index([field])` → `CREATE INDEX`
- `@@unique([field1, field2])` → `UNIQUE (field1, field2)`

## 🔐 Stratégie RLS (Row Level Security)

### Policies à Implémenter

1. **Users**
   - SELECT : Tous peuvent voir les profils publics
   - UPDATE : Uniquement son propre profil
   - DELETE : Uniquement son propre compte (ou admin)

2. **Professionals**
   - SELECT : Tous peuvent voir les infos publiques
   - INSERT : N'importe qui peut s'inscrire
   - UPDATE : Uniquement son propre profil
   - DELETE : Uniquement son propre compte (ou admin)

3. **Establishments**
   - SELECT : Tous peuvent voir les établissements approuvés
   - INSERT : Uniquement les professionnels
   - UPDATE : Uniquement le propriétaire ou admin
   - DELETE : Uniquement le propriétaire ou admin

4. **Comments**
   - SELECT : Tous peuvent voir les commentaires
   - INSERT : Uniquement utilisateurs authentifiés
   - UPDATE : Uniquement l'auteur ou admin
   - DELETE : Uniquement l'auteur ou admin

5. **Favorites/Likes**
   - SELECT : Uniquement ses propres favoris
   - INSERT : Uniquement utilisateurs authentifiés
   - DELETE : Uniquement ses propres favoris

6. **Events**
   - SELECT : Tous peuvent voir les événements
   - INSERT : Uniquement propriétaires d'établissements
   - UPDATE : Uniquement propriétaire ou admin
   - DELETE : Uniquement propriétaire ou admin

7. **Admin Actions**
   - SELECT : Uniquement admins
   - INSERT : Uniquement admins
   - UPDATE : Uniquement admins
   - DELETE : Uniquement admins

## 📦 Structure Supabase Storage

### Buckets à Créer

1. **establishments** : Images d'établissements
   - Public : Oui
   - Policies : Read public, Write owner/admin

2. **events** : Images d'événements
   - Public : Oui
   - Policies : Read public, Write owner/admin

3. **deals** : Médias bons plans (images, PDF)
   - Public : Oui
   - Policies : Read public, Write owner/admin

4. **menus** : Menus PDF
   - Public : Oui
   - Policies : Read public, Write owner/admin

5. **avatars** : Avatars utilisateurs
   - Public : Oui
   - Policies : Read public, Write own profile

## 🔄 Migration des Données

**Note importante** : Aucune donnée existante ne sera migrée. Les tables seront créées vides, avec possibilité d'insérer des données de test pour validation.

### Scripts à Préparer
- Script de création de schéma (sans données)
- Scripts de fixtures de test
- Scripts de rollback si nécessaire

## 🧪 Scénarios de Test

1. **Inscription utilisateur** : Email/password, OAuth
2. **Inscription professionnel** : Avec SIRET
3. **Création établissement** : Par professionnel
4. **Recherche EnvieSearchBar** : Recherche "envie de"
5. **Ajout commentaire** : Par utilisateur
6. **Ajout favori** : Par utilisateur
7. **Création événement** : Par professionnel
8. **Upload image** : Par professionnel
9. **Validation admin** : Approbation établissement
10. **Messagerie** : Conversation pro-admin

## 📝 Checklist Finale

- [ ] Toutes les tables créées
- [ ] Toutes les RLS policies en place
- [ ] Authentification fonctionnelle
- [ ] Storage configuré
- [ ] Toutes les API routes migrées
- [ ] Tests passent
- [ ] Documentation complète
- [ ] Dashboard admin fonctionnel

