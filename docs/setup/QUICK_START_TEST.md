# 🚀 Quick Start : Tester les Routes Migrées

## ⚠️ Problème : "Failed to connect to localhost port 3000"

**C'est normal !** Le serveur Next.js n'est pas démarré.

## ✅ Solution en 3 Étapes

### Étape 1 : Démarrer le Serveur

**Ouvrez un terminal** et exécutez :

```bash
npm run dev
```

**Attendez** de voir :
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in Xs
```

**⚠️ IMPORTANT** : Laissez ce terminal ouvert ! Le serveur doit rester actif.

### Étape 2 : Ouvrir un Nouveau Terminal

Ouvrez un **nouveau terminal** (sans fermer le premier) pour tester.

### Étape 3 : Tester les Routes

#### Option A : Script Automatique (Recommandé)

```bash
./scripts/test-routes-migrees.sh
```

#### Option B : Tests Manuels

```bash
# Test 1: Categories
curl http://localhost:3000/api/categories

# Test 2: Recherche
curl "http://localhost:3000/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5"

# Test 3: Établissement (avec un vrai slug)
curl http://localhost:3000/api/etablissements/battlekart-dijon
```

## 📋 Slugs Réels Disponibles

Voici des slugs réels de votre base de données :

- `battlekart-dijon`
- `bodega-les-halles-dijon`
- `darcy-cinema-dijon`
- `dreamaway-dijon-realite-virtuelle-vr-escape-games-vr-jeunesse-et-famille-vr-action-adrenaline-vr-culture-vr`
- `games-factory-dijon`

**Utilisez ces slugs** au lieu de `[slug]` dans vos tests !

## 🔍 Vérifier que le Serveur Tourne

```bash
# Méthode 1: Tester la page d'accueil
curl http://localhost:3000

# Méthode 2: Vérifier le processus
ps aux | grep "next\|node.*dev" | grep -v grep
```

## ⚠️ Erreurs Courantes

### Erreur : "zsh: no matches found: [slug]"

**Cause** : zsh interprète les crochets comme des patterns glob.

**Solution** :
```bash
# ❌ MAUVAIS
curl http://localhost:3000/api/etablissements/[slug]

# ✅ BON : Utiliser un vrai slug
curl http://localhost:3000/api/etablissements/battlekart-dijon

# ✅ OU : Mettre entre guillemets
curl "http://localhost:3000/api/etablissements/[slug]"
```

### Erreur : "Failed to connect"

**Cause** : Serveur non démarré.

**Solution** : Voir "Étape 1" ci-dessus.

## 🎯 Checklist Rapide

- [ ] Terminal 1 : `npm run dev` (serveur actif)
- [ ] Terminal 2 : Tests (nouveau terminal)
- [ ] Test Supabase : `npm run test:supabase` ✅ (déjà fait)
- [ ] Test categories : `curl http://localhost:3000/api/categories`
- [ ] Test recherche : `curl "http://localhost:3000/api/recherche/envie?envie=restaurant&ville=Paris&rayon=5"`
- [ ] Test établissement : `curl http://localhost:3000/api/etablissements/battlekart-dijon`

## 💡 Astuce

**Utilisez le script automatique** :
```bash
./scripts/test-routes-migrees.sh
```

Il vérifie automatiquement que le serveur tourne et teste toutes les routes !

