# 🚀 Guide de Démarrage - Tests E2E Playwright

## ✅ Installation terminée !

Playwright est déjà installé et configuré. Vous êtes prêt à tester ! 🎉

---

## 📋 Commandes Essentielles

### 🎯 Pour commencer (RECOMMANDÉ)
```bash
npm run test:e2e:ui
```
**Interface graphique** qui s'ouvre dans votre navigateur :
- 📋 Liste des tests à gauche
- ▶️ Cliquez sur un test pour le lancer
- 🎥 Voyez le navigateur en action
- 🔍 Inspectez chaque étape

### 🤖 Lancer tous les tests (automatique)
```bash
npm run test:e2e
```
Exécute tous les tests en arrière-plan et affiche les résultats.

### 👀 Voir les navigateurs (mode visible)
```bash
npm run test:e2e:headed
```
Les navigateurs s'ouvrent, vous voyez ce qui se passe en direct.

### 🐛 Déboguer un problème
```bash
npm run test:e2e:debug
```
Mode pas à pas avec la console développeur.

### 📊 Voir le rapport HTML
```bash
npm run test:e2e:report
```
Ouvre un rapport détaillé avec captures d'écran et vidéos.

---

## 🎬 Premier Test - C'est parti !

### Étape 1 : Lancer l'interface
```bash
npm run test:e2e:ui
```

### Étape 2 : Dans la fenêtre qui s'ouvre
1. ✅ Cochez "Show browser" (à droite)
2. 📋 Cliquez sur un test dans la liste (ex: "ajout-etablissement")
3. ▶️ Cliquez sur le bouton Play (▶️)

### Étape 3 : Regardez le robot travailler !
Le navigateur va :
- 🌐 Ouvrir votre site
- ⌨️ Remplir les formulaires
- 🖱️ Cliquer sur les boutons
- ✅ Vérifier que tout fonctionne

---

## 📁 Structure des Fichiers

```
tests/e2e/
├── README.md                      ← Documentation détaillée
├── ajout-etablissement.spec.ts    ← Test du formulaire d'ajout
└── page-publique.spec.ts          ← Test de la page publique

playwright-report/                 ← Rapports HTML (généré)
├── index.html                     ← Ouvrir pour voir les résultats
└── screenshots/                   ← Captures d'écran

test-results/                      ← Résultats bruts (généré)
├── traces/                        ← Traces d'exécution
└── videos/                        ← Vidéos des tests échoués
```

---

## 🎯 Tests Disponibles

### 1️⃣ Test d'ajout d'établissement
**Fichier :** `ajout-etablissement.spec.ts`

**Ce qu'il teste :**
- ✅ Formulaire de création de compte
- ✅ Vérification SIRET
- ✅ Ajout des infos établissement
- ✅ Configuration services
- ✅ Validation finale

**Lancer uniquement ce test :**
```bash
npx playwright test ajout-etablissement
```

### 2️⃣ Test de la page publique
**Fichier :** `page-publique.spec.ts`

**Ce qu'il teste :**
- ✅ Affichage des informations
- ✅ Boutons de contact
- ✅ Horaires
- ✅ Réseaux sociaux
- ✅ Version mobile

**Lancer uniquement ce test :**
```bash
npx playwright test page-publique
```

---

## 🔥 Exemples d'Utilisation

### Scénario 1 : Vérifier que tout marche
```bash
# 1. Lancer les tests
npm run test:e2e

# 2. Si OK, vous voyez :
# ✅ ajout-etablissement.spec.ts - 3 tests (PASSED)
# ✅ page-publique.spec.ts - 3 tests (PASSED)
```

### Scénario 2 : Un test échoue
```bash
# 1. Regarder le rapport
npm run test:e2e:report

# 2. Voir la capture d'écran de l'erreur
# 3. Lancer en mode debug
npm run test:e2e:debug
```

### Scénario 3 : Tester sur mobile
```bash
# Déjà configuré ! Le test "Responsive - Version mobile" teste automatiquement
npm run test:e2e
```

---

## 🛠️ Modifier les Tests

### Ajouter une vérification
Éditez `/tests/e2e/ajout-etablissement.spec.ts` :

```typescript
// Vérifier qu'un élément est visible
await expect(page.locator('h1')).toBeVisible();

// Vérifier un texte
await expect(page.locator('h1')).toContainText('Bienvenue');

// Vérifier une URL
await expect(page).toHaveURL(/dashboard/);
```

### Créer un nouveau test
```bash
# 1. Créer le fichier
touch tests/e2e/mon-test.spec.ts

# 2. Copier ce template
```

```typescript
import { test, expect } from '@playwright/test';

test.describe('Ma fonctionnalité', () => {
  
  test('Fait quelque chose', async ({ page }) => {
    await page.goto('/ma-page');
    await page.click('button:has-text("Action")');
    await expect(page.locator('h1')).toBeVisible();
  });
  
});
```

---

## 📊 Interpréter les Résultats

### ✅ Tests réussis (PASSED)
```
✅ ajout-etablissement.spec.ts
   ✅ Un professionnel peut créer son établissement (3.2s)
   ✅ Validation des champs obligatoires (1.1s)
```
→ **Tout va bien !** Votre code fonctionne.

### ❌ Tests échoués (FAILED)
```
❌ page-publique.spec.ts
   ❌ Affichage complet des informations (2.5s)
      Error: Timeout waiting for selector "h1"
```
→ **Problème détecté !** Le titre ne s'affiche pas.

**Solution :**
1. Ouvrir le rapport : `npm run test:e2e:report`
2. Voir la capture d'écran de l'échec
3. Corriger le bug
4. Relancer : `npm run test:e2e`

---

## 🎥 Fonctionnalités Cool

### 📸 Captures d'écran automatiques
Chaque test capture des screenshots aux étapes importantes :
- `playwright-report/etape-1-compte.png`
- `playwright-report/etape-2-siret.png`
- etc.

### 🎬 Vidéos des échecs
Si un test échoue, Playwright enregistre une vidéo !
→ Regardez dans `test-results/` pour voir ce qui s'est passé.

### 🔍 Traces d'exécution
Rejouez un test en mode "time-travel" :
```bash
npx playwright show-trace test-results/.../trace.zip
```

---

## 💡 Astuces Pro

### 🚀 Lancer un seul test
```bash
# Par nom de fichier
npx playwright test ajout-etablissement

# Par nom de test
npx playwright test -g "créer son établissement"
```

### 🔄 Relancer automatiquement
```bash
npx playwright test --ui
# Dans l'UI, activez "Watch mode"
# Les tests se relancent à chaque modification !
```

### 🐌 Ralentir l'exécution
```bash
npx playwright test --headed --slow-mo=1000
# Pause de 1 seconde entre chaque action
```

### 📋 Lister les tests
```bash
npx playwright test --list
```

---

## 🆘 Problèmes Courants

### ❌ "Cannot find module '@playwright/test'"
```bash
npm install -D @playwright/test
```

### ❌ "Browser not found"
```bash
npx playwright install chromium
```

### ❌ "Port 3000 already in use"
→ Le serveur dev est déjà lancé, c'est OK ! 
Les tests l'utilisent automatiquement.

### ❌ Le test est trop lent
→ Augmentez le timeout dans `playwright.config.ts` :
```typescript
timeout: 60 * 1000, // 60 secondes
```

---

## 🎓 Aller plus loin

### Documentation officielle
- 📖 [Playwright Docs](https://playwright.dev)
- 🎯 [Guide des sélecteurs](https://playwright.dev/docs/selectors)
- 💡 [Bonnes pratiques](https://playwright.dev/docs/best-practices)

### Vidéos tutoriels
- [Playwright en 10 minutes](https://www.youtube.com/watch?v=Xz6lhEzgI5I)
- [Tests E2E avec Playwright](https://www.youtube.com/watch?v=UxK0SYxKr34)

### Notre documentation
- 📁 `/tests/e2e/README.md` - Guide détaillé
- 📋 `playwright.config.ts` - Configuration

---

## ✨ Prêt à tester !

**Pour démarrer maintenant :**

```bash
# Ouvrir l'interface Playwright
npm run test:e2e:ui

# Cliquer sur un test
# Cliquer sur Play ▶️
# Regarder le robot travailler ! 🤖
```

**C'est aussi simple que ça !** 🎉

---

**Questions ?** Consultez `/tests/e2e/README.md` pour plus de détails ! 📚

