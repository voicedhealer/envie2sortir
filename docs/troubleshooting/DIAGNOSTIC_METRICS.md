# Guide de Diagnostic des Métriques

## Problèmes Identifiés

### 1. Cloudflare - Erreur 403 "Authentication error"

**Symptôme :**
```
❌ Erreur API Cloudflare (analytics): 403 {
  success: false,
  errors: [ { code: 10000, message: 'Authentication error' } ]
}
```

**Cause :** Le token API Cloudflare n'a pas les permissions nécessaires pour accéder aux analytics.

**Solution :**

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Cliquez sur "Create Token"
3. Utilisez le template "Edit zone DNS" ou créez un token personnalisé avec ces permissions :
   - **Zone** → **Zone** → **Read**
   - **Zone** → **Analytics** → **Read**
   - **Account** → **Zone** → **Read**
4. Assurez-vous que le token a accès à la zone spécifique (votre Zone ID)
5. Copiez le token complet (commence par `...`)
6. Mettez à jour `.env` :
   ```
   CLOUDFLARE_API_TOKEN=votre_token_complet
   CLOUDFLARE_ZONE_ID=votre_zone_id
   ```
7. **Redémarrez le serveur Next.js**

### 2. Railway - Erreur 404 "Project not found"

**Symptôme :**
```
❌ Erreur API Railway (project): 404 { errors: [] }
💡 Le Project ID Railway est incorrect ou le projet n'existe pas
```

**Causes possibles :**
1. Le Project ID est incorrect ou mal formaté
2. Le token n'a pas accès à ce projet
3. Le projet n'existe plus

**Solution :**

#### Étape 1 : Vérifier le Project ID

1. Allez sur [Railway Dashboard](https://railway.app/dashboard)
2. Ouvrez votre projet
3. L'URL devrait ressembler à : `https://railway.app/project/732fe205-469c-4297-84e0-6ffa45e04589`
4. Le Project ID est la partie après `/project/` : `732fe205-469c-4297-84e0-6ffa45e04589`
5. **Important :** Utilisez l'UUID complet avec les tirets

#### Étape 2 : Vérifier le Token API

1. Allez sur [Railway API Tokens](https://railway.app/account/tokens)
2. Créez un nouveau token si nécessaire
3. Le token doit commencer par `railway_` et être très long
4. **Important :** Copiez le token complet, pas seulement les premiers caractères

#### Étape 3 : Vérifier les Permissions

Le token doit avoir accès au projet. Si vous avez créé le token récemment, assurez-vous qu'il a les bonnes permissions.

#### Étape 4 : Mettre à jour `.env`

```env
RAILWAY_API_TOKEN=railway_votre_token_complet_ici
RAILWAY_PROJECT_ID=732fe205-469c-4297-84e0-6ffa45e04589
```

**Important :**
- Pas d'espaces autour du `=`
- Pas de guillemets autour des valeurs
- Le Project ID doit être l'UUID complet avec les tirets

#### Étape 5 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## Test des Métriques

### Méthode 1 : Page de Test (Recommandée)

1. Ouvrez dans votre navigateur :
   ```
   http://localhost:3000/admin/test-metrics
   ```
2. Cliquez sur "Lancer le test"
3. La page affichera :
   - ✅ Si Cloudflare fonctionne ou ❌ l'erreur exacte
   - ✅ Si Railway fonctionne ou ❌ l'erreur exacte
   - Les détails de chaque erreur

### Méthode 2 : API de Test

Ouvrez dans votre navigateur ou avec curl :
```bash
curl http://localhost:3000/api/admin/test-metrics
```

### Méthode 3 : Vérifier les Logs du Terminal

Après avoir actualisé le dashboard admin (`/admin`), regardez les logs dans votre terminal :

**Pour Cloudflare :**
- `✅ Zone Cloudflare trouvée:` → OK
- `❌ Erreur API Cloudflare (analytics): 403` → Token sans permissions analytics
- `❌ Erreur API Cloudflare (zone check): 401` → Token invalide

**Pour Railway :**
- `✅ Projet Railway trouvé:` → OK
- `❌ Erreur API Railway (project): 404` → Project ID incorrect
- `❌ Erreur API Railway (auth check): 401` → Token invalide
- `💡 Project ID utilisé:` → Affiche le Project ID utilisé

## Vérification des Variables d'Environnement

Pour vérifier que les variables sont bien chargées (sans afficher les valeurs complètes) :

```bash
# Vérifier Cloudflare
grep -E "CLOUDFLARE_(API_TOKEN|ZONE_ID)" .env | sed 's/=.*/=***/'

# Vérifier Railway
grep -E "RAILWAY_(API_TOKEN|PROJECT_ID)" .env | sed 's/=.*/=***/'
```

## Erreurs Courantes

### "Variables d'environnement manquantes"
→ Vérifiez que les variables sont bien dans `.env` et que le serveur a été redémarré.

### "Token invalide" (401)
→ Le token est incorrect ou expiré. Créez un nouveau token.

### "Project ID incorrect" (404)
→ Vérifiez que le Project ID correspond bien à l'UUID du projet dans Railway.

### "Permissions insuffisantes" (403)
→ Pour Cloudflare : Ajoutez la permission "Zone:Analytics:Read" au token.
→ Pour Railway : Vérifiez que le token a accès au projet.

## Support

Si les problèmes persistent après avoir suivi ce guide :
1. Utilisez la page `/admin/test-metrics` pour obtenir les détails exacts
2. Copiez les messages d'erreur complets du terminal
3. Vérifiez que les tokens et IDs sont corrects dans `.env`




