-- ============================================
-- Migration : Création d'un utilisateur admin
-- ============================================
-- Ce script crée un utilisateur admin dans la table users
-- 
-- INSTRUCTIONS :
-- 1. Créez d'abord un compte dans Supabase Auth via l'interface d'authentification
--    (Table Editor > Authentication > Users > Add user)
-- 2. Notez l'ID de l'utilisateur créé (UUID)
-- 3. Exécutez ce script en remplaçant :
--    - 'VOTRE_EMAIL@exemple.com' par votre email
--    - 'VOTRE_UUID_AUTH' par l'UUID de l'utilisateur créé dans Supabase Auth
--    - 'Votre Prénom' et 'Votre Nom' par vos informations
--    - 'VOTRE_HASH_MOT_DE_PASSE' par le hash bcrypt de votre mot de passe (optionnel si vous utilisez Supabase Auth)
--
-- OU utilisez la version simplifiée ci-dessous qui crée directement un utilisateur
-- ============================================

-- Option 1 : Si vous avez déjà créé l'utilisateur dans Supabase Auth
-- Remplacez les valeurs ci-dessous par vos informations
/*
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    name,
    role,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'VOTRE_UUID_AUTH',  -- UUID de l'utilisateur créé dans Supabase Auth
    'VOTRE_EMAIL@exemple.com',
    'Votre Prénom',
    'Votre Nom',
    'Votre Prénom Votre Nom',
    'admin',
    true,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';
*/

-- Option 2 : Créer un utilisateur admin directement (nécessite un hash de mot de passe)
-- Pour générer un hash bcrypt, utilisez : https://bcrypt-generator.com/ ou Node.js
-- Exemple avec Node.js : const bcrypt = require('bcryptjs'); bcrypt.hash('votre_mot_de_passe', 12)
/*
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    name,
    role,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'admin@envie2sortir.com',
    'VOTRE_HASH_MOT_DE_PASSE',  -- Hash bcrypt de votre mot de passe
    'Admin',
    'Envie2Sortir',
    'Admin Envie2Sortir',
    'admin',
    true,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';
*/

-- Option 3 : Mettre à jour un utilisateur existant en admin
-- Remplacez 'VOTRE_EMAIL@exemple.com' par l'email de votre compte
UPDATE users 
SET role = 'admin', 
    is_verified = true,
    updated_at = now()
WHERE email = 'VOTRE_EMAIL@exemple.com';

-- Vérifier que l'utilisateur a bien le rôle admin
SELECT id, email, first_name, last_name, role, is_verified 
FROM users 
WHERE role = 'admin';

