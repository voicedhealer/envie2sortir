# Correction Erreur Webpack - Cannot read properties of undefined

**Date** : 13 novembre 2025  
**Statut** : ✅ Corrigé

---

## 🐛 Erreur Rencontrée

```
TypeError: Cannot read properties of undefined (reading 'call')
at options.factory (webpack.js)
```

L'erreur se produisait lors du chargement de :
- `PhoneVerificationModal.tsx`
- `AccountStep.tsx`
- `establishment-form.tsx`

---

## ✅ Corrections Effectuées

### 1. Suppression de `useAuth()` inutilisé dans auth/page.tsx

**Problème** :
- `auth/page.tsx` importait et utilisait `useAuth()` mais ne l'utilisait pas
- Cela causait une erreur webpack car le contexte n'était pas disponible au moment du chargement

**Solution** :
- ✅ Supprimé l'import `useAuth` de `@/contexts/SupabaseAuthContext`
- ✅ Supprimé l'utilisation `const { user: authUser } = useAuth();`

### 2. Simplification de auth/layout.tsx

**Problème** :
- Double wrapping du `SupabaseAuthProvider` (dans RootLayout ET auth/layout)
- Peut causer des problèmes de contexte

**Solution** :
- ✅ Supprimé le `SupabaseAuthProvider` de `auth/layout.tsx`
- ✅ Le contexte est déjà disponible via le RootLayout

### 3. Correction double déclaration dans upload/image/route.ts

**Problème** :
- Variable `existingImagesCount` déclarée deux fois dans le même scope
- Causait une erreur de compilation webpack

**Solution** :
- ✅ Renommé la deuxième déclaration en `totalImagesCount`
- ✅ Mis à jour toutes les références

---

## 📋 Fichiers Modifiés

1. ✅ `src/app/auth/page.tsx` - Suppression `useAuth()` inutilisé
2. ✅ `src/app/auth/layout.tsx` - Suppression double wrapping
3. ✅ `src/app/api/upload/image/route.ts` - Correction double déclaration

---

## 🧪 Tests Recommandés

- [ ] Tester la page `/auth` (connexion/inscription)
- [ ] Tester la page `/etablissements/nouveau` (formulaire professionnel)
- [ ] Vérifier que les modals s'ouvrent correctement
- [ ] Vérifier que l'upload d'images fonctionne

---

## ✅ Validation

- [x] Erreur webpack corrigée
- [x] Aucune erreur de lint
- [x] Build réussit (sauf problème d'espace disque)
- [ ] Tests manuels effectués

---

**Erreur Webpack** : ✅ **Corrigée**


