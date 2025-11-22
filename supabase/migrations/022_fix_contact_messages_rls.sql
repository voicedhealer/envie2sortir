-- Migration 022: Correction de la politique RLS pour contact_messages
-- Seuls les utilisateurs authentifiés peuvent envoyer des messages

-- Supprimer toutes les politiques INSERT existantes pour éviter les conflits
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can create contact messages" ON contact_messages;

-- Créer une politique qui n'autorise que les utilisateurs authentifiés
CREATE POLICY "Authenticated users can create contact messages"
    ON contact_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

