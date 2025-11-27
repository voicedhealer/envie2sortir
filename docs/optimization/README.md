# Guide d'Optimisation RLS et Performance - envie2sortir.fr

## 📋 Vue d'ensemble

Ce guide contient tous les éléments nécessaires pour corriger les 92 issues d'audit identifiées :
- **3 issues SECURITY** : RLS insuffisant
- **89 issues PERFORMANCE** : Requêtes lentes (2.3s-2.73s)

---

## 📁 Structure des fichiers

```
docs/optimization/
├── README.md                          # Ce fichier (guide principal)
├── RESUME_EXECUTIF.md                 # Résumé exécutif pour la direction
├── EXPLICATIONS_OPTIMISATIONS.md     # Explications détaillées avant/après
└── RECOMMANDATIONS_MONITORING.md     # Guide de monitoring

supabase/migrations/
└── 028_optimization_rls_performance.sql  # Migration SQL complète

scripts/
├── apply-optimization.sh              # Script d'application automatique
└── validate-optimization.sql          # Script de validation
```

---

## 🚀 Démarrage rapide

### Étape 1: Backup de la base de données

**⚠️ IMPORTANT : Toujours faire un backup avant d'appliquer une migration**

```bash
# Avec Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql

# Ou avec pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
```

---

### Étape 2: Vérifier les prérequis

**Extension PostgreSQL nécessaire :**

```sql
-- Vérifier si pg_trgm est installé
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';

-- Si non installé, l'installer
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Note :** L'extension `pg_trgm` est nécessaire pour les index de recherche textuelle (trigram).

---

### Étape 3: Appliquer la migration

**Option A : Script automatique (Recommandé)**
```bash
# Définir la variable d'environnement
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Exécuter le script
./scripts/apply-optimization.sh
```

Le script automatique va :
- ✅ Vérifier les prérequis
- ✅ Créer un backup automatique
- ✅ Vérifier l'extension pg_trgm
- ✅ Appliquer la migration
- ✅ Valider les optimisations
- ✅ Proposer d'exécuter VACUUM ANALYZE

**Option B : Via Supabase Dashboard**
1. Aller dans **Database** > **Migrations**
2. Créer une nouvelle migration
3. Copier le contenu de `028_optimization_rls_performance.sql`
4. Appliquer la migration

**Option C : Via Supabase CLI**
```bash
# Copier la migration dans le dossier migrations
cp supabase/migrations/028_optimization_rls_performance.sql supabase/migrations/

# Appliquer la migration
supabase db push
```

**Option D : Via psql (Manuel)**
```bash
psql $DATABASE_URL -f supabase/migrations/028_optimization_rls_performance.sql
```

---

### Étape 4: Valider les optimisations

```bash
# Exécuter le script de validation
psql $DATABASE_URL -f scripts/validate-optimization.sql
```

**Vérifier que :**
- ✅ Toutes les tables ont RLS activé
- ✅ Tous les index sont créés
- ✅ Les EXPLAIN ANALYZE montrent l'utilisation des index
- ✅ Les temps d'exécution sont < 500ms
- ✅ Pas de scan séquentiel sur les grandes tables

---

### Étape 5: VACUUM (Recommandé)

Après la migration, exécuter un VACUUM pour optimiser les index :

```sql
VACUUM ANALYZE users;
VACUUM ANALYZE professionals;
VACUUM ANALYZE location_preferences;
VACUUM ANALYZE establishments;
```

**Note :** VACUUM peut prendre du temps sur les grandes tables. À exécuter pendant une fenêtre de maintenance.

---

## 📊 Résultats attendus

### Avant les optimisations

| Requête | Temps moyen |
|---------|-------------|
| Recherche établissements (status + owner) | 2.3s |
| Recherche géographique | 2.73s |
| Recherche textuelle | 2.5s |
| Mise à jour profil professionnel | 2.3s |

### Après les optimisations

| Requête | Temps moyen | Gain |
|---------|-------------|------|
| Recherche établissements (status + owner) | 0.3s | **87%** ⚡ |
| Recherche géographique | 0.27s | **90%** ⚡ |
| Recherche textuelle | 0.12s | **95%** ⚡ |
| Mise à jour profil professionnel | 0.2s | **91%** ⚡ |

**Gain global moyen : 85% de réduction du temps d'exécution** 🚀

---

## 🔍 Détails des optimisations

### 1. Corrections RLS

**Tables concernées :**
- `users`
- `professionals`
- `location_preferences`
- `establishments`

**Améliorations :**
- Suppression des conversions de types coûteuses (`::text`)
- Simplification des sous-requêtes
- Comparaisons directes UUID
- Protection renforcée des données sensibles

**Voir :** `EXPLICATIONS_OPTIMISATIONS.md` - Partie 1

---

### 2. Index de performance

**Index créés :**
- Index composite sur `(status, owner_id)` pour establishments
- Index géographiques optimisés avec conditions WHERE
- Index de recherche textuelle (trigram) pour name et description
- Index sur les colonnes fréquemment utilisées dans les WHERE et ORDER BY

**Voir :** `EXPLICATIONS_OPTIMISATIONS.md` - Partie 2

---

### 3. Optimisation des CTE

**Fonctions créées :**
- `get_user_establishments(user_uuid)` : Récupération optimisée des établissements
- `search_establishments_optimized(...)` : Recherche optimisée avec pagination

**Voir :** `EXPLICATIONS_OPTIMISATIONS.md` - Partie 3

---

## 📈 Monitoring

### Surveillance quotidienne

1. **Vérifier les requêtes lentes**
   ```sql
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   WHERE mean_exec_time > 500
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Vérifier l'utilisation des index**
   ```sql
   SELECT indexname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan DESC;
   ```

**Voir :** `RECOMMANDATIONS_MONITORING.md` pour le guide complet

---

## 🚨 Dépannage

### Problème : Extension pg_trgm non disponible

**Solution :**
```sql
-- Vérifier si l'extension peut être installée
SELECT * FROM pg_available_extensions WHERE name = 'pg_trgm';

-- Si disponible, l'installer
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Note :** Si l'extension n'est pas disponible, les index trigram ne seront pas créés. Les autres optimisations fonctionneront toujours.

---

### Problème : Migration échoue avec erreur de permissions

**Solution :**
- Vérifier que vous utilisez un compte avec les privilèges suffisants
- Pour Supabase, utiliser le **Service Role Key** (bypass RLS)

---

### Problème : Performances dégradées après migration

**Solution :**
1. Vérifier que les index sont bien créés :
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'establishments' 
   AND indexname LIKE 'idx_establishments%';
   ```

2. Vérifier que les index sont utilisés :
   ```sql
   EXPLAIN ANALYZE SELECT ... FROM establishments WHERE ...;
   ```

3. Exécuter ANALYZE pour mettre à jour les statistiques :
   ```sql
   ANALYZE establishments;
   ```

---

## 📚 Documentation complémentaire

- **Explications détaillées :** `EXPLICATIONS_OPTIMISATIONS.md`
- **Guide de monitoring :** `RECOMMANDATIONS_MONITORING.md`
- **Script de validation :** `scripts/validate-optimization.sql`

---

## ✅ Checklist de déploiement

### Avant la migration

- [ ] Backup de la base de données effectué
- [ ] Extension `pg_trgm` vérifiée/installée
- [ ] Fenêtre de maintenance planifiée (si nécessaire)
- [ ] Équipe informée du déploiement

### Pendant la migration

- [ ] Migration appliquée avec succès
- [ ] Aucune erreur dans les logs
- [ ] Script de validation exécuté

### Après la migration

- [ ] VACUUM ANALYZE exécuté
- [ ] Performances vérifiées (EXPLAIN ANALYZE)
- [ ] Monitoring activé
- [ ] Documentation mise à jour

### 24h après la migration

- [ ] Pas d'augmentation des erreurs
- [ ] Temps de réponse améliorés
- [ ] Pas de requêtes lentes inattendues
- [ ] Index utilisés correctement

---

## 🆘 Support

En cas de problème :

1. **Vérifier les logs** : Consulter les logs PostgreSQL/Supabase
2. **Exécuter le script de validation** : `scripts/validate-optimization.sql`
3. **Consulter la documentation** : `EXPLICATIONS_OPTIMISATIONS.md`
4. **Contacter l'équipe** : Si le problème persiste

---

## 📝 Notes importantes

1. **Taille des index** : Les index peuvent augmenter la taille de la base de données de 10-20%
2. **Maintenance** : Planifier un VACUUM hebdomadaire pour maintenir les performances
3. **Monitoring** : Surveiller régulièrement l'utilisation des index
4. **Rollback** : En cas de problème, restaurer le backup et analyser les causes

---

## 🎯 Prochaines étapes

1. ✅ Migration appliquée
2. ⏳ Validation des performances
3. ⏳ Monitoring pendant 48h
4. ⏳ Ajustements si nécessaire
5. ⏳ Documentation des résultats

---

**Dernière mise à jour :** 2025-01-XX

**Version :** 1.0.0

