-- ============================================
-- Correction des politiques RLS pour search_analytics
-- Permettre l'insertion par tous les utilisateurs (anonymes inclus)
-- ============================================

-- Vérifier si RLS est activé
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow public insert for search_analytics" ON search_analytics;
DROP POLICY IF EXISTS "Allow public read for search_analytics" ON search_analytics;
DROP POLICY IF EXISTS "Allow admin read for search_analytics" ON search_analytics;

-- Politique pour permettre l'insertion par tous (anonymes inclus)
-- C'est nécessaire car les recherches sont trackées côté client sans authentification
CREATE POLICY "Allow public insert for search_analytics"
  ON search_analytics
  FOR INSERT
  WITH CHECK (true); -- Permettre toutes les insertions

-- Politique pour permettre la lecture par les admins uniquement
CREATE POLICY "Allow admin read for search_analytics"
  ON search_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR (auth.jwt() ->> 'role')::text = 'admin')
    )
  );

-- Commentaires pour documentation
COMMENT ON POLICY "Allow public insert for search_analytics" ON search_analytics IS 
  'Permet à tous les utilisateurs (y compris anonymes) d''enregistrer des recherches pour les analytics';

COMMENT ON POLICY "Allow admin read for search_analytics" ON search_analytics IS 
  'Permet uniquement aux admins de lire les données de recherche analytics';

