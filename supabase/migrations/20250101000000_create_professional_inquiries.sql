-- Migration pour créer la table professional_inquiries
-- Cette table stocke les demandes de renseignements des professionnels depuis la page d'attente

CREATE TABLE IF NOT EXISTS professional_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  establishment_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  description TEXT,
  ip_address VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_professional_inquiries_created_at ON professional_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_professional_inquiries_city ON professional_inquiries(city);

-- RLS (Row Level Security) - Permettre l'insertion publique mais la lecture uniquement pour les admins
ALTER TABLE professional_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre l'insertion publique (pour le formulaire de la page d'attente)
CREATE POLICY "Allow public insert for professional inquiries"
  ON professional_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy pour permettre la lecture uniquement aux admins
CREATE POLICY "Allow admin read for professional inquiries"
  ON professional_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Commentaires pour la documentation
COMMENT ON TABLE professional_inquiries IS 'Demandes de renseignements des professionnels depuis la page d''attente';
COMMENT ON COLUMN professional_inquiries.first_name IS 'Prénom du professionnel';
COMMENT ON COLUMN professional_inquiries.last_name IS 'Nom du professionnel';
COMMENT ON COLUMN professional_inquiries.establishment_name IS 'Nom de l''établissement';
COMMENT ON COLUMN professional_inquiries.city IS 'Ville de l''établissement';
COMMENT ON COLUMN professional_inquiries.description IS 'Description et motif de la demande';
COMMENT ON COLUMN professional_inquiries.ip_address IS 'Adresse IP pour le rate limiting et la sécurité';

