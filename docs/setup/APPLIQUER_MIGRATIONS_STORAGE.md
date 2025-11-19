# 🚀 Appliquer les migrations Storage sur Supabase

## ❌ Erreur actuelle
```
Upload error (admin): [Error [StorageApiError]: Bucket not found]
```

Le bucket `images` n'existe pas dans Supabase Storage.

## ✅ Solution : Appliquer les migrations

### Étape 1 : Accéder au SQL Editor de Supabase

1. Connecte-toi à [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionne ton projet
3. Va dans **SQL Editor** (menu de gauche)

### Étape 2 : Appliquer la migration 003 (buckets principaux)

Copie et exécute ce SQL dans l'éditeur :

```sql
-- ============================================
-- Supabase Storage Configuration
-- ============================================

-- Création des buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'establishments',
    'establishments',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'events',
    'events',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'deals',
    'deals',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'menus',
    'menus',
    true,
    52428800, -- 50MB
    ARRAY['application/pdf']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;
```

### Étape 3 : Appliquer la migration 007 (bucket images)

Copie et exécute ce SQL :

```sql
-- ============================================
-- Ajout du bucket "images" pour les images génériques
-- ============================================

-- Création du bucket "images"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'images',
    'images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
CREATE POLICY IF NOT EXISTS "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Écriture pour les professionnels (propriétaires d'établissements)
CREATE POLICY IF NOT EXISTS "Professionals can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM establishments
    WHERE owner_id::text IN (
      SELECT id::text FROM professionals
      WHERE id::text IN (
        SELECT id::text FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

-- Suppression pour les propriétaires ou admins
CREATE POLICY IF NOT EXISTS "Image owners and admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE owner_id::text IN (
        SELECT id::text FROM professionals
        WHERE id::text IN (
          SELECT id::text FROM auth.users WHERE id = auth.uid()
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
);
```

### Étape 4 : Vérifier que ça a fonctionné

Execute cette requête pour voir tous les buckets créés :

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
ORDER BY name;
```

Tu devrais voir :
- ✅ avatars
- ✅ deals
- ✅ establishments
- ✅ events
- ✅ **images** 👈 C'est celui-ci qui manquait !
- ✅ menus

### Étape 5 : Retester l'upload

Une fois les buckets créés, retourne dans ton application et réessaye d'uploader une image pour un bon plan.

---

## 🎯 Alternative : Script automatique

Si tu as configuré le Supabase CLI, tu peux aussi appliquer toutes les migrations d'un coup :

```bash
cd /Users/vivien/envie2sortir
supabase db push
```

Ou appliquer une migration spécifique :

```bash
supabase db push --file supabase/migrations/003_storage_setup.sql
supabase db push --file supabase/migrations/007_add_images_bucket.sql
```

---

## 📝 Notes

- Les buckets sont créés avec `ON CONFLICT (id) DO NOTHING` donc si certains existent déjà, ils ne seront pas modifiés
- Les policies RLS protègent les uploads : seuls les professionnels propriétaires peuvent uploader
- Le bucket `images` accepte : JPEG, PNG, WebP, GIF (max 5MB)
- Le bucket `deals` accepte : JPEG, PNG, WebP, PDF (max 10MB)

