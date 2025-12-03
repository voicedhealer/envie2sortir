-- Script SQL pour vérifier que les recherches sont bien enregistrées
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les dernières recherches (10 dernières)
SELECT 
  id,
  search_term,
  result_count,
  clicked_establishment_name,
  searched_city,
  timestamp,
  user_agent
FROM search_analytics
ORDER BY timestamp DESC
LIMIT 10;

-- 2. Statistiques globales (30 derniers jours)
SELECT 
  COUNT(*) as total_recherches,
  COUNT(DISTINCT search_term) as termes_uniques,
  COUNT(CASE WHEN clicked_establishment_id IS NOT NULL THEN 1 END) as recherches_avec_clics,
  COUNT(CASE WHEN result_count = 0 THEN 1 END) as recherches_sans_resultats,
  ROUND(
    COUNT(CASE WHEN clicked_establishment_id IS NOT NULL THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as taux_conversion_pourcent
FROM search_analytics
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- 3. Top 10 des termes de recherche
SELECT 
  search_term,
  COUNT(*) as nombre_recherches,
  COUNT(CASE WHEN clicked_establishment_id IS NOT NULL THEN 1 END) as nombre_clics,
  ROUND(
    COUNT(CASE WHEN clicked_establishment_id IS NOT NULL THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as taux_conversion_pourcent,
  AVG(result_count) as moyenne_resultats
FROM search_analytics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY search_term
ORDER BY nombre_recherches DESC
LIMIT 10;

-- 4. Vérifier les recherches récentes (dernières 24h)
SELECT 
  search_term,
  result_count,
  clicked_establishment_name,
  timestamp
FROM search_analytics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

