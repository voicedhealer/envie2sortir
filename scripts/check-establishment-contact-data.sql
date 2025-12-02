-- ============================================
-- VÉRIFIER LES DONNÉES DE CONTACT D'UN ÉTABLISSEMENT
-- ============================================

-- Remplacez cet ID par l'ID de votre établissement
-- (vous pouvez le trouver dans la table establishments)
SELECT 
    id,
    name,
    phone AS "Téléphone",
    email AS "Email",
    website AS "Site web",
    instagram AS "Instagram",
    facebook AS "Facebook",
    tiktok AS "TikTok",
    youtube AS "YouTube",
    whatsapp_phone AS "WhatsApp",
    messenger_url AS "Messenger"
FROM establishments
WHERE id = '169f5efe-d10b-4f32-b028-89183d521eaa';

-- Voir aussi les données du propriétaire
SELECT 
    p.id,
    p.first_name AS "Prénom",
    p.last_name AS "Nom",
    p.email AS "Email professionnel",
    p.phone AS "Téléphone professionnel",
    p.company_name AS "Raison sociale",
    p.siret AS "SIRET"
FROM professionals p
INNER JOIN establishments e ON e.owner_id = p.id
WHERE e.id = '169f5efe-d10b-4f32-b028-89183d521eaa';


