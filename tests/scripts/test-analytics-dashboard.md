# Guide de test pour le dashboard Analytics

## Problème identifié
Le dashboard Analytics ne récupère pas les données.

## Corrections apportées

### 1. Logs de débogage ajoutés
- **ClickAnalyticsDashboard** : Logs pour suivre les appels API et les données reçues
- **API /api/analytics/track** : Logs pour suivre les requêtes et les données récupérées
- **DetailedAnalyticsDashboard** : Logs déjà présents

### 2. Amélioration de l'affichage des erreurs
- Messages d'erreur plus détaillés
- Indication claire si l'établissement n'est pas PREMIUM
- Suggestion de vérifier les interactions enregistrées

## Comment tester

### 1. Ouvrir la console du navigateur
- Ouvrir le dashboard professionnel
- Aller dans l'onglet "Analytics"
- Ouvrir la console (F12 → Console)

### 2. Vérifier les logs

Vous devriez voir des logs comme :
```
🔍 [ClickAnalytics] Récupération analytics pour établissement xxx, période 30d
📡 [ClickAnalytics] Réponse API: { ok: true, status: 200, ... }
✅ [ClickAnalytics] Données reçues: { totalClicks: X, ... }
```

### 3. Vérifier les erreurs possibles

#### Erreur 401 - Non authentifié
```
❌ [ClickAnalytics] Erreur API: { error: 'Non authentifié' }
```
**Solution** : Vérifier que vous êtes bien connecté

#### Erreur 403 - Abonnement requis
```
❌ [ClickAnalytics] Erreur API: { error: 'Premium subscription required' }
```
**Solution** : Vérifier que l'établissement a un abonnement PREMIUM

#### Erreur 500 - Erreur serveur
```
❌ [ClickAnalytics] Erreur API: { error: 'Erreur lors de la récupération des analytics' }
```
**Solution** : Vérifier les logs serveur pour plus de détails

### 4. Vérifier les données dans la base

```sql
-- Vérifier que l'établissement est PREMIUM
SELECT id, name, subscription 
FROM establishments 
WHERE id = 'VOTRE_ESTABLISHMENT_ID';

-- Vérifier qu'il y a des données dans click_analytics
SELECT COUNT(*) as total_clicks
FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
  AND timestamp >= NOW() - INTERVAL '30 days';

-- Voir les dernières interactions
SELECT * 
FROM click_analytics 
WHERE establishment_id = 'VOTRE_ESTABLISHMENT_ID'
ORDER BY timestamp DESC
LIMIT 10;
```

### 5. Tester manuellement

1. Aller sur la page de détails de l'établissement
2. Cliquer sur différents boutons (Itinéraire, Menu, Contact, etc.)
3. Vérifier dans la console Network que les requêtes POST sont envoyées à `/api/analytics/track`
4. Retourner au dashboard Analytics
5. Vérifier que les données apparaissent

## Checklist de diagnostic

- [ ] L'établissement a un abonnement PREMIUM
- [ ] L'utilisateur est bien authentifié
- [ ] Des interactions ont été trackées (vérifier dans click_analytics)
- [ ] Les logs apparaissent dans la console du navigateur
- [ ] Les logs apparaissent dans les logs serveur
- [ ] Aucune erreur 401, 403, ou 500
- [ ] Les données sont bien formatées dans la réponse API

## Commandes utiles

### Vérifier les logs serveur
```bash
# Si vous utilisez Next.js en développement
npm run dev
# Les logs apparaîtront dans le terminal
```

### Tester l'API directement
```bash
# Remplacer YOUR_ESTABLISHMENT_ID et votre token
curl -X GET "http://localhost:3000/api/analytics/track?establishmentId=YOUR_ESTABLISHMENT_ID&period=30d" \
  -H "Cookie: your-session-cookie"
```

## Prochaines étapes si le problème persiste

1. Vérifier les logs serveur pour voir les erreurs exactes
2. Vérifier que la table `click_analytics` existe et contient des données
3. Vérifier les politiques RLS sur la table `click_analytics`
4. Vérifier que l'ID de l'établissement est correctement passé au composant

