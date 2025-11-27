-- ============================================
-- Script de Validation des Optimisations (Version Supabase)
-- ============================================
-- Ce script valide que toutes les optimisations
-- RLS et Performance ont été correctement appliquées
-- Version compatible avec l'éditeur SQL de Supabase
-- ============================================

-- ============================================
-- PARTIE 1: VÉRIFICATION DES POLICIES RLS
-- ============================================

-- Vérifier que RLS est activé sur toutes les tables critiques
SELECT 
    '=== 1. VÉRIFICATION DES POLICIES RLS ===' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
ORDER BY tablename;

-- Vérification des policies sur users
SELECT 
    'Policies sur users' as info,
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- Vérification des policies sur professionals
SELECT 
    'Policies sur professionals' as info,
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'professionals'
ORDER BY policyname;

-- Vérification des policies sur location_preferences
SELECT 
    'Policies sur location_preferences' as info,
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'location_preferences'
ORDER BY policyname;

-- Vérification des policies sur establishments
SELECT 
    'Policies sur establishments' as info,
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'establishments'
ORDER BY policyname;

-- ============================================
-- PARTIE 2: VÉRIFICATION DES INDEX
-- ============================================

-- Index sur users
SELECT 
    'Index sur users' as info,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'users'
    AND indexname LIKE 'idx_users%'
ORDER BY indexname;

-- Index sur professionals
SELECT 
    'Index sur professionals' as info,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'professionals'
    AND indexname LIKE 'idx_professionals%'
ORDER BY indexname;

-- Index sur location_preferences
SELECT 
    'Index sur location_preferences' as info,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'location_preferences'
    AND indexname LIKE 'idx_location_preferences%'
ORDER BY indexname;

-- Index sur establishments (les plus critiques)
SELECT 
    'Index sur establishments' as info,
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

-- Requête 1: Recherche d'établissements par status et owner_id
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, status, created_at
FROM establishments
WHERE status = 'approved' AND owner_id = '00000000-0000-0000-0000-000000000000'::uuid
ORDER BY created_at DESC
LIMIT 20;

-- Requête 2: Recherche géographique d'établissements
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
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, description
FROM establishments
WHERE status = 'approved'
    AND (name ILIKE '%restaurant%' OR description ILIKE '%restaurant%')
ORDER BY created_at DESC
LIMIT 20;

-- Requête 4: Recherche par ville et statut
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, slug, city, status
FROM establishments
WHERE city = 'Paris' AND status = 'approved'
ORDER BY created_at DESC
LIMIT 20;

-- Requête 5: Récupération des préférences de localisation
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, user_id, city_id, city_name, search_radius
FROM location_preferences
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Requête 6: Recherche de professionnel par email
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, email, first_name, last_name, company_name
FROM professionals
WHERE LOWER(email) = LOWER('test@example.com');

-- Requête 7: Recherche d'utilisateur par email
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, email, first_name, last_name, role
FROM users
WHERE LOWER(email) = LOWER('test@example.com');

-- Requête 8: Liste des établissements avec relations (requête complexe)
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

-- Vérifier que les fonctions existent
SELECT 
    'Fonctions optimisées' as info,
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN ('get_user_establishments', 'search_establishments_optimized')
ORDER BY proname;

-- ============================================
-- PARTIE 5: STATISTIQUES DES INDEX
-- ============================================

-- Taille et utilisation des index
SELECT 
    'Statistiques des index' as info,
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
    AND relname IN ('users', 'professionals', 'location_preferences', 'establishments')
ORDER BY relname, indexrelname;

-- ============================================
-- PARTIE 6: VÉRIFICATION DES EXTENSIONS
-- ============================================

-- Vérifier que pg_trgm est installé
SELECT 
    'Extensions installées' as info,
    extname,
    extversion
FROM pg_extension
WHERE extname = 'pg_trgm';

-- ============================================
-- PARTIE 7: RÉSUMÉ ET RECOMMANDATIONS
-- ============================================

-- Compter le nombre de policies RLS
SELECT 
    'Résumé' as section,
    'Policies RLS créées' as metric,
    COUNT(*)::text as value
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments');

-- Compter le nombre d'index créés
SELECT 
    'Résumé' as section,
    'Index créés' as metric,
    COUNT(*)::text as value
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
    AND indexname LIKE 'idx_%';

-- Vérifier les tables sans index optimisés
SELECT 
    'Résumé' as section,
    'Tables sans index optimisés' as metric,
    COALESCE(string_agg(tablename, ', '), 'Aucune') as value
FROM pg_tables t
WHERE schemaname = 'public'
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
    AND NOT EXISTS (
        SELECT 1 
        FROM pg_indexes i 
        WHERE i.tablename = t.tablename 
        AND i.indexname LIKE 'idx_%'
    );

-- ============================================
-- NOTES DE VALIDATION
-- ============================================
-- 
-- Vérifiez que:
-- 1. Toutes les tables ont RLS activé (rowsecurity = true)
-- 2. Tous les index sont créés (au moins 20 index)
-- 3. Les EXPLAIN ANALYZE montrent l'utilisation des index (pas de "Seq Scan")
-- 4. Les temps d'exécution sont < 500ms
-- 5. Pas de scan séquentiel sur les grandes tables
--

