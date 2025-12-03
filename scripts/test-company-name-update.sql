-- Script de test pour vérifier la mise à jour du nom d'entreprise
-- Ce script permet de :
-- 1. Vérifier la relation entre professionals et establishments
-- 2. Tester la mise à jour du nom dans les deux tables

-- Étape 1 : Trouver le professionnel avec le nom d'entreprise modifié
SELECT 
    p.id as professional_id,
    p.company_name as professional_company_name,
    p.first_name,
    p.last_name,
    p.email,
    e.id as establishment_id,
    e.name as establishment_name,
    e.owner_id
FROM professionals p
LEFT JOIN establishments e ON e.owner_id = p.id
WHERE p.company_name LIKE '%BATTLEKART%'
   OR p.company_name LIKE '%ASSIREM%'
ORDER BY p.updated_at DESC
LIMIT 5;

-- Étape 2 : Vérifier les demandes de modification récentes
SELECT 
    pur.id,
    pur.field_name,
    pur.old_value,
    pur.new_value,
    pur.status,
    pur.requested_at,
    pur.reviewed_at,
    pur.professional_id,
    p.company_name as current_professional_company_name,
    e.name as current_establishment_name
FROM professional_update_requests pur
JOIN professionals p ON p.id = pur.professional_id
LEFT JOIN establishments e ON e.owner_id = pur.professional_id
WHERE pur.field_name = 'companyName'
  AND pur.status = 'approved'
ORDER BY pur.reviewed_at DESC
LIMIT 5;

-- Étape 3 : Test de mise à jour (à exécuter manuellement si nécessaire)
-- ATTENTION : Ne pas exécuter automatiquement, juste pour référence
/*
-- Trouver l'ID du professionnel
DO $$
DECLARE
    v_professional_id UUID;
    v_establishment_id UUID;
    v_new_name TEXT := 'ASSIREM KART DR (BATTLEKART QUETIGNY)';
BEGIN
    -- Trouver le professionnel
    SELECT id INTO v_professional_id
    FROM professionals
    WHERE company_name LIKE '%BATTLEKART%'
    LIMIT 1;
    
    IF v_professional_id IS NULL THEN
        RAISE NOTICE 'Aucun professionnel trouvé';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Professional ID trouvé: %', v_professional_id;
    
    -- Trouver l'établissement
    SELECT id INTO v_establishment_id
    FROM establishments
    WHERE owner_id = v_professional_id;
    
    IF v_establishment_id IS NULL THEN
        RAISE NOTICE 'Aucun établissement trouvé pour ce professionnel';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Establishment ID trouvé: %', v_establishment_id;
    
    -- Mettre à jour le professionnel
    UPDATE professionals
    SET company_name = v_new_name
    WHERE id = v_professional_id;
    
    RAISE NOTICE 'Professional mis à jour';
    
    -- Mettre à jour l'établissement
    UPDATE establishments
    SET name = v_new_name
    WHERE id = v_establishment_id;
    
    RAISE NOTICE 'Establishment mis à jour';
    
    -- Vérifier le résultat
    SELECT 
        p.company_name,
        e.name
    INTO 
        v_new_name,
        v_new_name
    FROM professionals p
    JOIN establishments e ON e.owner_id = p.id
    WHERE p.id = v_professional_id;
    
    RAISE NOTICE 'Vérification - Professional: %, Establishment: %', 
        (SELECT company_name FROM professionals WHERE id = v_professional_id),
        (SELECT name FROM establishments WHERE id = v_establishment_id);
END $$;
*/

