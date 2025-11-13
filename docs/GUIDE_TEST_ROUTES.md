# Guide : Tester les Routes Migrées

## ⚠️ Erreur Commune : Serveur Non Démarré

Si vous voyez cette erreur :
```
curl: (7) Failed to connect to localhost port 3000
```

**C'est normal !** Le serveur Next.js n'est pas démarré.

## 🚀 Solution : Démarrer le Serveur

### Étape 1 : Démarrer Next.js

```bash
# Dans un terminal, démarrer le serveur
npm run dev
```

Vous devriez voir :
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

### Étape 2 : Garder le Terminal Ouvert

**Important** : Laissez ce terminal ouvert ! Le serveur doit rester actif.

### Étape 3 : Ouvrir un Nouveau Terminal

Ouvrez un **nouveau terminal** pour tester les routes (sans fermer le premier).

## 🧪 Tester les Routes

### Test 1 : GET /api/categories

```bash
# Dans un NOUVEAU terminal
curl http://localhost:3000/api/categories
```

### Test 2 : GET /api/etablissements/[slug]

**⚠️ Erreur à éviter** : Ne pas utiliser `[slug]` littéralement !

```bash
# ❌ MAUVAIS (zsh interprète les crochets)
curl http://localhost:3000/api/etablissements/[slug]

# ✅ BON : Utiliser un vrai slug
curl http://localhost:3000/api/etablissements/votre-slug-reel
```

**Comment trouver un slug réel ?**

1. **Via votre base Prisma** :
```bash
# Si vous avez sqlite3 installé
sqlite3 prisma/dev.db "SELECT slug FROM establishments LIMIT 1;"
```

2. **Via l'interface web** :
   - Aller sur `http://localhost:3000`
   - Cliquer sur un établissement
   - Regarder l'URL : `/etablissements/mon-slug`

3. **Créer un slug de test** :
   - Utiliser un slug simple : `test-etablissement`
   - Ou créer un établissement via l'interface

### Test 3 : GET /api/recherche/envie

```bash
# Recherche "envie de restaurant"
curl "http://localhost:3000/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5"

# Recherche "envie de sushi"
curl "http://localhost:3000/api/recherche/envie?envie=sushi&ville=Lyon&rayon=10"
```

**Note** : Utilisez des guillemets pour les URLs avec paramètres.

### Test 4 : POST /api/auth/register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "password": "test123456",
    "acceptTerms": true
  }'
```

### Test 5 : POST /api/auth/login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

## 🔍 Vérifier que le Serveur Tourne

### Méthode 1 : Vérifier le Processus

```bash
# Voir si Next.js tourne
ps aux | grep "next\|node.*dev" | grep -v grep
```

### Méthode 2 : Tester la Page d'Accueil

```bash
# Tester la page d'accueil
curl http://localhost:3000
```

Si ça fonctionne, le serveur est démarré.

### Méthode 3 : Ouvrir dans le Navigateur

Allez sur `http://localhost:3000` dans votre navigateur.

## 📋 Checklist de Test

- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Terminal du serveur reste ouvert
- [ ] Nouveau terminal ouvert pour les tests
- [ ] Test Supabase réussi (`npm run test:supabase`)
- [ ] Migrations SQL appliquées dans Supabase Dashboard
- [ ] Test GET /api/categories
- [ ] Test GET /api/etablissements/[slug-reel]
- [ ] Test GET /api/recherche/envie

## 🐛 Erreurs Courantes

### Erreur : "Failed to connect to localhost port 3000"

**Cause** : Serveur non démarré

**Solution** :
```bash
npm run dev
```

### Erreur : "zsh: no matches found: [slug]"

**Cause** : zsh interprète les crochets comme des patterns glob

**Solution** : Utiliser un vrai slug ou mettre l'URL entre guillemets :
```bash
# Avec guillemets
curl "http://localhost:3000/api/etablissements/[slug]"

# Ou mieux : utiliser un vrai slug
curl http://localhost:3000/api/etablissements/mon-slug-reel
```

### Erreur : "Table does not exist" (Supabase)

**Cause** : Migrations SQL non appliquées

**Solution** :
1. Aller dans Supabase Dashboard > SQL Editor
2. Exécuter les migrations dans l'ordre :
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_storage_setup.sql`

## 🎯 Exemple Complet de Test

```bash
# Terminal 1 : Démarrer le serveur
npm run dev

# Terminal 2 : Tester les routes
# 1. Tester Supabase
npm run test:supabase

# 2. Tester categories
curl http://localhost:3000/api/categories

# 3. Tester recherche
curl "http://localhost:3000/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5"

# 4. Tester un établissement (remplacer par un vrai slug)
curl http://localhost:3000/api/etablissements/mon-slug-reel
```

## 💡 Astuce : Script de Test Automatique

Créez un fichier `test-routes.sh` :

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🧪 Test des routes migrées..."
echo ""

echo "1. Test GET /api/categories"
curl -s "$BASE_URL/api/categories" | jq '.categories | length' || echo "❌ Erreur"
echo ""

echo "2. Test GET /api/recherche/envie"
curl -s "$BASE_URL/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5" | jq '.results | length' || echo "❌ Erreur"
echo ""

echo "✅ Tests terminés"
```

Puis exécutez :
```bash
chmod +x test-routes.sh
./test-routes.sh
```

