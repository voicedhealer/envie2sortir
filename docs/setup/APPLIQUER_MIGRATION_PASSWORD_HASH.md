# Appliquer la Migration pour password_hash

## 🔧 Problème

L'erreur `null value in column "password_hash" of relation "professionals" violates not-null constraint` indique que la colonne `password_hash` est NOT NULL mais n'est plus nécessaire avec Supabase Auth.

## ✅ Solution

Rendre la colonne `password_hash` nullable dans la table `professionals`.

## 📝 Méthode 1 : Via le Dashboard Supabase (Recommandé)

1. **Aller sur le Dashboard Supabase** :
   - https://supabase.com/dashboard
   - Sélectionner votre projet

2. **Ouvrir l'éditeur SQL** :
   - Dans le menu de gauche, cliquez sur **SQL Editor**
   - Cliquez sur **New query**

3. **Exécuter la migration** :
   ```sql
   -- Rendre password_hash nullable dans professionals
   ALTER TABLE professionals 
   ALTER COLUMN password_hash DROP NOT NULL;

   -- Optionnel : Ajouter un commentaire
   COMMENT ON COLUMN professionals.password_hash IS 'Déprécié : Le mot de passe est maintenant géré par Supabase Auth. Cette colonne est conservée pour compatibilité avec les anciennes données.';
   ```

4. **Cliquer sur Run** (ou Cmd/Ctrl + Enter)

5. **Vérifier** :
   - Vous devriez voir "Success. No rows returned"
   - La colonne `password_hash` est maintenant nullable

## 📝 Méthode 2 : Via le fichier de migration

Si vous utilisez Supabase CLI :

```bash
# Appliquer toutes les migrations
npx supabase db push

# Ou appliquer uniquement cette migration
npx supabase migration up
```

## ✅ Vérification

Après avoir appliqué la migration, réessayez l'inscription d'un établissement. L'erreur devrait être résolue.

## 🔍 Pourquoi cette migration ?

Avec Supabase Auth, le mot de passe est géré par le service Auth de Supabase, pas dans notre table `professionals`. La colonne `password_hash` est conservée pour compatibilité avec les anciennes données (migration depuis Prisma), mais elle n'est plus requise pour les nouveaux enregistrements.

