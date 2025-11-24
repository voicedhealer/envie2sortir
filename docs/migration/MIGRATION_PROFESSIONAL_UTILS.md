# Migration professional-utils.ts vers Supabase

**Date** : 13 novembre 2025  
**Statut** : ✅ Complété

---

## 🎯 Objectif

Migrer `src/lib/professional-utils.ts` de Prisma vers Supabase tout en maintenant la compatibilité avec l'ancienne API.

---

## ✅ Changements Effectués

### 1. Suppression de la Dépendance Prisma

**Avant** :
```typescript
import { prisma } from "@/lib/prisma";
```

**Après** :
```typescript
import { createClient } from '@/lib/supabase/server';
import { getProfessionalEstablishment as getProfessionalEstablishmentHelper } from '@/lib/supabase/helpers';
```

### 2. Migration des Fonctions

Toutes les fonctions utilisent maintenant Supabase :

#### `getProfessionalByUserId(userId: string)`
- ✅ Utilise `supabase.from('professionals').select()`
- ✅ Récupère l'établissement via `getProfessionalEstablishmentHelper()`
- ✅ Convertit le format snake_case → camelCase pour compatibilité

#### `getEstablishmentByProfessionalId(professionalId: string)`
- ✅ Utilise `getProfessionalEstablishmentHelper()` directement
- ✅ Récupère le propriétaire séparément
- ✅ Convertit le format pour compatibilité

#### `isUserProfessional(userId: string)`
- ✅ Utilise `supabase.from('professionals').select()`
- ✅ Vérifie si un professional existe avec cet ID

#### `getUserEstablishment(userId: string)`
- ✅ Utilise `isUserProfessional()` puis `getProfessionalEstablishmentHelper()`
- ✅ Retourne null si l'utilisateur n'est pas un professional

#### `createProfessionalFromUser(user, siret, companyName)`
- ✅ Utilise le client admin Supabase pour créer le professional
- ✅ Convertit camelCase → snake_case pour l'insertion
- ⚠️ Note : Cette fonction est dépréciée, utiliser `/api/professional-registration` à la place

### 3. Compatibilité Maintenue

Le fichier maintient la compatibilité avec l'ancienne API. Toutes les fonctions sont marquées comme `@deprecated` avec des suggestions d'utilisation des nouveaux helpers.

---

## 📋 Fichiers Modifiés

1. ✅ `src/lib/professional-utils.ts` - **Migré**

---

## ⚠️ Notes Importantes

### Dépréciation

Toutes les fonctions sont marquées comme `@deprecated` car elles utilisent l'ancienne API. Il est recommandé d'utiliser directement les fonctions de `@/lib/supabase/helpers` :

- `getProfessionalByUserId()` → `getCurrentUser()` de `@/lib/supabase/helpers`
- `getEstablishmentByProfessionalId()` → `getProfessionalEstablishment()` de `@/lib/supabase/helpers`
- `isUserProfessional()` → `isProfessional()` de `@/lib/supabase/helpers`
- `getUserEstablishment()` → `getProfessionalEstablishment()` de `@/lib/supabase/helpers`
- `createProfessionalFromUser()` → Utiliser `/api/professional-registration`

### Format de Retour

Les fonctions convertissent le format Supabase (snake_case) vers l'ancien format (camelCase) pour maintenir la compatibilité.

### Architecture Supabase

Dans Supabase, l'ID du Professional est le même que l'ID de l'utilisateur auth (pas de relation séparée comme dans Prisma). Cela simplifie les requêtes.

---

## 🔍 Vérifications

### Aucune Utilisation Trouvée

D'après le grep, aucun fichier n'importe actuellement `professional-utils.ts`. Cela signifie que :
- ✅ Le code existant utilise déjà les helpers Supabase directement
- ✅ Ce fichier peut être supprimé en toute sécurité si nécessaire
- ✅ La migration maintient la compatibilité au cas où

### Tests Recommandés

- [ ] Vérifier qu'aucun fichier n'utilise `professional-utils.ts`
- [ ] Si des fichiers l'utilisent, tester qu'ils fonctionnent toujours
- [ ] Migrer progressivement vers les helpers Supabase directs
- [ ] Supprimer `professional-utils.ts` une fois que tout est migré

---

## 📝 Prochaines Étapes

1. ✅ **Migration professional-utils.ts** - **FAIT**
2. Migrer `src/lib/subscription-logger.ts` vers Supabase
3. Supprimer les fichiers obsolètes si non utilisés

---

## ✅ Validation

- [x] Imports Prisma supprimés
- [x] Utilisation de Supabase pour toutes les fonctions
- [x] Compatibilité avec l'ancienne API maintenue
- [x] Fonctions marquées comme `@deprecated`
- [x] Aucune erreur de lint
- [ ] Tests de compatibilité effectués (si fichiers utilisent encore ce module)

---

**Migration professional-utils.ts** : ✅ **Complétée et Supprimée**

Le fichier a été supprimé car aucun fichier ne l'utilisait. Tous les composants utilisent directement les helpers Supabase de `@/lib/supabase/helpers`.

**Prochaine étape** : Migrer `src/lib/subscription-logger.ts` vers Supabase

