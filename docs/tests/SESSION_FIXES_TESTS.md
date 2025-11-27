# 🧪 Tests de vérification des corrections de session et authentification

## 📋 Vue d'ensemble

Ce document décrit les tests créés pour vérifier que les problèmes de session et d'authentification ont été correctement corrigés.

## 🔧 Problèmes corrigés

1. **Timeouts de base de données dans `useSupabaseSession`**
   - Timeout réduit de 10s à 5s
   - Gestion gracieuse des timeouts (pas d'erreurs critiques)

2. **Erreur 500 dans `/api/establishments/[id]/stats`**
   - `getCurrentUser()` avec timeout de 3s
   - Gestion gracieuse des erreurs (pas de 500 même si getCurrentUser échoue)

3. **Erreur 404 sur `/api/etablissements/[slug]`**
   - Ajout de la méthode GET manquante

4. **Optimisation de `getCurrentUser()`**
   - Timeouts de 5s pour toutes les requêtes DB
   - Gestion des timeouts sans bloquer

## 🧪 Types de tests

### 1. Script de test manuel (`scripts/test-session-fixes.ts`)

**Commande :**
```bash
npm run test:session
```

**Tests effectués :**
- ✅ Test 1: GET /api/etablissements/[slug] - Vérifie que la route existe
- ✅ Test 2: POST /api/establishments/[id]/stats - Vérifie qu'il n'y a plus d'erreur 500
- ✅ Test 3: getCurrentUser avec timeout - Vérifie la configuration des timeouts
- ✅ Test 4: useSupabaseSession - Vérifie que le timeout est à 5s
- ✅ Test 5: Gestion gracieuse des timeouts - Vérifie que les timeouts ne sont pas loggés comme erreurs
- ✅ Test 6: API stats sans authentification - Vérifie que l'API fonctionne sans auth

**Résultat attendu :**
```
✅ GET /api/etablissements/[slug] - Route fonctionne
✅ POST /api/establishments/[id]/stats - Gestion d'erreur OK
✅ getCurrentUser - Timeout configuré
✅ useSupabaseSession - Timeout réduit à 5s
✅ Gestion gracieuse des timeouts
✅ API stats sans auth - Fonctionne
```

### 2. Tests unitaires Jest (`src/__tests__/session-fixes.test.ts`)

**Commande :**
```bash
npm run test:session:unit
```

**Tests effectués :**
- ✅ useSupabaseSession utilise un timeout de 5s
- ✅ Les timeouts sont gérés gracieusement
- ✅ L'API stats gère getCurrentUser avec timeout
- ✅ L'API stats ne retourne pas 500 si getCurrentUser échoue
- ✅ L'API /api/etablissements/[slug] a une méthode GET
- ✅ getCurrentUser a un timeout de 5s
- ✅ Les timeouts utilisent le fallback
- ✅ Les timeouts ne sont pas loggés comme erreurs critiques

### 3. Tests E2E Playwright (`tests/e2e/session-fixes.spec.ts`)

**Commande :**
```bash
npm run test:e2e -- session-fixes
```

**Tests effectués :**
- ✅ GET /api/etablissements/[slug] devrait fonctionner
- ✅ POST /api/establishments/[id]/stats ne devrait pas retourner 500
- ✅ POST /api/establishments/[id]/stats devrait fonctionner sans authentification
- ✅ Les timeouts de session ne devraient pas bloquer l'application
- ✅ La session devrait se charger même si les requêtes DB sont lentes

## 📊 Critères de réussite

### ✅ Test 1: Route GET /api/etablissements/[slug]
- **Critère :** La route ne doit pas retourner 500
- **Vérification :** Status 200 ou 404 (établissement non trouvé), jamais 500

### ✅ Test 2: API stats sans erreur 500
- **Critère :** L'API ne doit jamais retourner 500
- **Vérification :** Status 200, 201, ou 404, jamais 500

### ✅ Test 3: Timeouts réduits
- **Critère :** Les timeouts doivent être à 5s maximum
- **Vérification :** Code source contient `5000` ou `5 * 1000`, pas `10000`

### ✅ Test 4: Gestion gracieuse
- **Critère :** Les timeouts ne doivent pas bloquer l'application
- **Vérification :** Utilisation du fallback, pas d'erreurs critiques

## 🚀 Exécution des tests

### Tous les tests
```bash
# Script de test manuel
npm run test:session

# Tests unitaires
npm run test:session:unit

# Tests E2E
npm run test:e2e -- session-fixes
```

### Tests individuels
```bash
# Test manuel uniquement
tsx scripts/test-session-fixes.ts

# Tests unitaires uniquement
jest --testPathPattern=session-fixes.test.ts

# Tests E2E uniquement
playwright test session-fixes
```

## 📝 Notes importantes

1. **Variables d'environnement :** Les tests nécessitent `.env.local` avec :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (optionnel, défaut: http://localhost:3000)

2. **Serveur de développement :** Pour les tests E2E, le serveur doit être lancé :
   ```bash
   npm run dev
   ```

3. **Base de données :** Les tests utilisent des IDs d'établissements réels du log fourni. Si ces établissements n'existent pas, certains tests peuvent échouer (mais pas avec une erreur 500).

## 🔍 Dépannage

### Erreur : "Variables d'environnement Supabase manquantes"
- Vérifier que `.env.local` existe et contient les variables nécessaires

### Erreur : "Connection refused" dans les tests E2E
- Vérifier que le serveur de développement est lancé sur le port 3000

### Test échoue avec timeout
- Vérifier que la base de données Supabase est accessible
- Vérifier que les timeouts sont bien configurés à 5s dans le code

## ✅ Checklist de validation

- [ ] Script de test manuel passe tous les tests
- [ ] Tests unitaires passent tous les tests
- [ ] Tests E2E passent tous les tests
- [ ] Aucune erreur 500 dans les logs
- [ ] Les timeouts sont à 5s maximum
- [ ] Les timeouts sont gérés gracieusement
- [ ] La route GET /api/etablissements/[slug] existe
- [ ] L'API stats fonctionne sans authentification

