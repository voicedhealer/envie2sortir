-- ============================================
-- Ajout des champs pour identifier la personne effectuant la modification
-- ============================================

-- Ajouter les colonnes requested_by_first_name et requested_by_last_name
ALTER TABLE professional_update_requests
ADD COLUMN IF NOT EXISTS requested_by_first_name TEXT,
ADD COLUMN IF NOT EXISTS requested_by_last_name TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN professional_update_requests.requested_by_first_name IS 'Prénom de la personne ayant effectué la demande de modification';
COMMENT ON COLUMN professional_update_requests.requested_by_last_name IS 'Nom de la personne ayant effectué la demande de modification';

