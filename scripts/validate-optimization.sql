-- ============================================
-- Script de Validation des Optimisations
-- ============================================
-- Ce script valide que toutes les optimisations
-- RLS et Performance ont été correctement appliquées
-- ============================================

-- ============================================
-- PARTIE 1: VÉRIFICATION DES POLICIES RLS
-- ============================================

\echo '========================================'
\echo '1. VÉRIFICATION DES POLICIES RLS'
\echo '========================================'

-- Vérifier que RLS est activé sur toutes les tables critiques
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
ORDER BY tablename;

\echo ''
\echo 'Vérification des policies sur users:'
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

\echo ''
\echo 'Vérification des policies sur professionals:'
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'professionals'
ORDER BY policyname;

\echo ''
\echo 'Vérification des policies sur location_preferences:'
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'location_preferences'
ORDER BY policyname;

\echo ''
\echo 'Vérification des policies sur establishments:'
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'establishments'
ORDER BY policyname;

-- ============================================
-- PARTIE 2: VÉRIFICATION DES INDEX
-- ============================================

\echo ''
\echo '========================================'
\echo '2. VÉRIFICATION DES INDEX CRÉÉS'
\echo '========================================'

-- Vérifier les index sur users
\echo ''
\echo 'Index sur users:'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND indexname LIKE 'idx_users%'
ORDER BY indexname;

-- Vérifier les index sur professionals
\echo ''
\echo 'Index sur professionals:'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'professionals'
    AND indexname LIKE 'idx_professionals%'
ORDER BY indexname;

-- Vérifier les index sur location_preferences
\echo ''
\echo 'Index sur location_preferences:'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'location_preferences'
    AND indexname LIKE 'idx_location_preferences%'
ORDER BY indexname;

-- Vérifier les index sur establishments (les plus critiques)
\echo ''
\echo 'Index sur establishments:'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'establishments'
    AND indexname LIKE 'idx_establishments%'
ORDER BY indexname;

-- ============================================
-- PARTIE 3: EXPLAIN ANALYZE DES REQUÊTES CRITIQUES
-- ============================================

\echo ''
\echo '========================================'
\echo '3. ANALYSE DES PERFORMANCES (EXPLAIN ANALYZE)'
\echo '========================================'

-- Requête 1: Recherche d'établissements par status et owner_id
\echo ''
\echo 'Requête 1: Recherche établissements par status + owner_id'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, status, created_at
FROM establishments
WHERE status = 'approved' AND owner_id = '00000000-0000-0000-0000-000000000000'::uuid
ORDER BY created_at DESC
LIMIT 20;

-- Requête 2: Recherche géographique d'établissements
\echo ''
\echo 'Requête 2: Recherche géographique d''établissements'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, city, latitude, longitude
FROM establishments
WHERE status = 'approved' 
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
    AND latitude BETWEEN 45.0 AND 47.0
    AND longitude BETWEEN 2.0 AND 7.0
ORDER BY created_at DESC
LIMIT 20;

-- Requête 3: Recherche textuelle d'établissements
\echo ''
\echo 'Requête 3: Recherche textuelle d''établissements'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, description
FROM establishments
WHERE status = 'approved'
    AND (name ILIKE '%restaurant%' OR description ILIKE '%restaurant%')
ORDER BY created_at DESC
LIMIT 20;

-- Requête 4: Recherche par ville et statut
\echo ''
\echo 'Requête 4: Recherche par ville et statut'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, city, status
FROM establishments
WHERE city = 'Paris' AND status = 'approved'
ORDER BY created_at DESC
LIMIT 20;

-- Requête 5: Récupération des préférences de localisation
\echo ''
\echo 'Requête 5: Récupération préférences de localisation'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, user_id, city_id, city_name, search_radius
FROM location_preferences
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Requête 6: Recherche de professionnel par email
\echo ''
\echo 'Requête 6: Recherche professionnel par email'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, email, first_name, last_name, company_name
FROM professionals
WHERE LOWER(email) = LOWER('test@example.com');

-- Requête 7: Recherche d'utilisateur par email
\echo ''
\echo 'Requête 7: Recherche utilisateur par email'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, email, first_name, last_name, role
FROM users
WHERE LOWER(email) = LOWER('test@example.com');

-- Requête 8: Liste des établissements avec relations (requête complexe)
\echo ''
\echo 'Requête 8: Liste établissements avec relations'
\echo '----------------------------------------------------------'
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
    e.id,
    e.name,
    e.slug,
    e.status,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT f.id) as favorite_count
FROM establishments e
LEFT JOIN user_comments c ON c.establishment_id = e.id
LEFT JOIN user_favorites f ON f.establishment_id = e.id
WHERE e.status = 'approved'
GROUP BY e.id, e.name, e.slug, e.status
ORDER BY e.created_at DESC
LIMIT 20;

-- ============================================
-- PARTIE 4: VÉRIFICATION DES FONCTIONS
-- ============================================

\echo ''
\echo '========================================'
\echo '4. VÉRIFICATION DES FONCTIONS OPTIMISÉES'
\echo '========================================'

-- Vérifier que les fonctions existent
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN ('get_user_establishments', 'search_establishments_optimized')
ORDER BY proname;

-- ============================================
-- PARTIE 5: STATISTIQUES DES INDEX
-- ============================================

\echo ''
\echo '========================================'
\echo '5. STATISTIQUES DES INDEX'
\echo '========================================'

-- Taille des index sur establishments
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
ORDER BY tablename, indexname;

-- ============================================
-- PARTIE 6: VÉRIFICATION DES EXTENSIONS
-- ============================================

\echo ''
\echo '========================================'
\echo '6. VÉRIFICATION DES EXTENSIONS'
\echo '========================================'

-- Vérifier que pg_trgm est installé (nécessaire pour les index trigram)
SELECT 
    extname,
    extversion
FROM pg_extension
WHERE extname = 'pg_trgm';

-- Si pg_trgm n'est pas installé, afficher un avertissement
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        RAISE WARNING 'Extension pg_trgm non installée. Les index de recherche textuelle ne fonctionneront pas.';
        RAISE WARNING 'Exécuter: CREATE EXTENSION IF NOT EXISTS pg_trgm;';
    END IF;
END $$;

-- ============================================
-- PARTIE 7: RÉSUMÉ ET RECOMMANDATIONS
-- ============================================

\echo ''
\echo '========================================'
\echo '7. RÉSUMÉ ET RECOMMANDATIONS'
\echo '========================================'

-- Compter le nombre de policies RLS
SELECT 
    'Policies RLS créées' as metric,
    COUNT(*)::text as value
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments');

-- Compter le nombre d'index créés
SELECT 
    'Index créés' as metric,
    COUNT(*)::text as value
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
    AND indexname LIKE 'idx_%';

-- Vérifier les tables sans index (avertissement)
SELECT 
    'Tables sans index optimisés' as metric,
    string_agg(tablename, ', ') as value
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
    AND NOT EXISTS (
        SELECT 1 
        FROM pg_indexes i 
        WHERE i.tablename = t.tablename 
        AND i.indexname LIKE 'idx_%'
    );

\echo ''
\echo '========================================'
\echo 'VALIDATION TERMINÉE'
\echo '========================================'
\echo ''
\echo 'Vérifiez que:'
\echo '1. Toutes les tables ont RLS activé'
\echo '2. Tous les index sont créés'
\echo '3. Les EXPLAIN ANALYZE montrent l''utilisation des index'
\echo '4. Les temps d''exécution sont < 500ms'
\echo '5. Pas de scan séquentiel sur les grandes tables'
\echo ''

