-- Script de vérification pour s'assurer que la fonction et la politique existent

-- 1. Vérifier que la fonction existe
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'is_user_admin';

-- 2. Vérifier les permissions sur la fonction
SELECT 
    proname,
    proacl
FROM pg_proc 
WHERE proname = 'is_user_admin';

-- 3. Vérifier que la politique existe
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'messages' 
AND policyname = 'Professionals and admins can view messages';

-- 4. Tester la fonction directement (doit retourner false pour un utilisateur non-admin)
-- Remplacez 'test-user-id' par un vrai ID utilisateur si vous voulez tester
-- SELECT is_user_admin('test-user-id');

