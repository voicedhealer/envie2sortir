-- Migration 023: Forcer la politique RLS correcte pour contact_messages
-- S'assure que seuls les utilisateurs authentifiés peuvent créer des messages

-- Supprimer TOUTES les politiques INSERT existantes pour éviter les conflits
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Supprimer toutes les politiques INSERT existantes
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contact_messages', policy_record.policyname);
    END LOOP;
END $$;

-- Créer une politique qui n'autorise QUE les utilisateurs authentifiés
-- Cette politique vérifie que l'utilisateur est authentifié (auth.uid() IS NOT NULL)
CREATE POLICY "Authenticated users can create contact messages"
    ON contact_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Vérifier que la politique a été créée
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_messages' 
        AND policyname = 'Authenticated users can create contact messages'
        AND cmd = 'INSERT'
    ) THEN
        RAISE EXCEPTION 'La politique RLS n''a pas pu être créée';
    END IF;
    
    RAISE NOTICE '✅ Politique RLS créée avec succès pour contact_messages';
END $$;

