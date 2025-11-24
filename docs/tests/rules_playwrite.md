Voici les meilleures **règles et astuces** à suivre pour que Cursor te génère des tests Playwright E2E fiables et maintenables, surtout pour l’ajout d’un établissement :

***

## 🟢 RÈGLES INDISPENSABLES POUR DU E2E AVEC CURSOR/PLAYWRIGHT

### 1. **Utiliser des sélecteurs robustes**
- **Toujours préférer les `data-testid`** aux classes CSS, aux id ou aux textes, car ils sont stables et non affectés par les modifs UI ou traduction.
- Exemple : `<input data-testid="form-name" ... />`
- Dans le test : `await page.getByTestId('form-name').fill('Bar Central');`

***

### 2. **Jamais de `waitForTimeout`**
- Bannir les sleep type `await page.waitForTimeout(1000);` qui fragilisent les tests et ralentissent la CI.
- Utiliser les auto-wait/playwright `expect(page.getByTestId('success-msg')).toBeVisible()`.

***

### 3. **Vérifier le résultat par un message ou une redirection claire**
- Après le submit du formulaire, valider le succès via :
  - Apparition d’un message ("Établissement ajouté !"),
  - Redirection vers la fiche (".../etablissements/bar-central"),
  - Affichage dans la liste (la card visible).

***

### 4. **Remplir tous les champs requis et déclencher la soumission comme un vrai utilisateur**
- Remplir tous les inputs, select, check/radio, upload (si besoin).
- Utiliser `.click()` sur le bouton de soumission ou `.press('Enter')` sur le dernier input.

***

### 5. **Ne jamais dépendre de l’ordre ou de l’état initial sauf si explicitement contrôlé**
- Préparer chaque test avec une fixture ou une base vide (setup idéal via beforeEach).
- Nettoyer les données créées après chaque test (db.reset ou supabase truncate).

***

### 6. **Utiliser le trace/debug Playwright pour diagnostiquer les fails**
- Demandé à Cursor de tourner le test avec trace/video.
- Tu pourras rejouer le scénario visuellement.

***

### 7. **Utiliser retry modéré pour CI**
- Default 1-2 retries maximum sur la config Playwright, pour éviter que des tests flaky passent indéfiniment.
- Cursor peut générer la config automatique si tu lui précises ce besoin.

***

### 8. **S’assurer que chaque test est isolé**
- Aucun test ne doit dépendre d’un autre, tout doit reposer sur le setup local du test.
- Si besoin, requête backend/API avant/après chaque test pour préparation/nettoyage.

***

### 9. **Tester les erreurs et validations**
- Ajouter des cas où des champs manquent, sont invalides, déjà utilisés… (tests de bord).
- Vérifier l’apparition du message d’erreur : `expect(page.getByTestId('error-msg')).toBeVisible()`.

***

### 10. **Pour Cursor → Toujours fournir l’HTML ou les data-testid**
- Donne-lui un extrait du formulaire HTML et les testids, il pourra créer les étapes précises et auto-waiter les states.

***

## 💡 DEMANDE TYPE À CURSOR POUR GÉNÉRER LE TEST

```
"Crée-moi un test Playwright qui remplit et valide le formulaire d’ajout d’établissement. Utilise les data-testid suivants:
- form-name, form-address, form-category, form-submit, success-msg
Vérifie le message de succès après soumission, et que le nouvel établissement apparaît dans la liste. Nettoie la base après le test pour isolation."
```

***

## 🚦 RÉSUMÉ ASTUCES

- Toujours privilégier `data-testid` dans le code ET les tests
- Jamais de sleep, toujours des auto-wait/expect
- Préparer chaque test avec un état de base propre
- Observer trace/video pour les fails
- Isoler les tests
- Demander à Cursor de générer fixturé + clean up pour chaque E2E

***

**En suivant ces règles et demandes, Cursor te générera des tests Playwright stables, rapides et beaucoup moins « galère » ! Tu veux un exemple type de prompt à donner dans Cursor ?**