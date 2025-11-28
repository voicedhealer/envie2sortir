-- Script SQL pour vérifier les données analytics d'un établissement
-- Usage: Remplacez 'ESTABLISHMENT_ID' par l'ID de votre établissement

-- 1. Vérifier l'abonnement de l'établissement
SELECT 
  id,
  name,
  subscription,
  CASE 
    WHEN subscription = 'PREMIUM' THEN '✅ PREMIUM'
    ELSE '❌ ' || subscription
  END as status
FROM establishments
WHERE id = 'ESTABLISHMENT_ID'; -- Remplacez par l'ID réel

-- 2. Compter le total de clics trackés
SELECT 
  COUNT(*) as total_clicks,
  COUNT(DISTINCT user_agent) as unique_visitors,
  MIN(timestamp) as premier_clic,
  MAX(timestamp) as dernier_clic
FROM click_analytics
WHERE establishment_id = 'ESTABLISHMENT_ID'; -- Remplacez par l'ID réel

-- 3. Voir les clics des 30 derniers jours
SELECT 
  element_type,
  element_id,
  element_name,
  COUNT(*) as nombre_clics,
  MAX(timestamp) as dernier_clic
FROM click_analytics
WHERE establishment_id = 'ESTABLISHMENT_ID'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY element_type, element_id, element_name
ORDER BY nombre_clics DESC;

-- 4. Voir les clics par type
SELECT 
  element_type,
  COUNT(*) as total,
  COUNT(DISTINCT element_id) as elements_uniques
FROM click_analytics
WHERE establishment_id = 'ESTABLISHMENT_ID'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY element_type
ORDER BY total DESC;

-- 5. Voir les clics par heure de la journée
SELECT 
  EXTRACT(HOUR FROM timestamp) as heure,
  COUNT(*) as clics
FROM click_analytics
WHERE establishment_id = 'ESTABLISHMENT_ID'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM timestamp)
ORDER BY heure;

-- 6. Voir les dernières interactions
SELECT 
  element_type,
  element_name,
  action,
  timestamp,
  user_agent
FROM click_analytics
WHERE establishment_id = 'ESTABLISHMENT_ID'
ORDER BY timestamp DESC
LIMIT 20;

