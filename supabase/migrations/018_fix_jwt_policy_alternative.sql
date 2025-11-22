-- Migration 018: Alternative pour la politique JWT
-- Simplifier la vérification du rôle admin dans le JWT

-- ÉTAPE 1: Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Professionals and admins can view messages" ON messages;

-- ÉTAPE 2: Créer une politique plus simple qui teste le JWT différemment
CREATE POLICY "Professionals and admins can view messages"
    ON messages FOR SELECT
    USING (
        -- Vérifier si l'utilisateur a le rôle admin dans son JWT
        -- Utiliser ->> pour extraire directement la string
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR
        -- Les professionnels peuvent voir les messages de leurs conversations
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text = auth.uid()::text
        )
    );

-- ÉTAPE 3: Vérifier que la politique a été créée
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'messages'
  AND policyname = 'Professionals and admins can view messages';

