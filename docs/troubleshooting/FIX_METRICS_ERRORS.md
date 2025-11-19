# Résolution des Erreurs de Métriques

## Erreur Cloudflare : "Unable to authenticate request" (400)

### Problème
Le token API Cloudflare n'est pas valide ou n'a pas les bonnes permissions.

### Solutions

1. **Vérifier le type de token** :
   - Cloudflare utilise deux types d'authentification :
     - **API Token** (recommandé) : Utilise `Authorization: Bearer <token>`
     - **Global API Key** : Utilise `X-Auth-Email` + `X-Auth-Key`

2. **Si vous utilisez un API Token** :
   - Allez sur https://dash.cloudflare.com/profile/api-tokens
   - Vérifiez que le token existe et n'est pas expiré
   - Vérifiez les permissions :
     - `Zone:Zone:Read`
     - `Zone:Analytics:Read`
   - Si nécessaire, créez un nouveau token avec ces permissions

3. **Si vous utilisez une Global API Key** :
   - Le code actuel utilise `Bearer` token
   - Vous devez utiliser un **API Token** au lieu d'une Global API Key
   - Ou modifier le code pour utiliser `X-Auth-Email` + `X-Auth-Key`

4. **Vérifier le Zone ID** :
   - Allez sur https://dash.cloudflare.com
   - Sélectionnez votre domaine
   - Le Zone ID est visible dans "Overview" (en bas à droite)
   - Assurez-vous que c'est le bon Zone ID

### Test manuel

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/VOTRE_ZONE_ID" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

Si cela retourne une erreur 401, le token est invalide.

## Erreur Railway : 404 Not Found

### Problème
Le Project ID est incorrect ou le projet n'existe pas.

### Solutions

1. **Vérifier le Project ID** :
   - Allez sur https://railway.app
   - Ouvrez votre projet
   - L'URL contient le Project ID : `https://railway.app/project/[PROJECT_ID]`
   - Ou allez dans Settings > General > Project ID

2. **Vérifier que le token a accès au projet** :
   - Allez sur https://railway.app/account/tokens
   - Vérifiez que le token existe et n'est pas expiré
   - Le token doit avoir accès au projet

3. **Vérifier que le projet a des services** :
   - Le projet Railway doit avoir au moins un service déployé
   - Les métriques sont récupérées depuis les services du projet

### Test manuel

```bash
curl -X GET "https://api.railway.app/v1/projects/VOTRE_PROJECT_ID" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

Si cela retourne une erreur 404, le Project ID est incorrect.

## Actions à effectuer

1. **Pour Cloudflare** :
   - Créez un nouveau **API Token** (pas une Global API Key)
   - Permissions : `Zone:Zone:Read` et `Zone:Analytics:Read`
   - Mettez à jour `CLOUDFLARE_API_TOKEN` dans votre `.env`
   - Vérifiez que `CLOUDFLARE_ZONE_ID` est correct

2. **Pour Railway** :
   - Vérifiez le Project ID dans l'URL de votre projet Railway
   - Mettez à jour `RAILWAY_PROJECT_ID` dans votre `.env` si nécessaire
   - Vérifiez que le token Railway a accès au projet
   - Assurez-vous qu'au moins un service est déployé dans le projet

3. **Redémarrer le serveur** :
   - Après modification du `.env`, redémarrez votre serveur Next.js
   - Les variables d'environnement sont chargées au démarrage

4. **Vérifier les logs** :
   - Après redémarrage, actualisez le dashboard admin
   - Vérifiez les nouveaux messages dans le terminal
   - Les erreurs devraient être plus détaillées maintenant




