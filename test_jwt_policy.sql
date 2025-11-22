-- Test direct de la politique JWT pour messages
-- Exécuter en tant qu'utilisateur admin (433c84be-1e08-4dbe-a07e-1bf364206bfd)

-- 1. Vérifier le rôle dans le JWT
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() -> 'app_metadata' ->> 'role' as role_from_jwt;

-- 2. Test de la condition admin
SELECT 
    CASE 
        WHEN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN 'ADMIN DÉTECTÉ ✅'
        ELSE 'ADMIN NON DÉTECTÉ ❌'
    END as test_admin;

-- 3. Test de comptage des messages (comme dans l'API)
SELECT COUNT(*) as total_messages_visible
FROM messages;

-- 4. Afficher quelques messages (pour voir si RLS bloque)
SELECT 
    id,
    conversation_id,
    sender_id,
    content,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;

