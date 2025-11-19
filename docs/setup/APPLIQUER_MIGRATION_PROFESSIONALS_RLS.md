# Appliquer la migration RLS pour la table `professionals`

## Problème résolu

Cette migration corrige l'erreur **400 (Bad Request)** lors de la connexion des professionnels en ajoutant les politiques RLS nécessaires pour que le client Supabase côté navigateur puisse lire la table `professionals`.

## Méthode 1 : Via le Dashboard Supabase (Recommandé)

### Étapes :

1. **Ouvrir le Dashboard Supabase**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet

2. **Accéder à l'éditeur SQL**
   - Dans le menu latéral, cliquer sur **"SQL Editor"**

3. **Créer une nouvelle requête**
   - Cliquer sur **"New query"**

4. **Copier-coller le contenu du fichier**
   - Ouvrir le fichier `supabase/migrations/008_fix_professionals_rls.sql`
   - Copier tout le contenu
   - Coller dans l'éditeur SQL

5. **Exécuter la migration**
   - Cliquer sur **"Run"** (ou Ctrl+Enter / Cmd+Enter)
   - Attendre la confirmation : ✅ Success

6. **Vérifier les politiques**
   - Aller dans **"Authentication" > "Policies"**
   - Chercher la table `professionals`
   - Vous devriez voir 3 nouvelles politiques :
     - ✅ "Professionals can read their own data"
     - ✅ "Professionals can update their own data"
     - ✅ "Anyone can create a professional account"

## Méthode 2 : Via Supabase CLI

```bash
# Depuis le répertoire du projet
npx supabase db push

# OU si vous avez la CLI installée globalement
supabase db push
```

## Vérification

Après avoir appliqué la migration :

1. **Rafraîchir complètement la page** (Cmd+Shift+R ou Ctrl+Shift+R)
2. **Se reconnecter** en tant que professionnel
3. **Vérifier la console** - vous devriez voir :
   ```
   ✅ [useSupabaseSession] Session found, fetching user data...
   👤 [useSupabaseSession] Fetching user data for: ...
   🔍 [useSupabaseSession] Professionals table result: { professionalData: {...}, error: null }
   ✅ [useSupabaseSession] Setting user from professionals table: { firstName: "Maxime", ... }
   ```

4. **Le header devrait afficher "Maxime"** au lieu de "Utilisateur"

## En cas d'erreur

Si vous voyez encore des erreurs 400 :
- Vérifier que RLS est bien activé sur la table `professionals`
- Vérifier que les 3 politiques sont présentes
- Vider le cache du navigateur et réessayer
- Vérifier les logs dans **"Database" > "Logs"**

