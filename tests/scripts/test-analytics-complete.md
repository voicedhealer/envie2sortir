# Guide complet de test et diagnostic Analytics

## Analyse des logs

D'après les logs fournis, voici ce qui se passe :

```
✅ [ClickAnalytics] Données reçues: {totalClicks: 0, topElementsCount: 0, statsByTypeCount: 0, hourlyStatsCount: 24}
```

**Diagnostic** : Les APIs fonctionnent correctement, mais il n'y a **aucune donnée** dans la table `click_analytics` pour cet établissement.

## Solutions

### Solution 1 : Vérifier que le tracking fonctionne

1. **Aller sur la page de détails de l'établissement**
   - URL : `/etablissement/[slug]` ou `/etablissement/[id]`

2. **Ouvrir la console du navigateur** (F12 → Console)

3. **Cliquer sur les boutons** :
   - Itinéraire
   - Consulter le menu
   - Contacter
   - Favoris
   - Partager
   - Laisser un avis

4. **Vérifier les logs** :
   - Vous devriez voir : `📊 [useClickTracking] Envoi tracking:`
   - Puis : `✅ [useClickTracking] Tracking enregistré avec succès`

5. **Vérifier dans l'onglet Network** :
   - Des requêtes POST vers `/api/analytics/track`
   - Status 200 avec `{ success: true }`

### Solution 2 : Insérer des données de test

Utiliser le script de test pour insérer des données :

```bash
# Installer tsx si nécessaire
npm install -g tsx

# Exécuter le script (remplacer par l'ID réel de l'établissement)
npx tsx scripts/test-analytics-tracking.ts 26b61aa6-5b9e-457f-bd8b-be54c179d9fe
```

### Solution 3 : Vérifier les données dans la base

Exécuter les requêtes SQL dans `scripts/check-analytics-data.sql` :

```sql
-- Remplacez 'ESTABLISHMENT_ID' par : 26b61aa6-5b9e-457f-bd8b-be54c179d9fe

-- 1. Vérifier l'abonnement
SELECT id, name, subscription 
FROM establishments 
WHERE id = '26b61aa6-5b9e-457f-bd8b-be54c179d9fe';

-- 2. Compter les clics
SELECT COUNT(*) as total_clicks
FROM click_analytics
WHERE establishment_id = '26b61aa6-5b9e-457f-bd8b-be54c179d9fe';

-- 3. Voir les dernières interactions
SELECT * 
FROM click_analytics
WHERE establishment_id = '26b61aa6-5b9e-457f-bd8b-be54c179d9fe'
ORDER BY timestamp DESC
LIMIT 10;
```

## Checklist de diagnostic

- [ ] L'établissement a un abonnement PREMIUM
- [ ] Des interactions ont été effectuées sur la page de détails
- [ ] Les logs `📊 [useClickTracking]` apparaissent dans la console
- [ ] Les requêtes POST vers `/api/analytics/track` sont envoyées
- [ ] Les requêtes retournent `{ success: true }`
- [ ] Des données existent dans `click_analytics` pour cet établissement

## Problèmes possibles et solutions

### Problème 1 : Aucun log `📊 [useClickTracking]`
**Cause** : Le tracking n'est pas déclenché
**Solution** : Vérifier que les boutons appellent bien `trackClick()`

### Problème 2 : Logs `📊` mais pas de `✅`
**Cause** : L'API POST échoue
**Solution** : Vérifier les logs serveur et les erreurs dans la console Network

### Problème 3 : `✅` mais toujours 0 clics dans le dashboard
**Cause** : Les données ne sont pas dans la bonne période ou l'établissement ID est différent
**Solution** : Vérifier que l'`establishment_id` dans `click_analytics` correspond à celui du dashboard

### Problème 4 : Erreur 403 dans les logs
**Cause** : L'établissement n'est pas PREMIUM
**Solution** : Mettre à jour l'abonnement de l'établissement

## Test rapide

1. Aller sur la page de détails : `/etablissement/la-piece-unique-dijon`
2. Ouvrir la console (F12)
3. Cliquer sur "Itinéraire"
4. Vérifier les logs :
   ```
   📊 [useClickTracking] Envoi tracking: {establishmentId: "...", elementType: "button", ...}
   ✅ [useClickTracking] Tracking enregistré avec succès
   ```
5. Aller dans le dashboard Analytics
6. Vérifier que `totalClicks` est maintenant > 0

## Commandes utiles

### Vérifier les données via Supabase CLI
```bash
supabase db query "SELECT COUNT(*) FROM click_analytics WHERE establishment_id = '26b61aa6-5b9e-457f-bd8b-be54c179d9fe'"
```

### Insérer des données de test
```bash
npx tsx scripts/test-analytics-tracking.ts 26b61aa6-5b9e-457f-bd8b-be54c179d9fe
```

