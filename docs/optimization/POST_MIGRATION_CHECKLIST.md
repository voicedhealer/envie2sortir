# Checklist Post-Migration

## ✅ Vérifications Immédiates

### 1. Vérifier que la migration s'est bien passée

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments');
```

**Résultat attendu :** Toutes les tables doivent avoir `rowsecurity = true`

---

### 2. Vérifier que les index sont créés

```sql
-- Compter les nouveaux index
SELECT COUNT(*) as new_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
  AND indexname LIKE 'idx_%';
```

**Résultat attendu :** Au moins 20 index créés

---

### 3. Vérifier que les policies RLS sont créées

```sql
-- Compter les policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
GROUP BY tablename;
```

**Résultat attendu :** Au moins 3-4 policies par table (SELECT, INSERT, UPDATE, DELETE)

---

### 4. Tester une requête optimisée

```sql
-- Test de performance : Recherche d'établissements
EXPLAIN ANALYZE
SELECT id, name, slug, status, created_at
FROM establishments
WHERE status = 'approved' AND owner_id = '00000000-0000-0000-0000-000000000000'::uuid
ORDER BY created_at DESC
LIMIT 20;
```

**Vérifier :**
- ✅ Utilise l'index `idx_establishments_status_owner`
- ✅ Pas de "Seq Scan"
- ✅ Temps d'exécution < 500ms

---

## 🔧 Actions Recommandées

### 1. Exécuter VACUUM ANALYZE

```sql
-- Optimiser les statistiques pour le planificateur de requêtes
VACUUM ANALYZE users;
VACUUM ANALYZE professionals;
VACUUM ANALYZE location_preferences;
VACUUM ANALYZE establishments;
```

**Temps estimé :** 5-15 minutes selon la taille de la base

---

### 2. Exécuter le script de validation complet

```bash
psql $DATABASE_URL -f scripts/validate-optimization.sql
```

**Vérifier :**
- ✅ Tous les index sont créés
- ✅ Les EXPLAIN ANALYZE montrent l'utilisation des index
- ✅ Pas d'erreurs dans les logs

---

### 3. Tester les requêtes critiques de l'application

Tester manuellement :
- ✅ Recherche d'établissements
- ✅ Recherche géographique
- ✅ Recherche textuelle
- ✅ Lecture des préférences utilisateur
- ✅ Mise à jour de profil

**Vérifier :** Les temps de réponse sont améliorés

---

## 📊 Monitoring Initial (24 premières heures)

### Métriques à surveiller

1. **Temps d'exécution des requêtes**
   ```sql
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   WHERE mean_exec_time > 500
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Utilisation des index**
   ```sql
   SELECT indexname, idx_scan, idx_tup_read
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
     AND tablename IN ('users', 'professionals', 'location_preferences', 'establishments')
   ORDER BY idx_scan DESC;
   ```

3. **Scans séquentiels**
   ```sql
   SELECT relname, seq_scan, idx_scan,
          CASE WHEN seq_scan + idx_scan > 0 
               THEN ROUND(100.0 * seq_scan / (seq_scan + idx_scan), 2)
               ELSE 0 
          END as seq_scan_percentage
   FROM pg_stat_user_tables
   WHERE schemaname = 'public'
     AND relname IN ('users', 'professionals', 'location_preferences', 'establishments');
   ```

**Objectif :** `seq_scan_percentage < 10%`

---

## ⚠️ Problèmes Potentiels

### Si les performances ne s'améliorent pas

1. **Vérifier que les index sont utilisés**
   ```sql
   EXPLAIN ANALYZE [votre requête];
   ```
   - Si "Seq Scan" apparaît, l'index n'est pas utilisé
   - Vérifier que les conditions WHERE correspondent aux index

2. **Vérifier les statistiques**
   ```sql
   SELECT schemaname, tablename, last_analyze, last_autoanalyze
   FROM pg_stat_user_tables
   WHERE schemaname = 'public';
   ```
   - Si `last_analyze` est ancien, exécuter `ANALYZE`

3. **Vérifier la taille des index**
   ```sql
   SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid)) as size
   FROM pg_indexes
   WHERE schemaname = 'public'
   ORDER BY pg_relation_size(indexrelid) DESC;
   ```

---

## ✅ Checklist Complète

### Immédiatement après la migration

- [ ] Migration appliquée sans erreur
- [ ] RLS activé sur les 4 tables
- [ ] Index créés (vérification visuelle)
- [ ] Policies RLS créées
- [ ] Test d'une requête optimisée (EXPLAIN ANALYZE)

### Dans les 30 minutes

- [ ] VACUUM ANALYZE exécuté
- [ ] Script de validation exécuté
- [ ] Pas d'erreurs dans les logs
- [ ] Test des requêtes critiques de l'application

### Dans les 24 heures

- [ ] Monitoring des performances activé
- [ ] Vérification de l'utilisation des index
- [ ] Détection des requêtes lentes résiduelles
- [ ] Pas d'augmentation des erreurs

### Après 1 semaine

- [ ] Analyse des tendances de performance
- [ ] Identification des index non utilisés
- [ ] Optimisations supplémentaires si nécessaire
- [ ] Documentation des résultats

---

## 📞 En cas de problème

1. **Consulter les logs** : Vérifier les erreurs dans les logs Supabase/PostgreSQL
2. **Exécuter le script de validation** : `scripts/validate-optimization.sql`
3. **Consulter la documentation** : `docs/optimization/`
4. **Rollback si nécessaire** : Restaurer le backup créé avant la migration

---

## 🎉 Résultats Attendus

Après la migration, vous devriez observer :

- ✅ **85% de réduction** du temps d'exécution en moyenne
- ✅ **Temps < 500ms** pour 95% des requêtes
- ✅ **Utilisation des index** > 80%
- ✅ **Scans séquentiels** < 10%

---

**Dernière mise à jour :** 2025-01-XX

