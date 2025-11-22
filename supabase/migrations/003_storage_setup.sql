-- ============================================
-- Supabase Storage Configuration
-- ============================================
-- Création des buckets et policies pour le stockage
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

-- ============================================
-- POLICIES - ESTABLISHMENTS BUCKET
-- ============================================

-- Lecture publique
CREATE POLICY "Public can view establishment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishments');

-- Écriture uniquement pour les propriétaires
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

-- ============================================
-- POLICIES - EVENTS BUCKET
-- ============================================

CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

CREATE POLICY "Event owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' AND
  (storage.foldername(name))[1] IN (
    SELECT e.id::text FROM events e
    JOIN establishments est ON e.establishment_id = est.id
    WHERE est.owner_id::text IN (
      SELECT id::text FROM professionals
      WHERE id::text IN (
        SELECT id::text FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Event owners and admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'events' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM events e
      JOIN establishments est ON e.establishment_id = est.id
      WHERE est.owner_id::text IN (
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

-- ============================================
-- POLICIES - DEALS BUCKET
-- ============================================

CREATE POLICY "Public can view deal media"
ON storage.objects FOR SELECT
USING (bucket_id = 'deals');

CREATE POLICY "Deal owners can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deals' AND
  (storage.foldername(name))[1] IN (
    SELECT dd.id::text FROM daily_deals dd
    JOIN establishments est ON dd.establishment_id = est.id
    WHERE est.owner_id::text IN (
      SELECT id::text FROM professionals
      WHERE id::text IN (
        SELECT id::text FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Deal owners and admins can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deals' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT dd.id::text FROM daily_deals dd
      JOIN establishments est ON dd.establishment_id = est.id
      WHERE est.owner_id::text IN (
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

-- ============================================
-- POLICIES - MENUS BUCKET
-- ============================================

CREATE POLICY "Public can view menus"
ON storage.objects FOR SELECT
USING (bucket_id = 'menus');

CREATE POLICY "Menu owners can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menus' AND
  (storage.foldername(name))[1] IN (
    SELECT em.establishment_id::text FROM establishment_menus em
    JOIN establishments est ON em.establishment_id = est.id
    WHERE est.owner_id::text IN (
      SELECT id::text FROM professionals
      WHERE id::text IN (
        SELECT id::text FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Menu owners and admins can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menus' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT em.establishment_id::text FROM establishment_menus em
      JOIN establishments est ON em.establishment_id = est.id
      WHERE est.owner_id::text IN (
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

-- ============================================
-- POLICIES - AVATARS BUCKET
-- ============================================

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

