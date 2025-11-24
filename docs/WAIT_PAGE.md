# Page d'Attente - Mode Wait

## Description

La page d'attente permet de bloquer l'accès au site pour les utilisateurs pendant que le site est en développement ou en maintenance. Elle affiche un compte à rebours jusqu'au 1er janvier 2026 et permet de collecter des emails pour la newsletter et des demandes de renseignements pour les professionnels.

## Activation du Mode Wait

Pour activer la page d'attente, ajoutez l'une de ces variables d'environnement dans votre fichier `.env.local` :

```env
# Option 1: Variable publique (accessible côté client)
NEXT_PUBLIC_WAIT_MODE=true

# Option 2: Variable serveur uniquement
WAIT_MODE=true
```

Pour désactiver le mode wait, supprimez la variable ou mettez-la à `false` :

```env
NEXT_PUBLIC_WAIT_MODE=false
# ou
WAIT_MODE=false
```

## Fonctionnalités

### 1. Compte à Rebours
- Affiche le temps restant jusqu'au 1er janvier 2026
- Format : Jours, Heures, Minutes, Secondes
- Mise à jour en temps réel

### 2. Newsletter
- Formulaire d'inscription pour les futurs utilisateurs
- Utilise l'API existante `/api/newsletter/subscribe`
- Stockage dans la table `users` avec `newsletter_opt_in = true`

### 3. Formulaire Professionnel
- Modal avec formulaire pour les professionnels
- Champs : Prénom, Nom, Nom de l'établissement, Ville, Description
- API : `/api/wait/professional-inquiry`
- ⚠️ **Important** : Vous devez créer une table `professional_inquiries` dans Supabase pour stocker ces demandes

### 4. Générateur d'Envie
- Simule une barre de recherche avec des réponses préfaites
- Réponses génériques et positives
- Pas d'appel API réel (simulation)

## Routes Autorisées en Mode Wait

Même en mode wait activé, ces routes restent accessibles :

- `/wait` - La page d'attente elle-même
- `/api/newsletter/*` - API newsletter
- `/api/wait/*` - API pour la page d'attente
- `/_next/*` - Assets Next.js
- `/favicon.*` - Favicon
- `/robots.txt` - Robots.txt
- `/sitemap.*` - Sitemap
- Assets statiques (images, CSS, JS, etc.)

Toutes les autres routes sont automatiquement redirigées vers `/wait`.

## Création de la Table Professional Inquiries

Pour que le formulaire professionnel fonctionne complètement, créez cette table dans Supabase :

```sql
CREATE TABLE IF NOT EXISTS professional_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  establishment_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_professional_inquiries_created_at ON professional_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_professional_inquiries_city ON professional_inquiries(city);
```

Puis modifiez le fichier `/src/app/api/wait/professional-inquiry/route.ts` pour décommenter le code d'insertion dans la base de données.

## Personnalisation

### Couleurs
Les couleurs utilisées sont définies dans les composants :
- Orange : `#ff751f`
- Pink : `#ff1fa9`
- Red : `#ff3a3a`

### Date de Lancement
Pour changer la date de lancement, modifiez le fichier `/src/app/wait/components/Countdown.tsx` :

```typescript
const targetDate = new Date("2026-01-01T00:00:00").getTime();
```

### Réponses du Générateur d'Envie
Modifiez le tableau `genericResponses` dans `/src/app/wait/components/AiVision.tsx` pour personnaliser les réponses.

## Désactivation Temporaire pour les Admins

Si vous souhaitez permettre l'accès aux admins même en mode wait, vous pouvez modifier le middleware pour ajouter une exception :

```typescript
// Dans src/middleware.ts
if (WAIT_MODE_ENABLED) {
  // Vérifier si l'utilisateur est admin
  const session = await getSession();
  if (session?.user?.role === 'admin') {
    // Laisser passer les admins
    return supabaseResponse;
  }
  // ... reste du code de redirection
}
```

## Tests

Pour tester la page d'attente :

1. Activez le mode wait dans `.env.local`
2. Redémarrez le serveur de développement
3. Visitez n'importe quelle route du site (sauf `/wait`)
4. Vous devriez être redirigé vers `/wait`
5. Testez les formulaires (newsletter et professionnel)

## Dépannage

### La redirection ne fonctionne pas
- Vérifiez que la variable d'environnement est bien définie
- Redémarrez le serveur après avoir modifié `.env.local`
- Vérifiez les logs du middleware dans la console

### Le formulaire professionnel ne fonctionne pas
- Vérifiez que la table `professional_inquiries` existe dans Supabase
- Vérifiez les logs de l'API dans la console
- Assurez-vous que les permissions RLS sont correctement configurées

### Les styles ne s'affichent pas correctement
- Vérifiez que Tailwind CSS est bien configuré
- Assurez-vous que les animations CSS sont bien ajoutées dans `globals.css`

