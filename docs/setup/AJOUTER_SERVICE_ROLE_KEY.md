# Comment Ajouter la Clé Service Role Supabase

## 🔑 Étape 1 : Trouver la Clé dans Supabase

1. **Aller sur le Dashboard Supabase** :
   - https://supabase.com/dashboard
   - Connectez-vous à votre compte

2. **Sélectionner votre projet** :
   - Cliquez sur le projet "envie2sortir" (ou le nom de votre projet)

3. **Accéder aux paramètres API** :
   - Dans le menu de gauche, cliquez sur **Settings** (⚙️)
   - Puis cliquez sur **API**

4. **Copier la Service Role Key** :
   - Faites défiler jusqu'à la section **"service_role"**
   - ⚠️ **ATTENTION** : Cette clé est très sensible ! Elle contourne les RLS policies
   - Cliquez sur **"Reveal"** pour voir la clé
   - Copiez la clé complète (commence par `eyJ...`)

## 📝 Étape 2 : Ajouter la Clé dans .env.local

1. **Ouvrir le fichier .env.local** :
   ```bash
   # Dans le terminal
   code .env.local
   # ou
   nano .env.local
   ```

2. **Ajouter la ligne suivante** :
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   Remplacez `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` par votre vraie clé.

3. **Vérifier que vous avez aussi ces clés** :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ✅ Étape 3 : Vérifier

Après avoir ajouté la clé, testez :

```bash
npm run export:prisma-to-supabase
```

Si tout est correct, vous devriez voir :
```
✅ Connexion Supabase réussie
📊 Export des données...
```

## ⚠️ Sécurité

- **NE JAMAIS** commiter `.env.local` dans Git
- **NE JAMAIS** partager la Service Role Key publiquement
- Cette clé permet d'accéder à TOUTES les données, même avec RLS activé
- Utilisez-la uniquement pour les scripts d'administration

## 🔍 Vérification Rapide

Pour vérifier si la clé est bien configurée :

```bash
grep "SUPABASE_SERVICE_ROLE_KEY" .env.local
```

Si vous voyez la ligne, c'est bon ! ✅

