-- Migration 021: Table pour les messages de contact
-- Permet de stocker les messages envoyés via le formulaire de contact
-- Migration idempotente : peut être exécutée plusieurs fois sans erreur

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches par statut et date (avec IF NOT EXISTS via DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contact_messages_status') THEN
        CREATE INDEX idx_contact_messages_status ON contact_messages(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contact_messages_created_at') THEN
        CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contact_messages_email') THEN
        CREATE INDEX idx_contact_messages_email ON contact_messages(email);
    END IF;
END $$;

-- RLS (Row Level Security) - Les messages sont accessibles uniquement par les admins
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour éviter les doublons)
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

-- Politique : Seuls les admins peuvent lire les messages
CREATE POLICY "Admins can view contact messages"
    ON contact_messages FOR SELECT
    USING (
        COALESCE(
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin',
            false
        )
    );

-- Politique : Tout le monde peut créer des messages (formulaire public)
CREATE POLICY "Anyone can create contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

-- Politique : Seuls les admins peuvent mettre à jour les messages
CREATE POLICY "Admins can update contact messages"
    ON contact_messages FOR UPDATE
    USING (
        COALESCE(
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin',
            false
        )
    );

-- Commentaire sur la table
COMMENT ON TABLE contact_messages IS 'Messages envoyés via le formulaire de contact public';

