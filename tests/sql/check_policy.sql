-- Vérifier la politique RLS actuelle sur messages
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
ORDER BY policyname;

