# Guide de Diagnostic des Métriques

Si les métriques Cloudflare ou Railway affichent "Non configuré" malgré la configuration, voici comment diagnostiquer :

## Vérification des logs

1. **Ouvrez votre terminal** où tourne le serveur Next.js
2. **Actualisez le dashboard admin** (`/admin`)
3. **Cherchez les messages** commençant par :
   - `❌ Erreur API Cloudflare:` - pour Cloudflare
   - `❌ Erreur API Railway:` - pour Railway
   - `⚠️ Cloudflare non configuré:` - si les variables manquent
   - `⚠️ Railway non configuré:` - si les variables manquent

## Problèmes courants

### Cloudflare

**Erreur 401 (Unauthorized)** :
- Le token API est invalide ou expiré
- Vérifiez que le token a les permissions `Zone:Zone:Read` et `Zone:Analytics:Read`
- Régénérez le token si nécessaire

**Erreur 403 (Forbidden)** :
- Le token n'a pas les bonnes permissions
- Vérifiez les permissions du token dans Cloudflare Dashboard

**Erreur 404 (Not Found)** :
- Le Zone ID est incorrect
- Vérifiez le Zone ID dans Cloudflare Dashboard > Overview

**Erreur de réseau** :
- Vérifiez votre connexion internet
- Vérifiez que l'API Cloudflare est accessible depuis votre serveur

### Railway

**Erreur 401 (Unauthorized)** :
- Le token API est invalide ou expiré
- Régénérez le token dans Railway Dashboard > Account > Tokens

**Erreur 404 (Not Found)** :
- Le Project ID est incorrect
- Vérifiez le Project ID dans l'URL de votre projet Railway

**"Aucun service trouvé"** :
- Le projet Railway n'a pas de services déployés
- Déployez au moins un service dans votre projet Railway

## Test manuel des APIs

### Test Cloudflare

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/VOTRE_ZONE_ID" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

Si cela fonctionne, vous devriez recevoir les informations de votre zone.

### Test Railway

```bash
curl -X GET "https://api.railway.app/v1/projects/VOTRE_PROJECT_ID" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

Si cela fonctionne, vous devriez recevoir les informations de votre projet.

## Solutions

1. **Vérifiez les variables d'environnement** :
   - Assurez-vous que les variables sont bien définies dans votre `.env`
   - Redémarrez le serveur Next.js après modification du `.env`

2. **Vérifiez les permissions** :
   - Cloudflare : Le token doit avoir les permissions de lecture sur les zones et analytics
   - Railway : Le token doit avoir accès au projet

3. **Vérifiez les IDs** :
   - Cloudflare Zone ID : Dans Cloudflare Dashboard > Overview (en bas à droite)
   - Railway Project ID : Dans l'URL de votre projet Railway

4. **Vérifiez les logs du terminal** :
   - Les erreurs détaillées sont affichées dans la console
   - Copiez les messages d'erreur pour un diagnostic plus précis




