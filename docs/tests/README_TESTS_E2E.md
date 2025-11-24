# 🎭 Tests E2E avec Playwright

Bienvenue dans la suite de tests End-to-End (E2E) automatisés !

## 🚀 Commandes rapides

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Lancer les tests avec interface graphique (recommandé pour débuter)
npm run test:e2e:ui

# Lancer les tests en mode visible (voir le navigateur)
npm run test:e2e:headed

# Déboguer un test spécifique
npm run test:e2e:debug

# Voir le rapport HTML des derniers tests
npm run test:e2e:report
```

## 📋 Tests disponibles

### 1. **ajout-etablissement.spec.ts**
Teste le parcours complet d'ajout d'un établissement :
- ✅ Création de compte professionnel
- ✅ Vérification SIRET
- ✅ Enrichissement (optionnel)
- ✅ Informations établissement
- ✅ Services et commodités
- ✅ Tags et catégories
- ✅ Réseaux sociaux
- ✅ Abonnement
- ✅ Résumé et validation

### 2. **page-publique.spec.ts**
Teste l'affichage de la page publique :
- ✅ Informations de base (nom, description, adresse)
- ✅ Coordonnées de contact
- ✅ Horaires d'ouverture
- ✅ Boutons d'action (appeler, WhatsApp)
- ✅ Réseaux sociaux
- ✅ Version mobile (responsive)

## 🎬 Comment ça marche ?

### Mode UI (Interface graphique)

```bash
npm run test:e2e:ui
```

Une fenêtre s'ouvre avec :
- 📋 Liste des tests à gauche
- 🎥 Visualisation du navigateur au centre
- 📊 Résultats et logs à droite

**Vous pouvez :**
- ▶️ Lancer un test en cliquant dessus
- ⏸️ Mettre en pause à n'importe quel moment
- 🔍 Inspecter chaque action
- 📸 Voir les captures d'écran
- ⏮️ Rejouer les étapes

### Mode Headless (Sans interface)

```bash
npm run test:e2e
```

Les tests s'exécutent en arrière-plan, idéal pour :
- 🔄 CI/CD (GitHub Actions)
- ⚡ Tests rapides
- 🤖 Automatisation

### Mode Debug (Déboguer)

```bash
npm run test:e2e:debug
```

Pour résoudre un problème :
1. Le navigateur s'ouvre avec la console développeur
2. Le test s'exécute pas à pas
3. Vous voyez exactement où ça bloque

## 📊 Rapports et résultats

Après chaque exécution :

### 📁 Dossier `playwright-report/`
Contient un **rapport HTML interactif** :
```bash
npm run test:e2e:report
```
S'ouvre dans votre navigateur avec :
- ✅/❌ Statut de chaque test
- ⏱️ Temps d'exécution
- 📸 Captures d'écran
- 🎥 Vidéos (en cas d'échec)
- 📝 Logs détaillés

### 📁 Dossier `test-results/`
Contient les données brutes :
- Traces d'exécution
- Vidéos des tests échoués
- Captures d'écran des erreurs

## ✍️ Créer un nouveau test

1. **Créer un fichier** dans `/tests/e2e/` :
```bash
touch tests/e2e/mon-nouveau-test.spec.ts
```

2. **Structure de base** :
```typescript
import { test, expect } from '@playwright/test';

test.describe('Ma fonctionnalité', () => {
  
  test('Doit faire quelque chose', async ({ page }) => {
    // 1. Aller sur une page
    await page.goto('/ma-page');
    
    // 2. Interagir
    await page.click('button:has-text("Cliquer")');
    
    // 3. Vérifier
    await expect(page.locator('h1')).toContainText('Succès');
  });
  
});
```

## 🔧 Actions courantes

### Navigation
```typescript
await page.goto('/etablissements/nouveau');
await page.goBack();
await page.reload();
```

### Interaction
```typescript
// Cliquer
await page.click('button:has-text("Suivant")');

// Remplir un champ
await page.fill('input[name="email"]', 'test@example.com');

// Cocher une case
await page.check('input[type="checkbox"]');

// Sélectionner dans une liste
await page.selectOption('select', 'valeur');
```

### Vérifications
```typescript
// Texte présent
await expect(page.locator('h1')).toContainText('Titre');

// Élément visible
await expect(page.locator('.element')).toBeVisible();

// URL correcte
await expect(page).toHaveURL(/dashboard/);

// Nombre d'éléments
await expect(page.locator('.item')).toHaveCount(5);
```

### Captures
```typescript
// Capture d'écran
await page.screenshot({ path: 'ma-capture.png' });

// Capture pleine page
await page.screenshot({ 
  path: 'full-page.png',
  fullPage: true 
});
```

### Attentes
```typescript
// Attendre un élément
await page.waitForSelector('.element');

// Attendre une URL
await page.waitForURL('/success');

// Attendre un délai (à éviter si possible)
await page.waitForTimeout(1000);

// Attendre le chargement réseau
await page.waitForLoadState('networkidle');
```

## 🎯 Bonnes pratiques

### ✅ À FAIRE
- Utiliser des sélecteurs sémantiques (`button:has-text("Suivant")`)
- Attendre les éléments avant d'interagir
- Capturer des screenshots aux étapes clés
- Nettoyer les données de test après
- Utiliser des timeouts raisonnables

### ❌ À ÉVITER
- Sélecteurs CSS fragiles (`.btn-123`)
- `waitForTimeout()` sans raison
- Tests qui dépendent les uns des autres
- Données en dur qui changent souvent
- Tests trop longs (> 1 minute)

## 🐛 Déboguer un test qui échoue

1. **Regarder le rapport** :
```bash
npm run test:e2e:report
```
→ Voir la capture d'écran de l'échec

2. **Lancer en mode visible** :
```bash
npm run test:e2e:headed
```
→ Voir ce que fait le navigateur

3. **Utiliser le mode debug** :
```bash
npm run test:e2e:debug
```
→ Pas à pas avec la console

4. **Ajouter des logs** :
```typescript
console.log('État actuel:', await page.textContent('h1'));
```

## 📚 Documentation

- 📖 [Documentation Playwright](https://playwright.dev)
- 🎯 [Guide des sélecteurs](https://playwright.dev/docs/selectors)
- 🔍 [API complète](https://playwright.dev/docs/api/class-page)
- 💡 [Exemples](https://playwright.dev/docs/intro)

## 🤝 Contribution

Pour ajouter un test :
1. Créer le fichier `.spec.ts` dans `/tests/e2e/`
2. Écrire le test avec des descriptions claires
3. Tester localement : `npm run test:e2e:ui`
4. Vérifier que ça passe : `npm run test:e2e`
5. Commit et push !

---

**Besoin d'aide ?** Regardez les tests existants comme exemples ! 🚀

