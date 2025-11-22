-- ============================================
-- Seed Data pour Tests
-- ============================================
-- Ce fichier crée des données de test pour valider
-- la migration vers Supabase
-- ============================================
-- IMPORTANT : Ces données sont uniquement pour les tests
-- Aucune donnée existante n'est migrée
-- ============================================

-- Note: Les utilisateurs Supabase Auth doivent être créés via l'API
-- Ce script crée uniquement les données dans les tables métier

-- ============================================
-- USERS (Exemples)
-- ============================================
-- Note: Les IDs doivent correspondre à des auth.users créés via l'API
-- Pour les tests, créer d'abord les comptes auth, puis utiliser leurs IDs

-- Exemple de structure (à adapter avec de vrais UUIDs d'auth.users)
/*
INSERT INTO users (id, email, first_name, last_name, name, role, karma_points)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'user1@test.com', 'Jean', 'Dupont', 'Jean Dupont', 'user', 10),
  ('00000000-0000-0000-0000-000000000002', 'user2@test.com', 'Marie', 'Martin', 'Marie Martin', 'user', 5),
  ('00000000-0000-0000-0000-000000000003', 'admin@test.com', 'Admin', 'User', 'Admin User', 'admin', 0);
*/

-- ============================================
-- PROFESSIONALS (Exemples)
-- ============================================
/*
INSERT INTO professionals (id, siret, first_name, last_name, email, password_hash, phone, company_name, legal_status, siret_verified)
VALUES
  ('00000000-0000-0000-0000-000000000010', '12345678901234', 'Pierre', 'Durand', 'pro1@test.com', 'hashed_password', '0612345678', 'Restaurant Le Bon Goût', 'SARL', true),
  ('00000000-0000-0000-0000-000000000011', '98765432109876', 'Sophie', 'Bernard', 'pro2@test.com', 'hashed_password', '0698765432', 'Bar La Nuit', 'EURL', true);
*/

-- ============================================
-- ESTABLISHMENTS (Exemples)
-- ============================================
/*
INSERT INTO establishments (
  id, name, slug, description, address, city, postal_code, country,
  latitude, longitude, phone, email, website, status, subscription, owner_id
)
VALUES
  (
    '00000000-0000-0000-0000-000000000100',
    'Restaurant Le Bon Goût',
    'restaurant-le-bon-gout',
    'Un restaurant gastronomique au cœur de la ville',
    '10 Rue de la Paix',
    'Paris',
    '75001',
    'France',
    48.8566,
    2.3522,
    '0112345678',
    'contact@bon-gout.fr',
    'https://bon-gout.fr',
    'approved',
    'PREMIUM',
    '00000000-0000-0000-0000-000000000010'
  ),
  (
    '00000000-0000-0000-0000-000000000101',
    'Bar La Nuit',
    'bar-la-nuit',
    'Un bar branché pour vos soirées',
    '25 Avenue des Champs',
    'Lyon',
    '69001',
    'France',
    45.7640,
    4.8357,
    '0145678901',
    'contact@la-nuit.fr',
    'https://la-nuit.fr',
    'approved',
    'FREE',
    '00000000-0000-0000-0000-000000000011'
  );
*/

-- ============================================
-- EVENTS (Exemples)
-- ============================================
/*
INSERT INTO events (id, title, description, establishment_id, start_date, end_date, price, price_unit)
VALUES
  (
    '00000000-0000-0000-0000-000000001000',
    'Soirée Jazz',
    'Une soirée jazz exceptionnelle',
    '00000000-0000-0000-0000-000000000100',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
    25.00,
    'EUR'
  );
*/

-- ============================================
-- COMMENTS (Exemples)
-- ============================================
/*
INSERT INTO user_comments (id, content, rating, user_id, establishment_id)
VALUES
  (
    '00000000-0000-0000-0000-000000010000',
    'Excellent restaurant, je recommande !',
    5,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000100'
  );
*/

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Les UUIDs doivent correspondre à de vrais auth.users
-- 2. Créer d'abord les comptes auth via l'API Supabase
-- 3. Utiliser les IDs retournés pour créer les entrées dans les tables métier
-- 4. Pour les tests, utiliser des UUIDs de test cohérents
-- 5. Les mots de passe doivent être hashés via Supabase Auth, pas directement dans la DB

-- ============================================
-- SCRIPT DE CRÉATION DE COMPTES TEST
-- ============================================
-- Utiliser l'API Supabase pour créer les comptes :
/*
const { data, error } = await supabase.auth.admin.createUser({
  email: 'user1@test.com',
  password: 'Test1234!',
  email_confirm: true,
  user_metadata: {
    role: 'user',
    userType: 'user',
    firstName: 'Jean',
    lastName: 'Dupont'
  }
});
// Utiliser data.user.id pour créer l'entrée dans users
*/

