# 🖼️ Créer le bucket `images` via l'interface Supabase

## 🎯 Objectif
Créer le bucket `images` manquant pour résoudre l'erreur :
```
Upload error (admin): [Error [StorageApiError]: Bucket not found]
```

---

## 📋 Méthode 1 : Interface graphique (la plus simple)

### Étape 1 : Accéder à Storage
1. Va sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionne ton projet **Envie2Sortir**
3. Dans le menu de gauche, clique sur **Storage** 🗂️

### Étape 2 : Créer le bucket
1. Clique sur **New bucket** (bouton vert en haut à droite)
2. Remplis le formulaire :
   - **Name**: `images`
   - **Public bucket**: ✅ **OUI** (coché)
   - **File size limit**: `5242880` (5 MB en bytes)
   - **Allowed MIME types**: 
     ```
     image/jpeg
     image/png
     image/webp
     image/gif
     ```
3. Clique sur **Create bucket**

### Étape 3 : Configurer les Policies RLS

1. Dans la liste des buckets, clique sur le bucket **images**
2. Va dans l'onglet **Policies**
3. Clique sur **New policy**

#### Policy 1 : Lecture publique
- **Policy name**: `Public can view images`
- **Policy command**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  bucket_id = 'images'
  ```

#### Policy 2 : Upload par les professionnels
- **Policy name**: `Professionals can upload images`
- **Policy command**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
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
  ```

#### Policy 3 : Suppression par les propriétaires
- **Policy name**: `Image owners and admins can delete images`
- **Policy command**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
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
  ```

---

## 📋 Méthode 2 : SQL Editor (plus rapide)

1. Va sur [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionne ton projet
3. Clique sur **SQL Editor** dans le menu de gauche
4. Clique sur **New query**
5. Copie-colle ce code SQL :

```sql
-- Créer le bucket images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Lecture publique
CREATE POLICY IF NOT EXISTS "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Upload par les professionnels
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

-- Policy: Suppression par les propriétaires/admins
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

6. Clique sur **Run** (ou Ctrl/Cmd + Enter)
7. Tu devrais voir : `Success. No rows returned`

---

## ✅ Vérification

### Via l'interface
1. Va dans **Storage**
2. Tu devrais voir le bucket **images** dans la liste

### Via SQL
Execute cette requête dans le SQL Editor :
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'images';
```

Tu devrais voir :
| id | name | public | file_size_limit |
|----|------|--------|-----------------|
| images | images | true | 5242880 |

---

## 🎉 C'est prêt !

Une fois le bucket créé, retourne dans ton application et réessaye d'uploader une image pour un bon plan. Ça devrait fonctionner !

---

## 🐛 Problèmes fréquents

### Le bucket existe déjà
Si tu vois l'erreur `duplicate key value violates unique constraint`, c'est que le bucket existe déjà. Vérifie dans **Storage** > **Buckets**.

### Erreur de permission
Si tu vois `new row violates row-level security policy`, vérifie que :
1. Tu es bien connecté en tant que professionnel
2. Ton professionnel a bien un établissement associé
3. Les policies RLS sont bien créées

### L'upload échoue toujours
1. Vérifie dans la console du navigateur (F12) → **Network** → cherche la requête qui échoue
2. Regarde les logs Supabase dans **Project Settings** > **API** > **Realtime logs**
3. Vérifie que tu utilises bien le bucket `images` dans ton code

