-- ============================================
-- SCRIPT : Recréation propre du compte Administrateur
-- ============================================
-- 
-- Ce script supprime l'ancien compte admin et en crée un nouveau
-- avec les métadonnées correctement configurées.
--
-- IMPORTANT : 
-- - Exécuter ce script dans l'éditeur SQL de Supabase
-- - Vider les cookies et localStorage du navigateur après exécution
-- - Le mot de passe par défaut est : Admin123!Secure
-- ============================================

-- 1. Activer l'extension pgcrypto si nécessaire
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Supprimer l'ancien compte admin de la table users (si elle existe et a une relation)
DO $$
BEGIN
    -- Supprimer d'abord les références dans la table users si elle existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DELETE FROM public.users WHERE email = 'envie2sortir.fr@gmail.com';
        RAISE NOTICE 'Compte supprimé de la table users';
    END IF;
    
    -- Supprimer les références dans la table professionals si elle existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'professionals') THEN
        DELETE FROM public.professionals WHERE email = 'envie2sortir.fr@gmail.com';
        RAISE NOTICE 'Compte supprimé de la table professionals';
    END IF;
END $$;

-- 3. Supprimer l'ancien compte de auth.users
DELETE FROM auth.users 
WHERE email = 'envie2sortir.fr@gmail.com';

-- Vérifier que la suppression a fonctionné
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Comptes supprimés de auth.users : %', deleted_count;
END $$;

-- 4. Créer le nouveau compte admin avec les métadonnées correctes
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- instance_id par défaut
    gen_random_uuid(), -- ID unique
    'authenticated', -- aud
    'authenticated', -- role
    'envie2sortir.fr@gmail.com', -- email
    crypt('Admin123!Secure', gen_salt('bf')), -- mot de passe hashé (Admin123!Secure)
    now(), -- email_confirmed_at (email confirmé automatiquement)
    NULL, -- invited_at
    '', -- confirmation_token
    NULL, -- confirmation_sent_at
    '', -- recovery_token
    NULL, -- recovery_sent_at
    '', -- email_change_token_new
    '', -- email_change
    NULL, -- email_change_sent_at
    NULL, -- last_sign_in_at
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb, -- CRITIQUE : Rôle admin dans app_metadata
    '{"firstName": "Admin", "lastName": "Envie2Sortir", "role": "admin"}'::jsonb, -- Rôle admin dans user_metadata
    false, -- is_super_admin
    now(), -- created_at
    now(), -- updated_at
    NULL, -- phone
    NULL, -- phone_confirmed_at
    '', -- phone_change
    '', -- phone_change_token
    NULL, -- phone_change_sent_at
    '', -- email_change_token_current
    0, -- email_change_confirm_status
    NULL, -- banned_until
    '', -- reauthentication_token
    NULL, -- reauthentication_sent_at
    false, -- is_sso_user
    NULL -- deleted_at
);

-- 5. Vérifier la création
DO $$
DECLARE
    new_user_id UUID;
    app_role TEXT;
    user_role TEXT;
BEGIN
    SELECT id, 
           (raw_app_meta_data->>'role')::TEXT,
           (raw_user_meta_data->>'role')::TEXT
    INTO new_user_id, app_role, user_role
    FROM auth.users
    WHERE email = 'envie2sortir.fr@gmail.com';
    
    IF new_user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Compte admin créé avec succès !';
        RAISE NOTICE '   - ID : %', new_user_id;
        RAISE NOTICE '   - Email : envie2sortir.fr@gmail.com';
        RAISE NOTICE '   - Mot de passe : Admin123!Secure';
        RAISE NOTICE '   - app_metadata.role : %', app_role;
        RAISE NOTICE '   - user_metadata.role : %', user_role;
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  PROCHAINES ÉTAPES :';
        RAISE NOTICE '   1. Vider les cookies du navigateur (sb-xxx-auth-token)';
        RAISE NOTICE '   2. Vider le localStorage';
        RAISE NOTICE '   3. Se connecter avec : envie2sortir.fr@gmail.com / Admin123!Secure';
    ELSE
        RAISE EXCEPTION '❌ Erreur : Le compte n''a pas été créé';
    END IF;
END $$;

-- 6. Optionnel : Créer une entrée dans la table users si elle existe
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Récupérer l'ID du nouvel utilisateur
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'envie2sortir.fr@gmail.com';
    
    -- Si la table users existe, créer une entrée
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
        VALUES (
            user_id,
            'envie2sortir.fr@gmail.com',
            'Admin',
            'Envie2Sortir',
            'admin',
            now(),
            now()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            updated_at = now();
        
        RAISE NOTICE '✅ Entrée créée/mise à jour dans la table users';
    END IF;
END $$;


