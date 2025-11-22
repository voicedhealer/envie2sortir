# Configuration Supabase Storage

## 📦 Buckets à Créer

### 1. Bucket `establishments`
**Description** : Images d'établissements

**Configuration** :
- Public : Oui
- File size limit : 5MB
- Allowed MIME types : image/jpeg, image/png, image/webp, image/gif

**Policies** :
```sql
-- Lecture publique
CREATE POLICY "Public can view establishment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishments');

-- Écriture uniquement pour les propriétaires d'établissements
CREATE POLICY "Establishment owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'establishments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM establishments
    WHERE owner_id::text IN (
      SELECT id::text FROM professionals
      WHERE id::text IN (
        SELECT id::text FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

-- Suppression uniquement pour les propriétaires ou admins
CREATE POLICY "Establishment owners and admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'establishments' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM establishments
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

### 2. Bucket `events`
**Description** : Images d'événements

**Configuration** :
- Public : Oui
- File size limit : 5MB
- Allowed MIME types : image/jpeg, image/png, image/webp, image/gif

**Policies** : Similaires à `establishments`, mais pour les événements

### 3. Bucket `deals`
**Description** : Médias bons plans (images, PDF)

**Configuration** :
- Public : Oui
- File size limit : 10MB
- Allowed MIME types : image/jpeg, image/png, image/webp, application/pdf

**Policies** : Similaires à `establishments`

### 4. Bucket `menus`
**Description** : Menus PDF

**Configuration** :
- Public : Oui
- File size limit : 10MB
- Allowed MIME types : application/pdf

**Policies** : Similaires à `establishments`

### 5. Bucket `avatars`
**Description** : Avatars utilisateurs

**Configuration** :
- Public : Oui
- File size limit : 2MB
- Allowed MIME types : image/jpeg, image/png, image/webp

**Policies** :
```sql
-- Lecture publique
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Écriture uniquement pour son propre avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression uniquement pour son propre avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 📁 Structure des Dossiers

### Format de nommage
```
bucket_name/
  {establishment_id|user_id|event_id}/
    {timestamp}_{uuid}.{extension}
```

### Exemples
```
establishments/
  abc-123-def/
    1704067200000_550e8400-e29b-41d4-a716-446655440000.webp

events/
  xyz-789-ghi/
    1704067200000_660e8400-e29b-41d4-a716-446655440001.jpg

deals/
  abc-123-def/
    1704067200000_770e8400-e29b-41d4-a716-446655440002.pdf

menus/
  abc-123-def/
    menu-principal.pdf

avatars/
  user-123/
    avatar.webp
```

## 🔧 Script SQL de Création

Créer un fichier `supabase/migrations/003_storage_setup.sql` :

```sql
-- Création des buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('establishments', 'establishments', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('events', 'events', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('deals', 'deals', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('menus', 'menus', true, 10485760, ARRAY['application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Policies pour establishments
CREATE POLICY "Public can view establishment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishments');

CREATE POLICY "Establishment owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'establishments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM establishments
    WHERE owner_id::text IN (
      SELECT id::text FROM professionals
      WHERE id::text IN (
        SELECT id::text FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Establishment owners and admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'establishments' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM establishments
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

-- Répéter pour les autres buckets...
```

## 🔄 Migration depuis Stockage Local

### Étapes
1. Lister tous les fichiers dans `/public/uploads`
2. Pour chaque fichier :
   - Identifier le type (établissement, événement, etc.)
   - Identifier l'ID associé
   - Uploader vers le bucket Supabase correspondant
   - Mettre à jour l'URL dans la base de données

### Script de migration (à créer)
```typescript
// scripts/migrate-storage-to-supabase.ts
// Script pour migrer les fichiers locaux vers Supabase Storage
```

## 📝 Notes Importantes

1. **URLs publiques** : Les fichiers dans les buckets publics sont accessibles via :
   ```
   https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
   ```

2. **Optimisation** : Continuer à utiliser Sharp pour optimiser les images avant upload

3. **CDN** : Supabase utilise un CDN pour servir les fichiers, donc les performances seront meilleures

4. **Backup** : Les fichiers sont automatiquement sauvegardés par Supabase

