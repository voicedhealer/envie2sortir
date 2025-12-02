-- ============================================
-- COMMENT VOIR LES TAGS DANS SUPABASE
-- ============================================

-- ============================================
-- 1. Voir les tags "Envie de..." dans la table establishments
-- ============================================
-- Les tags "Envie de..." sont stockés dans la colonne "envieTags" (JSONB)
SELECT 
    id,
    name,
    "envieTags" AS "Tags Envie (JSONB)"
FROM establishments
WHERE "envieTags" IS NOT NULL
LIMIT 10;

-- ============================================
-- 2. Voir TOUS les tags dans la table etablissement_tags
-- ============================================
-- Tous les tags (normaux + envieTags) sont dans cette table séparée
SELECT 
    id,
    "etablissement_id" AS "ID Établissement",
    tag AS "Tag",
    "type_tag" AS "Type",
    poids AS "Poids",
    "createdAt" AS "Date création"
FROM etablissement_tags
ORDER BY "createdAt" DESC
LIMIT 20;

-- ============================================
-- 3. Voir les tags d'un établissement spécifique (remplacez l'ID)
-- ============================================
-- Remplacez '169f5efe-d10b-4f32-b028-89183d521eaa' par l'ID de votre établissement
SELECT 
    e.id AS "ID Établissement",
    e.name AS "Nom",
    e."envieTags" AS "Envie Tags (dans establishments)",
    et.tag AS "Tag",
    et."type_tag" AS "Type",
    et.poids AS "Poids"
FROM establishments e
LEFT JOIN etablissement_tags et ON et."etablissement_id" = e.id
WHERE e.id = '169f5efe-d10b-4f32-b028-89183d521eaa'
ORDER BY et."type_tag", et.tag;

-- ============================================
-- 4. Voir tous les établissements avec le nombre de tags
-- ============================================
SELECT 
    e.id,
    e.name,
    e."envieTags" AS "Envie Tags (JSONB dans establishments)",
    COUNT(et.id) AS "Nombre de tags dans etablissement_tags",
    STRING_AGG(et.tag, ', ') AS "Liste des tags"
FROM establishments e
LEFT JOIN etablissement_tags et ON et."etablissement_id" = e.id
GROUP BY e.id, e.name, e."envieTags"
HAVING COUNT(et.id) > 0 OR e."envieTags" IS NOT NULL
ORDER BY COUNT(et.id) DESC
LIMIT 10;

-- ============================================
-- 5. Voir la structure exacte des colonnes
-- ============================================
-- Colonnes de la table establishments
SELECT 
    column_name AS "Colonne",
    data_type AS "Type",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'establishments'
  AND column_name LIKE '%tag%' OR column_name LIKE '%Tag%'
ORDER BY ordinal_position;

-- Colonnes de la table etablissement_tags
SELECT 
    column_name AS "Colonne",
    data_type AS "Type",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'etablissement_tags'
ORDER BY ordinal_position;


