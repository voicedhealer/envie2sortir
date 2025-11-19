# Configuration des Clés API Supabase

## 🔑 Où Trouver les Clés API Supabase

### 1. Créer un Projet Supabase

1. Aller sur https://supabase.com
2. Se connecter ou créer un compte
3. Cliquer sur "New Project"
4. Remplir les informations :
   - **Name** : envie2sortir (ou autre nom)
   - **Database Password** : Choisir un mot de passe fort
   - **Region** : Choisir la région la plus proche (ex: Europe West)
5. Cliquer sur "Create new project"
6. Attendre 2-3 minutes que le projet soit créé

### 2. Récupérer les Clés API

Une fois le projet créé :

1. Aller dans **Settings** (icône engrenage en bas à gauche)
2. Cliquer sur **API**
3. Vous verrez plusieurs clés :

#### Clés à Utiliser

**NEXT_PUBLIC_SUPABASE_URL**
- Trouvable dans la section "Project URL"
- Format : `https://xxxxxxxxxxxxx.supabase.co`

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Trouvable dans la section "Project API keys"
- C'est la clé "anon" ou "public"
- Format : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ Cette clé est publique et peut être exposée côté client

**SUPABASE_SERVICE_ROLE_KEY** (Optionnel, pour opérations admin)
- Trouvable dans la section "Project API keys"
- C'est la clé "service_role"
- Format : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ **NE JAMAIS** exposer cette clé côté client ! Uniquement côté serveur

## 📝 Configuration dans le Projet

### 1. Créer le Fichier .env.local

```bash
# Dans la racine du projet
cp .env.example .env.local
```

### 2. Ajouter les Clés Supabase

Ouvrir `.env.local` et ajouter :

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
c
# Service Role Key (uniquement pour opérations admin côté serveur)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# PRISMA (GARDÉ POUR DEV/DEMOS)
# ============================================
DATABASE_URL=file:./prisma/dev.db

# ============================================
# NEXTAUTH (GARDÉ POUR COMPATIBILITÉ)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# ============================================
# OAUTH (pour Supabase Auth)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

### 3. Vérifier la Configuration

Les clients Supabase sont déjà configurés pour utiliser ces variables :

- `src/lib/supabase/client.ts` utilise `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/lib/supabase/server.ts` utilise les mêmes variables
- `src/lib/supabase/middleware.ts` utilise les mêmes variables

## 🔒 Sécurité des Clés

### Clés Publiques (Côté Client)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` : Peut être exposée
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Peut être exposée
  - Les RLS policies protègent les données même avec cette clé

### Clés Privées (Côté Serveur Uniquement)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` : **NE JAMAIS** exposer
  - Bypass toutes les RLS policies
  - Accès complet à la base de données
  - Utiliser uniquement dans les API routes serveur
  - Ne jamais mettre dans le code client

## 🧪 Tester la Configuration

### Test Rapide

Créer un fichier de test temporaire :

```typescript
// test-supabase-config.ts (à supprimer après)
import { supabase } from './src/lib/supabase/client';

async function test() {
  console.log('Testing Supabase connection...');
  
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Connection successful!');
  }
}

test();
```

Exécuter :
```bash
npx tsx test-supabase-config.ts
```

## 🔄 Coexistence Prisma + Supabase

### Les Deux Systèmes Peuvent Coexister

**Prisma (SQLite local)** :
- ✅ Reste intact dans `prisma/dev.db`
- ✅ Continue de fonctionner pour vos devs/demos
- ✅ Utilisé par le code existant (non migré)

**Supabase (PostgreSQL cloud)** :
- ✅ Nouveau système pour la migration
- ✅ Utilisé par le nouveau code migré
- ✅ Indépendant de Prisma

### Comment Basculer Entre les Deux

Vous pouvez utiliser une variable d'environnement pour choisir :

```typescript
// src/lib/db.ts
const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

export const db = USE_SUPABASE 
  ? createSupabaseClient() 
  : createPrismaClient();
```

Ou migrer progressivement route par route.

## 📋 Checklist de Configuration

- [ ] Projet Supabase créé
- [ ] Clés API récupérées
- [ ] `.env.local` créé avec les clés
- [ ] Migrations SQL appliquées (via Dashboard ou CLI)
- [ ] Test de connexion réussi
- [ ] Prisma toujours fonctionnel (vérifier avec `npx prisma studio`)

## 🆘 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifier que `.env.local` existe
- Vérifier que les variables commencent par `NEXT_PUBLIC_`
- Redémarrer le serveur de développement (`npm run dev`)

### Erreur "Invalid API key"
- Vérifier que la clé est correctement copiée (pas d'espaces)
- Vérifier que vous utilisez la bonne clé (anon vs service_role)
- Vérifier que le projet Supabase est actif

### Erreur de connexion
- Vérifier que l'URL est correcte
- Vérifier votre connexion internet
- Vérifier que le projet Supabase n'est pas en pause

## 🔗 Ressources

- [Documentation Supabase - Getting Started](https://supabase.com/docs/guides/getting-started)
- [Documentation Supabase - API Keys](https://supabase.com/docs/guides/api/api-keys)

