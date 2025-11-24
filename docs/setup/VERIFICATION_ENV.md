# Vérification des Variables d'Environnement

## Problème : Variables non chargées

Si vous avez ajouté les variables dans `.env` mais que Next.js ne les charge pas, voici les solutions :

### Solution 1 : Redémarrer le serveur (OBLIGATOIRE)

Next.js charge les variables d'environnement **uniquement au démarrage**. Après avoir modifié `.env`, vous **DEVEZ** redémarrer le serveur :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### Solution 2 : Utiliser .env.local (Recommandé)

Next.js charge les fichiers dans cet ordre (du plus prioritaire au moins prioritaire) :
1. `.env.local` (toujours chargé, sauf en test)
2. `.env.development` (en mode dev)
3. `.env.production` (en mode production)
4. `.env` (toujours chargé)

**Recommandation** : Créez un fichier `.env.local` avec vos variables :

```bash
# Copier .env vers .env.local
cp .env .env.local
```

### Solution 3 : Vérifier que les variables sont bien chargées

Créez une route de test temporaire pour vérifier :

```typescript
// src/app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
  });
}
```

Puis visitez `http://localhost:3001/api/test-env` pour vérifier.

### Important : Variables côté serveur

Les variables **sans** le préfixe `NEXT_PUBLIC_` (comme `SUPABASE_SERVICE_ROLE_KEY`) sont **uniquement** accessibles côté serveur (API routes, Server Components, etc.).

Elles ne sont **jamais** exposées au client, ce qui est important pour la sécurité.

### Format des variables

Assurez-vous que vos variables sont bien formatées dans `.env` :

```env
# ✅ Correct
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."

# ❌ Incorrect (sans guillemets si la valeur contient des caractères spéciaux)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
```

### Dépannage

1. **Vérifier que le fichier existe** :
   ```bash
   ls -la | grep .env
   ```

2. **Vérifier le contenu** :
   ```bash
   grep SUPABASE .env
   ```

3. **Redémarrer le serveur** :
   ```bash
   # Arrêter (Ctrl+C) puis
   npm run dev
   ```

4. **Vérifier les logs au démarrage** : Next.js affiche parfois des warnings si des variables sont manquantes.





