-- ============================================
-- Ajout du bucket "images" pour les images génériques
-- ============================================
-- Ce bucket peut être utilisé pour des images qui ne sont pas
-- spécifiquement liées à un établissement, événement, etc.
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

-- ============================================
-- POLICIES - IMAGES BUCKET
-- ============================================

-- Lecture publique
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Écriture pour les professionnels (propriétaires d'établissements)
CREATE POLICY "Professionals can upload images"
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
CREATE POLICY "Image owners and admins can delete images"
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

