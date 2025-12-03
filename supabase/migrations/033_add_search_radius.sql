-- ============================================
-- Ajout de la colonne search_radius à search_analytics
-- Pour tracker le rayon de recherche utilisé
-- ============================================

-- Ajouter la colonne search_radius (rayon en km)
ALTER TABLE search_analytics
ADD COLUMN IF NOT EXISTS search_radius INTEGER;

-- Commentaire pour documentation
COMMENT ON COLUMN search_analytics.search_radius IS 'Rayon de recherche utilisé en kilomètres (ex: 5, 10, 20, 50)';

