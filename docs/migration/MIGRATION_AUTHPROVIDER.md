# Migration AuthProvider.tsx vers Supabase Auth

**Date** : 13 novembre 2025  
**Statut** : ✅ Complété

---

## 🎯 Objectif

Migrer `AuthProvider.tsx` de NextAuth (`SessionProvider`) vers Supabase Auth.

---

## ✅ Changements Effectués

### 1. Création du Contexte Supabase Auth

**Fichier créé** : `src/contexts/SupabaseAuthContext.tsx`

- ✅ Contexte React pour gérer l'authentification Supabase
- ✅ Hook `useAuth()` pour accéder au contexte
- ✅ Provider `SupabaseAuthProvider` qui gère :
  - Récupération de la session initiale
  - Écoute des changements d'auth (`onAuthStateChange`)
  - Récupération des données utilisateur (users/professionals)
  - Fonction `signOut()`

**Interface fournie** :
```typescript
interface SupabaseAuthContextType {
  user: SessionUser | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

### 2. Migration de AuthProvider.tsx

**Fichier modifié** : `src/app/components/AuthProvider.tsx`

**Avant** :
```typescript
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider refetchInterval={0} ...>
      {children}
    </SessionProvider>
  );
}
```

**Après** :
```typescript
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";

export default function AuthProvider({ children }) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}
```

### 3. Migration de auth/layout.tsx

**Fichier modifié** : `src/app/auth/layout.tsx`

- ✅ Remplacé `SessionProvider` de NextAuth par `SupabaseAuthProvider`
- ✅ Ajout de commentaires explicatifs

---

## 🔄 Compatibilité

### Hook Existant : `useSupabaseSession`

Le hook `useSupabaseSession` (`src/hooks/useSupabaseSession.ts`) continue de fonctionner et est utilisé par la plupart des composants :

- ✅ `src/app/admin/layout.tsx`
- ✅ `src/app/dashboard/analytics/page.tsx`
- ✅ `src/app/components/UserMenu.tsx`
- ✅ `src/app/mon-compte/page.tsx`
- ✅ `src/app/dashboard/messagerie/page.tsx`

**Note** : Le hook `useSupabaseSession` peut être migré plus tard pour utiliser le contexte `useAuth()`, mais ce n'est pas urgent car il fonctionne déjà correctement.

### Nouveau Hook : `useAuth()`

Pour les nouveaux composants, utiliser le hook `useAuth()` du contexte :

```typescript
import { useAuth } from '@/contexts/SupabaseAuthContext';

function MyComponent() {
  const { user, session, loading, signOut } = useAuth();
  // ...
}
```

---

## 📋 Fichiers Modifiés

1. ✅ `src/contexts/SupabaseAuthContext.tsx` - **Créé**
2. ✅ `src/app/components/AuthProvider.tsx` - **Migré**
3. ✅ `src/app/auth/layout.tsx` - **Migré**

---

## ⚠️ Points d'Attention

### Composants Utilisant Encore NextAuth

Les fichiers suivants utilisent encore NextAuth et doivent être migrés :

1. **`src/app/auth/page.tsx`** ⚠️ **Priorité Haute**
   - Utilise `signIn`, `signUp`, `getSession` de `next-auth/react`
   - Doit être migré vers Supabase Auth

2. **`src/lib/auth-actions.ts`** ⚠️ **Priorité Moyenne**
   - Ancien fichier avec Prisma
   - Déjà remplacé par `src/lib/supabase/auth-actions.ts`
   - Peut être supprimé après vérification

### Routes NextAuth à Supprimer

- `src/app/api/auth/[...nextauth]/route.ts` - À supprimer après migration de `auth/page.tsx`

---

## 🧪 Tests Recommandés

### Tests Manuels

- [ ] Vérifier que l'authentification fonctionne
- [ ] Tester l'inscription utilisateur
- [ ] Tester la connexion utilisateur
- [ ] Tester la déconnexion
- [ ] Vérifier que les sessions persistent
- [ ] Tester le refresh token automatique
- [ ] Vérifier que les données utilisateur sont correctement chargées

### Tests Automatisés

- [ ] Créer des tests pour `SupabaseAuthContext`
- [ ] Tester le hook `useAuth()`
- [ ] Tester les changements d'état d'auth

---

## 📝 Prochaines Étapes

1. **Migrer `src/app/auth/page.tsx`** vers Supabase Auth (étape suivante)
2. Migrer `src/lib/auth-utils.ts` vers Supabase
3. Supprimer les routes NextAuth obsolètes
4. Supprimer `src/lib/auth-config.ts`
5. Tester tous les flux d'authentification

---

## ✅ Validation

- [x] Contexte Supabase Auth créé
- [x] AuthProvider.tsx migré
- [x] auth/layout.tsx migré
- [x] Aucune erreur de lint
- [x] Compatible avec les composants existants
- [ ] Tests manuels effectués
- [ ] Tests automatisés créés

---

**Migration AuthProvider** : ✅ **Complétée**

**Prochaine étape** : Migrer `src/app/auth/page.tsx` vers Supabase Auth

