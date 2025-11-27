# Recommandations de Monitoring - Optimisations RLS et Performance

## 📊 Vue d'ensemble

Ce document fournit des recommandations pour surveiller les performances de la base de données après l'application des optimisations.

---

## 🎯 Objectifs du Monitoring

1. **Vérifier l'efficacité des optimisations**
2. **Détecter les requêtes lentes résiduelles**
3. **Identifier les problèmes de performance avant qu'ils n'affectent les utilisateurs**
4. **Optimiser les index en fonction de l'utilisation réelle**

---

## 📈 Métriques à Surveiller

### 1. Temps d'exécution des requêtes

#### Seuils d'alerte recommandés

| Type de requête | Seuil d'alerte | Seuil critique |
|----------------|----------------|----------------|
| Recherche d'établissements | > 300ms | > 1s |
| Recherche géographique | > 500ms | > 2s |
| Recherche textuelle | > 200ms | > 1s |
| Lecture préférences | > 100ms | > 500ms |
| Mise à jour profil | > 200ms | > 1s |
| Requêtes avec JOIN | > 500ms | > 2s |

#### Requêtes SQL de monitoring

```sql
-- Requêtes les plus lentes (top 10)
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Note :** Nécessite l'extension `pg_stat_statements` :
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

### 2. Utilisation des index

#### Vérification de l'utilisation des index

```sql
-- Index jamais utilisés (candidats à la suppression)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Action :** Si un index n'est jamais utilisé et prend beaucoup d'espace, considérer sa suppression.

---

#### Index les plus utilisés

```sql
-- Index les plus utilisés
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC
LIMIT 20;
```

---

### 3. Scan séquentiel vs Index Scan

#### Détecter les scans séquentiels

```sql
-- Tables avec beaucoup de scans séquentiels
SELECT 
    schemaname,
    relname as table_name,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN ROUND(100.0 * seq_scan / (seq_scan + idx_scan), 2)
        ELSE 0 
    END as seq_scan_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND relname IN ('users', 'professionals', 'location_preferences', 'establishments')
ORDER BY seq_scan DESC;
```

**Alerte :** Si `seq_scan_percentage > 10%`, vérifier qu'il n'y a pas de requêtes qui contournent les index.

---

### 4. Taille des index

#### Surveillance de la croissance des index

```sql
-- Taille des index par table
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    ROUND(100.0 * pg_relation_size(indexrelid) / 
        NULLIF(pg_relation_size(schemaname||'.'||tablename), 0), 2) as index_to_table_ratio
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Alerte :** Si `index_to_table_ratio > 200%`, considérer optimiser les index ou la structure des données.

---

## 🔍 Requêtes à Surveiller Régulièrement

### Requête 1: Recherche d'établissements par status + owner

```sql
-- À surveiller : doit utiliser idx_establishments_status_owner
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, slug, status, created_at
FROM establishments
WHERE status = 'approved' AND owner_id = $1
ORDER BY created_at DESC
LIMIT 20;
```

**Vérifier :**
- ✅ Utilise `idx_establishments_status_owner`
- ✅ Pas de scan séquentiel
- ✅ Temps < 300ms

---

### Requête 2: Recherche géographique

```sql
-- À surveiller : doit utiliser idx_establishments_geo_approved
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, slug, city, latitude, longitude
FROM establishments
WHERE status = 'approved' 
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
    AND latitude BETWEEN $1 AND $2
    AND longitude BETWEEN $3 AND $4
ORDER BY created_at DESC
LIMIT 20;
```

**Vérifier :**
- ✅ Utilise `idx_establishments_geo_approved`
- ✅ Pas de scan séquentiel
- ✅ Temps < 500ms

---

### Requête 3: Recherche textuelle

```sql
-- À surveiller : doit utiliser idx_establishments_name_trgm
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, slug, description
FROM establishments
WHERE status = 'approved'
    AND (name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
ORDER BY created_at DESC
LIMIT 20;
```

**Vérifier :**
- ✅ Utilise les index trigram (`idx_establishments_name_trgm`, `idx_establishments_description_trgm`)
- ✅ Pas de scan séquentiel
- ✅ Temps < 200ms

---

### Requête 4: Récupération des préférences de localisation

```sql
-- À surveiller : doit utiliser idx_location_preferences_user_id
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, user_id, city_id, city_name, search_radius
FROM location_preferences
WHERE user_id = $1;
```

**Vérifier :**
- ✅ Utilise `idx_location_preferences_user_id`
- ✅ Pas de scan séquentiel
- ✅ Temps < 100ms

---

## 🚨 Seuils d'Alerte de Performance

### Niveau 1: Avertissement (Monitoring)

| Métrique | Seuil |
|----------|-------|
| Temps moyen d'exécution | > 300ms |
| Scan séquentiel | > 5% des requêtes |
| Index non utilisés | > 3 index |
| Taille des index | > 150% de la taille de la table |

**Action :** Enregistrer et analyser, pas d'action immédiate nécessaire.

---

### Niveau 2: Alerte (Investigation)

| Métrique | Seuil |
|----------|-------|
| Temps moyen d'exécution | > 500ms |
| Scan séquentiel | > 10% des requêtes |
| Requêtes lentes | > 5 requêtes > 1s |
| Index non utilisés | > 5 index |

**Action :** Investiguer les causes, planifier des optimisations.

---

### Niveau 3: Critique (Action immédiate)

| Métrique | Seuil |
|----------|-------|
| Temps moyen d'exécution | > 1s |
| Scan séquentiel | > 20% des requêtes |
| Requêtes lentes | > 10 requêtes > 2s |
| Timeout de requêtes | > 1% des requêtes |

**Action :** Action immédiate, possible rollback ou optimisation d'urgence.

---

## 📅 Plan de Monitoring Recommandé

### Quotidien (Automatisé)

1. **Vérification des requêtes lentes**
   - Exécuter la requête de monitoring des requêtes lentes
   - Alerter si > 5 requêtes > 1s

2. **Vérification des scans séquentiels**
   - Exécuter la requête de détection des scans séquentiels
   - Alerter si > 10% de scans séquentiels

---

### Hebdomadaire (Manuel)

1. **Analyse de l'utilisation des index**
   - Identifier les index non utilisés
   - Décider de leur suppression ou optimisation

2. **Vérification de la taille des index**
   - Surveiller la croissance
   - Planifier un VACUUM si nécessaire

3. **Review des EXPLAIN ANALYZE**
   - Vérifier que les requêtes critiques utilisent les index
   - Identifier les nouvelles requêtes lentes

---

### Mensuel (Maintenance)

1. **VACUUM et ANALYZE**
   ```sql
   VACUUM ANALYZE users;
   VACUUM ANALYZE professionals;
   VACUUM ANALYZE location_preferences;
   VACUUM ANALYZE establishments;
   ```

2. **Réindexation si nécessaire**
   ```sql
   REINDEX TABLE establishments;
   ```

3. **Review complète des performances**
   - Analyser les tendances sur 30 jours
   - Identifier les optimisations supplémentaires

---

## 🛠️ Outils de Monitoring

### 1. pg_stat_statements

Extension PostgreSQL pour suivre les statistiques d'exécution des requêtes.

**Installation :**
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

**Configuration (postgresql.conf) :**
```
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

---

### 2. Dashboard Supabase

Si vous utilisez Supabase, le dashboard fournit :
- Métriques de performance en temps réel
- Graphiques d'utilisation des ressources
- Alertes automatiques

---

### 3. Monitoring externe

**Outils recommandés :**
- **Datadog** : Monitoring complet avec alertes
- **New Relic** : APM avec analyse des requêtes SQL
- **Grafana + Prometheus** : Monitoring open-source

---

## 📝 Checklist de Validation Post-Migration

### Immédiatement après la migration

- [ ] Toutes les policies RLS sont actives
- [ ] Tous les index sont créés
- [ ] Les EXPLAIN ANALYZE montrent l'utilisation des index
- [ ] Pas de scan séquentiel sur les grandes tables
- [ ] Temps d'exécution < 500ms pour 95% des requêtes

### Après 24h

- [ ] Pas d'augmentation des erreurs
- [ ] Temps de réponse améliorés
- [ ] Pas de requêtes lentes inattendues
- [ ] Les index sont utilisés correctement

### Après 1 semaine

- [ ] Analyse des tendances de performance
- [ ] Identification des index non utilisés
- [ ] Optimisations supplémentaires si nécessaire

---

## 🔧 Scripts de Monitoring Automatisés

### Script 1: Vérification quotidienne

```bash
#!/bin/bash
# check-db-performance.sh

psql $DATABASE_URL <<EOF
-- Vérifier les requêtes lentes
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 500
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF
```

### Script 2: Rapport hebdomadaire

```bash
#!/bin/bash
# weekly-db-report.sh

psql $DATABASE_URL <<EOF
-- Rapport complet
\echo '=== RAPPORT HEBDOMADAIRE ==='
\echo ''
\echo 'Requêtes les plus lentes:'
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''
\echo 'Index non utilisés:'
SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
EOF
```

---

## 📞 Support et Escalade

### En cas de problème de performance

1. **Niveau 1** : Vérifier les métriques de base
2. **Niveau 2** : Analyser les EXPLAIN ANALYZE
3. **Niveau 3** : Contacter l'équipe de développement
4. **Niveau 4** : Escalade vers l'équipe DevOps/DBA

---

## 📚 Ressources Complémentaires

- [Documentation PostgreSQL - Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase - Performance Best Practices](https://supabase.com/docs/guides/database/performance)
- [pg_stat_statements Documentation](https://www.postgresql.org/docs/current/pgstatstatements.html)

---

**Dernière mise à jour :** 2025-01-XX

