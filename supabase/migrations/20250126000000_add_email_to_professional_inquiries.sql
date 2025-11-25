-- Migration pour ajouter le champ email à la table professional_inquiries
-- Permet de contacter directement les professionnels qui font une demande

ALTER TABLE professional_inquiries 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_professional_inquiries_email ON professional_inquiries(email);

-- Commentaire pour la documentation
COMMENT ON COLUMN professional_inquiries.email IS 'Email du professionnel pour le contacter';

