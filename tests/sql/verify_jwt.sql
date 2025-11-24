-- Vérifier que les app_metadata contiennent bien le rôle admin
SELECT 
    au.id,
    au.email,
    au.raw_app_meta_data,
    au.raw_app_meta_data->>'role' as jwt_role,
    u.role as table_role
FROM auth.users au
LEFT JOIN users u ON u.id::uuid = au.id
WHERE u.role = 'admin'
ORDER BY au.created_at DESC;

