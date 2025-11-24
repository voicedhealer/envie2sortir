-- Migration 020: Solution RPC pour le compteur de messages
-- Cette fonction s'exécute en mode "SECURITY DEFINER" (droits système)
-- Elle contourne donc tous les problèmes de permission "permission denied for table users"

CREATE OR REPLACE FUNCTION get_unread_messages_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    user_role TEXT;
    count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    -- 1. Récupérer le rôle depuis les métadonnées JWT uniquement
    -- Ne pas accéder à auth.users car cela nécessite des permissions spéciales
    user_role := auth.jwt() -> 'app_metadata' ->> 'role';

    -- CAS 1 : ADMIN
    -- L'admin veut savoir combien de messages de PROS sont non lus
    IF user_role = 'admin' THEN
        SELECT COUNT(*) INTO count
        FROM messages
        WHERE sender_type = 'PROFESSIONAL'
        AND is_read = false;
        
        RETURN COALESCE(count, 0);
    END IF;

    -- CAS 2 : PROFESSIONNEL / UTILISATEUR
    -- Ils veulent savoir combien de messages ADMIN sont non lus dans LEURS conversations
    SELECT COUNT(m.id) INTO count
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.professional_id::text = current_user_id::text
    AND m.sender_type = 'ADMIN'
    AND m.is_read = false;
    
    RETURN COALESCE(count, 0);
END;
$$;

-- Donner la permission d'exécuter la fonction à tous les utilisateurs connectés
GRANT EXECUTE ON FUNCTION get_unread_messages_count() TO authenticated;

