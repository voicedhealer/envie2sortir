-- ============================================
-- Migration: Ajout des champs d'acceptation CGV et CGU
-- ============================================

-- Ajouter les colonnes pour stocker l'acceptation des CGV et CGU
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS terms_accepted_cgv BOOLEAN DEFAULT false;

ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS terms_accepted_cgu BOOLEAN DEFAULT false;

-- Ajouter les timestamps pour savoir quand les conditions ont été acceptées
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS terms_accepted_cgv_at TIMESTAMPTZ;

ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS terms_accepted_cgu_at TIMESTAMPTZ;

-- Créer des index pour faciliter les recherches
CREATE INDEX IF NOT EXISTS idx_professionals_terms_accepted_cgv ON professionals(terms_accepted_cgv);
CREATE INDEX IF NOT EXISTS idx_professionals_terms_accepted_cgu ON professionals(terms_accepted_cgu);

-- Commentaires pour documentation
COMMENT ON COLUMN professionals.terms_accepted_cgv IS 'Indique si le professionnel a accepté les Conditions Générales de Vente (CGV) lors de l''étape 6 du formulaire d''inscription';
COMMENT ON COLUMN professionals.terms_accepted_cgu IS 'Indique si le professionnel a accepté les Conditions Générales d''Utilisation (CGU) lors de l''étape 8 du formulaire d''inscription';
COMMENT ON COLUMN professionals.terms_accepted_cgv_at IS 'Date et heure d''acceptation des CGV';
COMMENT ON COLUMN professionals.terms_accepted_cgu_at IS 'Date et heure d''acceptation des CGU';

