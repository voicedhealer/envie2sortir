# Guide : Créer le bucket "images" dans Supabase Storage

## Problème

L'erreur "Bucket not found" indique que le bucket Supabase Storage "images" n'existe pas.

## Solution rapide (recommandée)

Le code a été modifié pour utiliser le bucket "establishments" qui existe déjà. **Aucune action n'est nécessaire** - l'upload devrait maintenant fonctionner.

## Solution alternative : Créer le bucket "images"

Si vous préférez utiliser un bucket "images" séparé (utile pour d'autres types d'images), vous pouvez :

### Option 1 : Via Supabase Dashboard (Recommandé)

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Storage** (dans le menu de gauche)
4. Cliquez sur **New bucket**
5. Configurez le bucket :
   - **Name**: `images`
   - **Public bucket**: ✅ Activé (pour que les images soient accessibles publiquement)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
6. Cliquez sur **Create bucket**

### Option 2 : Via SQL Migration

Appliquez la migration `007_add_images_bucket.sql` via le SQL Editor de Supabase :

1. Allez dans **SQL Editor**
2. Cliquez sur **New query**
3. Copiez le contenu de `supabase/migrations/007_add_images_bucket.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur **Run**

## Vérification

Après avoir créé le bucket, vous pouvez tester l'upload d'image. L'erreur "Bucket not found" ne devrait plus apparaître.

## Note

Le code utilise maintenant le bucket "establishments" par défaut, ce qui est plus logique car les images d'établissement sont stockées dans ce bucket. Le bucket "images" est optionnel et peut être utilisé pour d'autres types d'images si nécessaire.

