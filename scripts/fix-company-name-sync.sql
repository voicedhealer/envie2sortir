-- Script pour corriger la synchronisation du nom d'entreprise
-- Basé sur les données réelles trouvées

-- Étape 1 : Vérifier la demande de modification approuvée
SELECT 
    pur.id,
    pur.field_name,
    pur.old_value,
    pur.new_value,
    pur.status,
    pur.reviewed_at,
    pur.professional_id
FROM professional_update_requests pur
WHERE pur.professional_id = 'c93412b9-6941-48fb-8528-4addeb10e641'
  AND pur.field_name = 'companyName'
  AND pur.status = 'approved'
ORDER BY pur.reviewed_at DESC
LIMIT 1;

-- Étape 2 : Vérifier l'état actuel
SELECT 
    p.id as professional_id,
    p.company_name as professional_company_name,
    e.id as establishment_id,
    e.name as establishment_name,
    e.owner_id
FROM professionals p
LEFT JOIN establishments e ON e.owner_id = p.id
WHERE p.id = 'c93412b9-6941-48fb-8528-4addeb10e641';

-- Étape 3 : Récupérer la nouvelle valeur approuvée
DO $$
DECLARE
    v_new_value TEXT;
BEGIN
    SELECT new_value INTO v_new_value
    FROM professional_update_requests 
    WHERE professional_id = 'c93412b9-6941-48fb-8528-4addeb10e641'
      AND field_name = 'companyName'
      AND status = 'approved'
    ORDER BY reviewed_at DESC
    LIMIT 1;
    
    IF v_new_value IS NULL THEN
        RAISE NOTICE 'Aucune demande approuvée trouvée. Vérifiez manuellement.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Nouvelle valeur à appliquer: %', v_new_value;
    
    -- Étape 4 : Mettre à jour le professionnel
    UPDATE professionals
    SET company_name = v_new_value
    WHERE id = 'c93412b9-6941-48fb-8528-4addeb10e641';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Professionnel mis à jour';
    ELSE
        RAISE NOTICE '⚠️ Aucun professionnel mis à jour';
    END IF;
    
    -- Étape 5 : Mettre à jour l'établissement
    UPDATE establishments
    SET name = v_new_value
    WHERE owner_id = 'c93412b9-6941-48fb-8528-4addeb10e641';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Établissement mis à jour';
    ELSE
        RAISE NOTICE '⚠️ Aucun établissement mis à jour';
    END IF;
END $$;

-- Étape 5 : Vérification finale
SELECT 
    p.id as professional_id,
    p.company_name as professional_company_name,
    e.id as establishment_id,
    e.name as establishment_name,
    CASE 
        WHEN p.company_name = e.name THEN '✅ Synchronisé'
        ELSE '❌ Non synchronisé'
    END as statut
FROM professionals p
LEFT JOIN establishments e ON e.owner_id = p.id
WHERE p.id = 'c93412b9-6941-48fb-8528-4addeb10e641';

