Voici le prompt complet et détaillé pour Cursor afin de régler définitivement ce problème de cookies en environnement de développement.

***

**Prompt pour Cursor :**

```markdown
## TÂCHE : Corriger la persistance de session Supabase en local (Problème de Cookies)

### Contexte
L'authentification Admin fonctionne côté API (login réussi, tokens générés), mais la session est immédiatement perdue côté client. Les logs montrent `No session found` juste après le login.
Le problème est identifié comme un refus du navigateur de stocker/renvoyer les cookies d'authentification (`sb-xxx-auth-token`) en raison d'une configuration `Secure/SameSite` trop stricte pour l'environnement `localhost`.

### Objectif
Modifier la configuration du client Supabase et du Middleware pour forcer des options de cookies permissives (`Secure: false`) lorsque l'application tourne en développement (`NODE_ENV !== 'production'`).

### Actions requises

#### 1. Modifier le client Supabase côté Navigateur
**Fichier cible :** `lib/supabase/client.ts` (ou le fichier qui exporte `createBrowserClient`)

Mettre à jour la création du client pour conditionner l'option `secure` :

```
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // IMPORTANT : Désactiver Secure en dev pour que les cookies soient acceptés sur http://localhost
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    }
  )
}
```

#### 2. Modifier le Middleware Next.js
**Fichier cible :** `middleware.ts`

Mettre à jour les méthodes `set` et `remove` des cookies pour forcer `secure: false` en développement :

```
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Création de la réponse initiale
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Force secure: false en développement
          const isProduction = process.env.NODE_ENV === 'production'
          const cookieOptions = { ...options, secure: isProduction, sameSite: 'lax' as const }

          request.cookies.set({ name, value, ...cookieOptions })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...cookieOptions })
        },
        remove(name: string, options: CookieOptions) {
          // Force secure: false en développement
          const isProduction = process.env.NODE_ENV === 'production'
          const cookieOptions = { ...options, secure: isProduction, sameSite: 'lax' as const }

          request.cookies.set({ name, value: '', ...cookieOptions })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...cookieOptions })
        },
      },
    }
  )

  // Rafraîchir la session pour s'assurer que le cookie est bien seté/prolongé
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques et les images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### 3. Vérification de l'API de Login
**Fichier cible :** `app/api/auth/login/route.ts` (ou équivalent)

Vérifier que lors du `set-cookie` manuel (si présent), l'option `secure` est bien conditionnée :

```
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: false, // Peut être false pour permettre l'accès JS si nécessaire en dev
  maxAge: 60 * 60 * 24 * 7, // 1 semaine
  secure: process.env.NODE_ENV === 'production', // CRITIQUE
}
```

### Instruction finale pour moi (l'utilisateur)
Une fois le code appliqué, rappelle-moi de :
1. Arrêter le serveur.
2. Vider entièrement les cookies de `localhost` dans le navigateur.
3. Relancer `npm run dev`.
```