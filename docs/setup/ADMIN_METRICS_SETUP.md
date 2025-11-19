# Configuration des Métriques Admin

Ce document explique comment configurer les métriques temps réel et la sécurité pour le dashboard admin.

## Métriques Temps Réel

### Cloudflare

Pour activer les métriques Cloudflare, vous devez configurer les variables d'environnement suivantes :

```env
CLOUDFLARE_API_TOKEN=votre_token_api_cloudflare
CLOUDFLARE_ZONE_ID=votre_zone_id
```

#### Comment obtenir ces valeurs :

1. **API Token** :
   - Allez sur https://dash.cloudflare.com/profile/api-tokens
   - Cliquez sur "Create Token"
   - Utilisez le template "Zone Analytics Read" ou créez un token personnalisé avec les permissions :
     - `Zone:Zone:Read`
     - `Zone:Analytics:Read`
   - Copiez le token généré

2. **Zone ID** :
   - Allez sur https://dash.cloudflare.com
   - Sélectionnez votre domaine
   - Dans la section "Overview", le Zone ID est visible en bas à droite

### Railway

Pour activer les métriques Railway, vous devez configurer les variables d'environnement suivantes :

```env
RAILWAY_API_TOKEN=votre_token_api_railway
RAILWAY_PROJECT_ID=votre_project_id
```

#### Comment obtenir ces valeurs :

1. **API Token** :
   - Allez sur https://railway.app/account/tokens
   - Cliquez sur "New Token"
   - Donnez un nom au token (ex: "Admin Dashboard")
   - Copiez le token généré

2. **Project ID** :
   - Allez sur votre projet Railway
   - L'URL contient le Project ID : `https://railway.app/project/[PROJECT_ID]`
   - Ou allez dans Settings > General > Project ID

## Événements de Sécurité

### Table de base de données

La table `security_events` doit être créée dans Supabase. Exécutez la migration :

```sql
-- Voir: supabase/migrations/012_create_security_events_table.sql
```

### Utilisation du logger

Pour logger des événements de sécurité dans votre code :

```typescript
import { 
  logFailedLogin, 
  logBlockedRequest, 
  logSuspiciousActivity,
  logRateLimitExceeded 
} from '@/lib/security-logger';

// Exemple : Logger une connexion échouée
await logFailedLogin(
  'user@example.com',
  request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
  request.headers.get('user-agent')
);

// Exemple : Logger une requête bloquée
await logBlockedRequest(
  ipAddress,
  userAgent,
  { reason: 'CSRF token invalid', path: request.url }
);
```

### Intégration dans les routes API

Exemple d'intégration dans une route d'authentification :

```typescript
// src/app/api/auth/login/route.ts
import { logFailedLogin } from '@/lib/security-logger';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent');

  // Tentative de connexion
  const user = await authenticateUser(email, password);
  
  if (!user) {
    // Logger la tentative échouée
    await logFailedLogin(email, ipAddress, userAgent);
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }

  // Connexion réussie
  return NextResponse.json({ success: true });
}
```

## Affichage dans le Dashboard

Les métriques sont automatiquement affichées dans le dashboard admin (`/admin`) :

- **Métriques Temps Réel** : Affiche les données de Cloudflare, Railway et du système Node.js
- **Données de Sécurité** : Affiche les statistiques des 24 dernières heures, les top IPs et les derniers événements

Les métriques sont actualisées automatiquement toutes les 30 secondes.

## Notes importantes

- Les métriques Cloudflare et Railway ne s'afficheront que si les variables d'environnement sont configurées
- Si les variables ne sont pas configurées, les sections afficheront "Non configuré"
- Les événements de sécurité sont conservés pendant 90 jours (nettoyage automatique)
- Seuls les admins peuvent voir les événements de sécurité (RLS activé)

