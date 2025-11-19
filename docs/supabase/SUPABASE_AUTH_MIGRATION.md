# Migration Authentification vers Supabase Auth

## 🔄 Changements Principaux

### Avant (NextAuth + Prisma)
- Authentification via NextAuth avec Credentials, Google, Facebook
- Stockage des sessions dans JWT
- Mots de passe hashés avec bcrypt dans la base de données
- Deux tables séparées : `users` et `professionals`

### Après (Supabase Auth)
- Authentification via Supabase Auth
- Sessions gérées par Supabase
- Mots de passe hashés automatiquement par Supabase
- Utilisation de `auth.users` de Supabase + tables métier (`users`, `professionals`)

## 🔐 Architecture Supabase Auth

### Tables Supabase
- `auth.users` : Table système Supabase (gérée automatiquement)
- `users` : Table métier pour les utilisateurs simples
- `professionals` : Table métier pour les professionnels

### Relation entre auth.users et tables métier

**Option 1 : Utiliser auth.users.id directement**
- `users.id` = `auth.users.id`
- `professionals.id` = `auth.users.id`
- Avantage : Pas de jointure nécessaire
- Inconvénient : Deux comptes auth.users possibles (user et professional)

**Option 2 : Lien via user_id**
- `users.user_id` = `auth.users.id` (FK)
- `professionals.user_id` = `auth.users.id` (FK)
- Avantage : Un seul compte auth.users par email
- Inconvénient : Jointure nécessaire

**Recommandation** : Option 1 pour simplifier, mais gérer le cas où un email peut être à la fois user et professional.

## 📋 Migration des Rôles

### Mapping des Rôles

**Supabase Auth** utilise des `user_metadata` et `app_metadata` :
- `user_metadata` : Données accessibles au client (role, userType, etc.)
- `app_metadata` : Données accessibles uniquement côté serveur (role admin)

### Structure user_metadata
```json
{
  "role": "user" | "admin" | "professional",
  "userType": "user" | "professional",
  "establishmentId": "uuid" (si professional),
  "siret": "string" (si professional)
}
```

### Structure app_metadata
```json
{
  "role": "admin" (si admin)
}
```

## 🔄 Migration des Utilisateurs Existants

### Processus

1. **Créer un compte Supabase Auth**
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: user.email,
     password: 'temporary-password', // Générer un mot de passe temporaire
     options: {
       data: {
         role: user.role,
         userType: 'user',
         firstName: user.firstName,
         lastName: user.lastName
       }
     }
   });
   ```

2. **Créer l'entrée dans la table users**
   ```typescript
   await supabase
     .from('users')
     .insert({
       id: data.user.id, // Utiliser l'ID de auth.users
       email: user.email,
       // ... autres champs
     });
   ```

3. **Envoyer un email de réinitialisation de mot de passe**
   ```typescript
   await supabase.auth.resetPasswordForEmail(user.email, {
     redirectTo: 'https://envie2sortir.fr/auth/reset-password'
   });
   ```

## 🔧 Configuration OAuth

### Google OAuth

1. **Dans Supabase Dashboard** :
   - Aller dans Authentication > Providers
   - Activer Google
   - Ajouter Client ID et Secret

2. **Dans le code** :
   ```typescript
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: 'https://envie2sortir.fr/auth/callback'
     }
   });
   ```

### Facebook OAuth

Similaire à Google :
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'facebook',
  options: {
    redirectTo: 'https://envie2sortir.fr/auth/callback'
  }
});
```

## 📝 Nouveaux Endpoints Auth

### Inscription Utilisateur
```typescript
// POST /api/auth/signup
export async function POST(request: NextRequest) {
  const { email, password, firstName, lastName } = await request.json();
  
  // 1. Créer le compte Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'user',
        userType: 'user',
        firstName,
        lastName
      }
    }
  });
  
  if (authError) throw authError;
  
  // 2. Créer l'entrée dans users
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'user'
    });
  
  if (userError) throw userError;
  
  return NextResponse.json({ success: true });
}
```

### Connexion
```typescript
// POST /api/auth/signin
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  // Récupérer les infos utilisateur depuis la table métier
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  return NextResponse.json({ user: userData });
}
```

### Inscription Professionnel
```typescript
// POST /api/auth/signup-professional
export async function POST(request: NextRequest) {
  const { email, password, firstName, lastName, siret, companyName, phone, legalStatus } = await request.json();
  
  // 1. Créer le compte Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'professional',
        userType: 'professional',
        firstName,
        lastName,
        siret,
        companyName
      }
    }
  });
  
  if (authError) throw authError;
  
  // 2. Créer l'entrée dans professionals
  const { error: professionalError } = await supabase
    .from('professionals')
    .insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      siret,
      company_name: companyName,
      phone,
      legal_status: legalStatus
    });
  
  if (professionalError) throw professionalError;
  
  return NextResponse.json({ success: true });
}
```

## 🔄 Migration du Middleware

### Avant (NextAuth)
```typescript
export default withAuth(async function middleware(req) {
  // ...
});
```

### Après (Supabase)
```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

## 🧪 Tests d'Authentification

### Scénarios à Tester

1. **Inscription utilisateur** : Email/password
2. **Inscription professionnel** : Email/password + SIRET
3. **Connexion utilisateur** : Email/password
4. **Connexion professionnel** : Email/password
5. **OAuth Google** : Connexion via Google
6. **OAuth Facebook** : Connexion via Facebook
7. **Déconnexion** : Session supprimée
8. **Réinitialisation mot de passe** : Email envoyé
9. **Changement mot de passe** : Mise à jour réussie
10. **Vérification email** : Email de confirmation

## 📝 Notes Importantes

1. **Migration progressive** : Garder NextAuth en parallèle pendant la transition
2. **Sessions** : Les sessions Supabase sont gérées via cookies HTTP-only
3. **Sécurité** : Supabase gère automatiquement le refresh token
4. **RLS** : Les policies RLS utilisent `auth.uid()` pour identifier l'utilisateur
5. **Dual accounts** : Gérer le cas où un email peut être user ET professional

## 🔄 Fonction Helper pour Récupérer l'Utilisateur

```typescript
// src/lib/supabase/auth-helpers.ts
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Vérifier si c'est un user ou un professional
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (userData) {
    return { ...userData, userType: 'user' };
  }
  
  const { data: professionalData } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (professionalData) {
    return { ...professionalData, userType: 'professional' };
  }
  
  return null;
}
```

