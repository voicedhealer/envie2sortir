-- Migration 024: Fonction RPC pour créer des messages de contact
-- Utilise SECURITY DEFINER pour contourner RLS de manière sécurisée
-- Vérifie que l'utilisateur est authentifié avant d'insérer

CREATE OR REPLACE FUNCTION create_contact_message(
    p_name TEXT,
    p_email TEXT,
    p_subject TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'general'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    message_id UUID;
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Vous devez être connecté pour envoyer un message';
    END IF;
    
    -- Insérer le message
    INSERT INTO contact_messages (
        name,
        email,
        subject,
        message,
        type,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_name,
        p_email,
        p_subject,
        p_message,
        COALESCE(p_type, 'general'),
        'new',
        now(),
        now()
    )
    RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$;

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION create_contact_message(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Commentaire
COMMENT ON FUNCTION create_contact_message IS 'Fonction sécurisée pour créer un message de contact. Nécessite une authentification.';

