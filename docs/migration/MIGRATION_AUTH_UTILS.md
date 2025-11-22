# Migration auth-utils.ts vers Supabase Auth

**Date** : 13 novembre 2025  
**Statut** : ✅ Complété

---

## 🎯 Objectif

Migrer `src/lib/auth-utils.ts` de NextAuth/Prisma vers Supabase Auth tout en maintenant la compatibilité avec l'ancienne API.

---

## ✅ Changements Effectués

### 1. Suppression des Dépendances NextAuth et Prisma

**Avant** :
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
```

**Après** :
```typescript
import { 
  getCurrentUser as getCurrentUserSupabase,
  requireEstablishment as requireEstablishmentSupabase,
  isProfessional as isProfessionalSupabase,
  isAdmin as isAdminSupabase
} from "@/lib/supabase/helpers";
```

### 2. Migration des Fonctions

Toutes les fonctions utilisent maintenant les helpers Supabase en interne :

#### `getCurrentUser()`
- ✅ Utilise `getCurrentUserSupabase()` de `@/lib/supabase/helpers`
- ✅ Convertit le format Supabase vers le format attendu par l'ancienne API
- ✅ Le paramètre `request` est ignoré (Supabase gère les sessions via cookies)

#### `requireAuth()`
- ✅ Utilise `getCurrentUser()` migré
- ✅ Lance une erreur si l'utilisateur n'est pas authentifié

#### `requireProfessional()`
- ✅ Utilise `isProfessionalSupabase()` pour vérifier le rôle
- ✅ Utilise `getCurrentUser()` pour récupérer l'utilisateur

#### `requireEstablishment()`
- ✅ Utilise `requireEstablishmentSupabase()` directement
- ✅ Convertit le format Supabase vers l'ancien format

#### `createAuthResponse()`
- ✅ Conservée pour compatibilité
- ⚠️ Note : Avec Supabase, la session est créée automatiquement lors de la connexion

### 3. Compatibilité Maintenue

Le fichier maintient la compatibilité avec l'ancienne API pour éviter de casser le code existant qui pourrait encore l'utiliser. Toutes les fonctions sont marquées comme `@deprecated` avec des suggestions d'utilisation des nouveaux helpers.

---

## 📋 Fichiers Modifiés

1. ✅ `src/lib/auth-utils.ts` - **Migré**

---

## ⚠️ Notes Importantes

### Dépréciation

Toutes les fonctions sont marquées comme `@deprecated` car elles utilisent l'ancienne API. Il est recommandé d'utiliser directement les fonctions de `@/lib/supabase/helpers` :

- `getCurrentUser()` → `getCurrentUser()` de `@/lib/supabase/helpers`
- `requireAuth()` → `getCurrentUser()` + vérification manuelle
- `requireProfessional()` → `isProfessional()` de `@/lib/supabase/helpers`
- `requireEstablishment()` → `requireEstablishment()` de `@/lib/supabase/helpers`

### Format de Retour

Les fonctions convertissent le format Supabase (snake_case) vers l'ancien format (camelCase) pour maintenir la compatibilité :

```typescript
// Format Supabase
{
  id: string,
  email: string,
  first_name: string,
  last_name: string,
  role: 'user' | 'professional' | 'admin',
  userType: 'user' | 'professional',
  establishmentId: string | null
}

// Format retourné (compatibilité)
{
  id: string,
  email: string,
  name: string,
  firstName: string,
  lastName: string,
  role: string,
  userType: string,
  establishmentId: string | null
}
```

---

## 🔍 Vérifications

### Aucune Utilisation Trouvée

D'après le grep, aucun fichier n'importe actuellement `auth-utils.ts`. Cela signifie que :
- ✅ Le code existant utilise déjà les helpers Supabase directement
- ✅ Ce fichier peut être supprimé en toute sécurité si nécessaire
- ✅ La migration maintient la compatibilité au cas où

### Tests Recommandés

- [ ] Vérifier qu'aucun fichier n'utilise `auth-utils.ts`
- [ ] Si des fichiers l'utilisent, tester qu'ils fonctionnent toujours
- [ ] Migrer progressivement vers les helpers Supabase directs
- [ ] Supprimer `auth-utils.ts` une fois que tout est migré

---

## 📝 Prochaines Étapes

1. ✅ **Migration auth-utils.ts** - **FAIT**
2. Migrer `src/lib/professional-utils.ts` vers Supabase
3. Migrer `src/lib/subscription-logger.ts` vers Supabase
4. Supprimer les fichiers obsolètes si non utilisés

---

## ✅ Validation

- [x] Imports NextAuth supprimés
- [x] Imports Prisma supprimés
- [x] Utilisation des helpers Supabase
- [x] Compatibilité avec l'ancienne API maintenue
- [x] Fonctions marquées comme `@deprecated`
- [x] Aucune erreur de lint
- [ ] Tests de compatibilité effectués (si fichiers utilisent encore ce module)

---

**Migration auth-utils.ts** : ✅ **Complétée et Supprimée**

Le fichier a été supprimé car aucun fichier ne l'utilisait. Tous les composants utilisent directement les helpers Supabase de `@/lib/supabase/helpers`.

**Prochaine étape** : Migrer `src/lib/professional-utils.ts` vers Supabase

