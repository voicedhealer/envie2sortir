# ✅ Checklist de Finalisation - Migration Supabase

**Utilisez cette checklist pour suivre la progression de la finalisation**

---

## 🔴 Phase 1 : Authentification Frontend (Priorité Haute)

### Composants Frontend
- [ ] `src/app/components/AuthProvider.tsx`
  - [ ] Remplacer `SessionProvider` de `next-auth/react`
  - [ ] Utiliser Supabase Auth context
  - [ ] Tester que les sessions fonctionnent

- [ ] `src/app/auth/page.tsx`
  - [ ] Vérifier les imports NextAuth
  - [ ] Migrer vers Supabase Auth
  - [ ] Tester inscription/connexion

- [ ] `src/app/auth/layout.tsx`
  - [ ] Vérifier si utilise NextAuth
  - [ ] Adapter si nécessaire

### Utilitaires Auth
- [ ] `src/lib/auth-utils.ts`
  - [ ] Remplacer `getServerSession` NextAuth
  - [ ] Remplacer `getToken` NextAuth
  - [ ] Utiliser `getCurrentUser()` de Supabase
  - [ ] Migrer toutes les fonctions
  - [ ] Tester chaque fonction

### Routes NextAuth
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
  - [ ] Vérifier si encore utilisée
  - [ ] Supprimer si non utilisée

- [ ] `src/lib/auth-config.ts`
  - [ ] Supprimer (utilise Prisma)

- [ ] `src/lib/auth-actions.ts`
  - [ ] Vérifier si encore utilisé
  - [ ] Supprimer si remplacé par `supabase/auth-actions.ts`

- [ ] `src/types/next-auth.d.ts`
  - [ ] Adapter ou supprimer

### Route Logout
- [ ] `src/app/api/auth/logout/route.ts`
  - [ ] Vérifier si existe
  - [ ] Créer avec Supabase si manquante

### Tests Auth
- [ ] Test inscription utilisateur
- [ ] Test connexion utilisateur
- [ ] Test déconnexion
- [ ] Test OAuth Google
- [ ] Test OAuth Facebook
- [ ] Test session persistante
- [ ] Test refresh token

**Statut Phase 1** : ⬜ Non commencé / 🟡 En cours / ✅ Complété

---

## 🔴 Phase 2 : Utilitaires Restants (Priorité Haute)

### Professional Utils
- [ ] `src/lib/professional-utils.ts`
  - [ ] Identifier fonctions utilisant Prisma
  - [ ] Migrer vers Supabase
  - [ ] Tester chaque fonction
  - [ ] Vérifier dépendances avec autres fichiers

### Subscription Logger
- [ ] `src/lib/subscription-logger.ts`
  - [ ] Identifier fonctions utilisant Prisma
  - [ ] Migrer vers Supabase
  - [ ] Tester le logging

### Vérifications
- [ ] Grep pour `from ['"]@prisma/client['"]` dans `/src`
- [ ] Vérifier qu'aucun fichier de production n'utilise Prisma
- [ ] Vérifier les scripts (peuvent garder Prisma)

**Statut Phase 2** : ⬜ Non commencé / 🟡 En cours / ✅ Complété

---

## 🟡 Phase 3 : Tests et Validation (Priorité Moyenne)

### Tests Unitaires
- [ ] Tests pour `getCurrentUser()`
- [ ] Tests pour `isAdmin()`
- [ ] Tests pour `isProfessional()`
- [ ] Tests pour `requireEstablishment()`
- [ ] Tests pour helpers Supabase
- [ ] Tests pour routes API migrées
- [ ] Couverture de code >80%

### Tests d'Intégration
- [ ] Scénario : Inscription → Connexion → Recherche
- [ ] Scénario : Inscription pro → Création établissement → Upload image
- [ ] Scénario : Recherche → Ajout favori → Commentaire
- [ ] Scénario : Dashboard pro → Création événement → Gestion deals
- [ ] Scénario : Admin → Modération → Actions

### Tests E2E
- [ ] Flux utilisateur complet
- [ ] Flux professionnel complet
- [ ] Flux admin complet
- [ ] Tests de sécurité (RLS)

### Tests de Performance
- [ ] Benchmark requêtes Supabase
- [ ] Test de charge routes critiques
- [ ] Optimisation si nécessaire

**Statut Phase 3** : ⬜ Non commencé / 🟡 En cours / ✅ Complété

---

## 🟡 Phase 4 : Nettoyage (Priorité Moyenne)

### Dépendances
- [ ] Vérifier `package.json` pour `next-auth`
- [ ] Supprimer `next-auth` si non utilisé
- [ ] Vérifier `package.json` pour `@prisma/client`
- [ ] Vérifier `package.json` pour `prisma` (dev)
- [ ] Décider si garder Prisma pour scripts
- [ ] Supprimer dépendances inutilisées

### Fichiers
- [ ] Supprimer fichiers `.backup`
- [ ] Supprimer fichiers obsolètes
- [ ] Nettoyer imports inutilisés
- [ ] Vérifier qu'aucun import ne casse

### Code
- [ ] Optimiser requêtes Supabase
- [ ] Ajouter indexes si nécessaire
- [ ] Optimiser relations Supabase

**Statut Phase 4** : ⬜ Non commencé / 🟡 En cours / ✅ Complété

---

## 🟢 Phase 5 : Documentation (Priorité Basse)

### Documentation Technique
- [ ] Mettre à jour `README.md`
  - [ ] Remplacer mentions Prisma par Supabase
  - [ ] Remplacer mentions NextAuth par Supabase Auth
  - [ ] Mettre à jour architecture
  - [ ] Mettre à jour variables d'environnement

- [ ] Mettre à jour `docs/MIGRATION_PROGRESS.md`
  - [ ] Marquer migration comme complète
  - [ ] Ajouter date de finalisation

- [ ] Créer `docs/MIGRATION_COMPLETE.md`
  - [ ] Résumé de la migration
  - [ ] Statistiques finales
  - [ ] Changements breaking
  - [ ] Guide de déploiement

### Guides Utilisateur
- [ ] Guide de déploiement Supabase
- [ ] Guide de configuration environnement
- [ ] Guide de troubleshooting
- [ ] Documentation API mise à jour

**Statut Phase 5** : ⬜ Non commencé / 🟡 En cours / ✅ Complété

---

## 🔍 Vérifications Finales

### Avant de Marquer "Migration Complète"

#### Code
- [ ] Aucun import `next-auth` dans `/src`
- [ ] Aucun import `@prisma/client` dans `/src/app/api`
- [ ] Toutes les routes API utilisent Supabase
- [ ] Tous les composants auth utilisent Supabase

#### Tests
- [ ] Tous les tests passent
- [ ] Couverture de code >80%
- [ ] Tests E2E fonctionnels
- [ ] Tests de sécurité passés

#### Performance
- [ ] Temps de réponse acceptables
- [ ] Pas de régressions
- [ ] Optimisations appliquées

#### Documentation
- [ ] README.md à jour
- [ ] Documentation complète
- [ ] Guides créés
- [ ] Changelog documenté

---

## 📊 Progression Globale

**Phases complétées** : 0 / 5

- Phase 1 (Auth) : ⬜ 0%
- Phase 2 (Utils) : ⬜ 0%
- Phase 3 (Tests) : ⬜ 0%
- Phase 4 (Nettoyage) : ⬜ 0%
- Phase 5 (Doc) : ⬜ 0%

**Migration globale** : 🟡 95% → Objectif : 100%

---

## 📝 Notes

- Utilisez cette checklist pour suivre la progression
- Cochez chaque item au fur et à mesure
- Mettez à jour le statut de chaque phase
- Documentez les problèmes rencontrés

---

**Dernière mise à jour** : 13 novembre 2025

