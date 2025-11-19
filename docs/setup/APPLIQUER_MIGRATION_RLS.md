# Guide : Appliquer la migration RLS pour establishments

## Problème résolu

Les politiques RLS sur la table `establishments` vérifiaient la table `users` pour les admins, ce qui causait des erreurs "permission denied for table users" pour les professionnels.

## Solution

La migration `005_fix_establishments_rls.sql` simplifie les politiques RLS pour :
- Permettre aux propriétaires de voir/modifier/supprimer leurs propres établissements
- Permettre à tous de voir les établissements approuvés
- Éviter les vérifications sur la table `users` qui causaient des erreurs

## Comment appliquer la migration

### Option 1 : Via Supabase Dashboard (Recommandé)

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **New query**
5. Copiez le contenu du fichier `supabase/migrations/005_fix_establishments_rls.sql`
6. Collez-le dans l'éditeur SQL
7. Cliquez sur **Run** (ou appuyez sur `Cmd+Enter` / `Ctrl+Enter`)

### Option 2 : Via Supabase CLI

Si vous avez Supabase CLI installé :

```bash
# Appliquer la migration
supabase db push
```

## Vérification

Après avoir appliqué la migration, vous pouvez tester :

1. Connectez-vous avec un compte professionnel
2. Essayez d'accéder au dashboard
3. L'établissement devrait être trouvé sans erreur RLS

## Extension : sécurisation des autres tables

Le Security Advisor de Supabase signalait encore plusieurs tables publiques sans RLS (`professional_update_requests`, `etablissement_tags`, `deal_engagements`, `featured_promotions`, `establishment_menus`, `pricing`, `tariffs`, `establishment_learning_patterns`).  
La migration `006_enable_rls_additional_tables.sql` :

- Active RLS sur chacune de ces tables
- Ajoute des politiques adaptées (lecture publique uniquement pour les données approuvées, modifications limitées aux propriétaires, accès admin restreint pour les données sensibles)

### Application

Les étapes sont identiques à la migration précédente :

1. Ouvrir le **SQL Editor** sur le dashboard Supabase
2. Créer une nouvelle requête
3. Coller le contenu de `supabase/migrations/006_enable_rls_additional_tables.sql`
4. Exécuter la requête

### Vérification

1. Rafraîchir la page **Security Advisor** : les erreurs "RLS Disabled in Public" doivent disparaître
2. Tester les flux suivants :
   - Création / consultation des demandes de mise à jour pro
   - Gestion des menus, tarifs et tags depuis le dashboard pro
   - Enregistrement et consultation des engagements sur les bons plans
   - Consultation des statistiques d'apprentissage (admin)

## Note importante

Les routes API admin continuent d'utiliser le client service-role lorsque nécessaire (par exemple pour les patterns d'apprentissage), ce qui leur permet de contourner RLS tout en gardant une surface d'attaque minimale côté clients publics.
