-- Script simplifié pour corriger la synchronisation du nom d'entreprise
-- Version sans bloc DO pour éviter les problèmes avec l'éditeur SQL de Supabase

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

-- Étape 2 : Vérifier l'état actuel AVANT la correction
SELECT 
    p.id as professional_id,
    p.company_name as professional_company_name,
    e.id as establishment_id,
    e.name as establishment_name,
    e.owner_id,
    CASE 
        WHEN p.company_name = e.name THEN '✅ Synchronisé'
        ELSE '❌ Non synchronisé'
    END as statut_avant
FROM professionals p
LEFT JOIN establishments e ON e.owner_id = p.id
WHERE p.id = 'c93412b9-6941-48fb-8528-4addeb10e641';

-- Étape 3 : Mettre à jour le professionnel avec la nouvelle valeur approuvée
-- Remplacez 'ASSIREM KART DR (BATTLEKART QUETIGNY)' par la valeur réelle de new_value de l'étape 1
UPDATE professionals
SET company_name = (
    SELECT new_value 
    FROM professional_update_requests 
    WHERE professional_id = 'c93412b9-6941-48fb-8528-4addeb10e641'
      AND field_name = 'companyName'
      AND status = 'approved'
    ORDER BY reviewed_at DESC
    LIMIT 1
)
WHERE id = 'c93412b9-6941-48fb-8528-4addeb10e641';

-- Étape 4 : Mettre à jour l'établissement avec la même valeur
UPDATE establishments
SET name = (
    SELECT new_value 
    FROM professional_update_requests 
    WHERE professional_id = 'c93412b9-6941-48fb-8528-4addeb10e641'
      AND field_name = 'companyName'
      AND status = 'approved'
    ORDER BY reviewed_at DESC
    LIMIT 1
)
WHERE owner_id = 'c93412b9-6941-48fb-8528-4addeb10e641';

-- Étape 5 : Vérification finale APRÈS la correction
SELECT 
    p.id as professional_id,
    p.company_name as professional_company_name,
    e.id as establishment_id,
    e.name as establishment_name,
    CASE 
        WHEN p.company_name = e.name THEN '✅ Synchronisé'
        ELSE '❌ Non synchronisé'
    END as statut_apres
FROM professionals p
LEFT JOIN establishments e ON e.owner_id = p.id
WHERE p.id = 'c93412b9-6941-48fb-8528-4addeb10e641';

