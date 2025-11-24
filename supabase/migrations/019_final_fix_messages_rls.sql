-- Migration 019: Nettoyage complet et solution finale pour les permissions sur messages

-- ÉTAPE 1: Supprimer TOUTES les politiques sur messages
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', pol.policyname);
    END LOOP;
END $$;

-- ÉTAPE 2: Supprimer la fonction is_user_admin si elle existe
DROP FUNCTION IF EXISTS is_user_admin(TEXT);

-- ÉTAPE 3: Supprimer le trigger de synchronisation JWT si existant
DROP TRIGGER IF EXISTS sync_user_role_trigger ON users;
DROP FUNCTION IF EXISTS sync_user_role_to_jwt();

-- ÉTAPE 4: Créer une SEULE politique claire sur messages
-- Cette politique utilise UNIQUEMENT auth.jwt() et auth.uid(), JAMAIS la table users
CREATE POLICY "messages_select_policy"
    ON messages FOR SELECT
    USING (
        -- Admins peuvent tout voir (via JWT metadata - ne lit PAS la table users)
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR
        -- Professionnels voient leurs conversations
        conversation_id IN (
            SELECT id FROM conversations
            WHERE professional_id::text = auth.uid()::text
        )
    );

-- ÉTAPE 5: Vérifier la politique créée
SELECT 
    'SUCCESS: Politique créée' as status,
    policyname,
    cmd,
    LEFT(qual::text, 100) as policy_condition
FROM pg_policies
WHERE tablename = 'messages' 
  AND schemaname = 'public'
ORDER BY policyname;

