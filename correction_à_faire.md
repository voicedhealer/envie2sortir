Tu es un expert en optimisation de base de données PostgreSQL/Supabase.

CONTEXTE :
Je développe envie2sortir.fr sur Supabase et j'ai 92 issues d'audit :
- 3 SECURITY issues (RLS insuffisant sur users, professionals, location_preferences, establishments)
- 89 PERFORMANCE issues (slow queries 2.3s-2.73s avec conversions de types et CTE mal optimisées)

OBJECTIF :
Générer une stratégie complète d'optimisation SQL qui :
1. Corrige les failles de sécurité RLS (Row Level Security)
2. Ajoute les index manquants pour les slow queries
3. Optimise les requêtes CTE problématiques
4. Est production-ready et compatible Supabase

DÉTAILS TECHNIQUES :
- Tables concernées : public.users, public.professionals, public.location_preferences, public.establishments
- Les slow queries utilisent : "with records as ( select c.oid::int8 as id, case ... )"
- Problèmes : conversions de types (::int8), CTE sans index, JOINs mal optimisés
- Temps actuels : 2.34s à 2.73s par requête

LIVRABLE ATTENDU :
1. Fichier migration Supabase (.sql) avec :
   - Policies RLS sécurisées pour chaque table
   - Index nécessaires (col_id, user_id, etc.)
   - ALTER TABLE avec RLS ENABLE
   
2. Explications des optimisations :
   - Avant/après pour chaque modification
   - Impact attendu sur les performances
   
3. Script de validation :
   - EXPLAIN ANALYZE pour chaque requête
   - Tests des policies RLS
   - Vérification des index créés

4. Recommandations de monitoring :
   - Queries à surveiller régulièrement
   - Seuils d'alerte de performance