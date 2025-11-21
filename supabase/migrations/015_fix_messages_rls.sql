-- Correction des politiques RLS pour messages
-- Les admins doivent pouvoir voir tous les messages directement
-- Les professionnels ne voient que les messages de leurs conversations

-- Supprimer l'ancienne politique trop restrictive
DROP POLICY IF EXISTS "Professionals and admins can view messages" ON messages;

-- Créer une nouvelle politique qui permet :
-- 1. Aux admins de voir TOUS les messages
-- 2. Aux professionnels de voir uniquement les messages de leurs conversations
CREATE POLICY "Professionals and admins can view messages"
    ON messages FOR SELECT
    USING (
        -- Les admins peuvent voir tous les messages
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
        OR
        -- Les professionnels peuvent voir les messages de leurs conversations
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text = auth.uid()::text
        )
    );

-- La politique INSERT reste la même (déjà correcte)
-- Pas besoin de la modifier

