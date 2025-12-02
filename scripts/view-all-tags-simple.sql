-- ============================================
-- VOIR TOUS LES TAGS D'UN ÉTABLISSEMENT
-- ============================================

-- Remplacez cet ID par l'ID de votre établissement
-- (vous pouvez le trouver dans la table establishments)
SELECT 
    'Tags dans etablissement_tags' AS "Source",
    tag AS "Tag",
    "type_tag" AS "Type",
    poids AS "Poids"
FROM etablissement_tags
WHERE "etablissement_id" = '169f5efe-d10b-4f32-b028-89183d521eaa'

UNION ALL

-- Afficher aussi les envieTags depuis establishments
SELECT 
    'Tags dans establishments (envieTags)' AS "Source",
    jsonb_array_elements_text("envieTags") AS "Tag",
    'envie' AS "Type",
    3 AS "Poids"
FROM establishments
WHERE id = '169f5efe-d10b-4f32-b028-89183d521eaa'
  AND "envieTags" IS NOT NULL

ORDER BY "Type", "Tag";


