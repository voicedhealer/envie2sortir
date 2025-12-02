-- ============================================
-- Script pour lister toutes les colonnes de la table establishments
-- ============================================

-- Méthode 1 : Utiliser information_schema (PostgreSQL standard)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'establishments'
ORDER BY ordinal_position;

-- Méthode 2 : Description détaillée de la table
SELECT 
    column_name AS "Nom de la colonne",
    data_type AS "Type de données",
    character_maximum_length AS "Longueur max",
    is_nullable AS "Nullable",
    column_default AS "Valeur par défaut"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'establishments'
ORDER BY ordinal_position;

-- Méthode 3 : Voir aussi la table etablissement_tags
SELECT 
    column_name AS "Nom de la colonne",
    data_type AS "Type de données",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'etablissement_tags'
ORDER BY ordinal_position;

-- Méthode 4 : Voir un exemple d'établissement avec ses tags
SELECT 
    e.id,
    e.name,
    e."envieTags" AS "Envie Tags (dans establishments)",
    COUNT(et.id) AS "Nombre de tags dans etablissement_tags"
FROM establishments e
LEFT JOIN etablissement_tags et ON et."etablissement_id" = e.id
GROUP BY e.id, e.name, e."envieTags"
LIMIT 5;

