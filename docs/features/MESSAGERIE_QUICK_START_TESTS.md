# Guide Rapide - Tests du Système de Messagerie

## 🚀 Démarrage rapide

### Test rapide (recommandé pour commencer)

```bash
npm run test:messaging:quick
```

Ce script vérifie rapidement :
- ✅ Schéma de base de données
- ✅ Intégrité des données
- ✅ Performance de base
- ✅ Sécurité basique
- ✅ Caractères spéciaux
- ✅ Relations entre tables
- ✅ Index de performance

**Durée** : ~5-10 secondes

## 📋 Suite complète de tests

### Tous les tests

```bash
# Tous les tests Jest
npm run test:messaging

# Tous les tests (Jest + script rapide)
npm run test:messaging:all
```

### Tests par catégorie

```bash
# Tests de sécurité uniquement
npm run test:messaging:security

# Tests de performance uniquement
npm run test:messaging:performance

# Tests d'intégration uniquement
npm run test:messaging:integration

# Tests des composants React uniquement
npm run test:messaging:components
```

## 🔍 Tests avec couverture de code

```bash
# Tous les tests avec rapport de couverture
npm test -- --coverage messaging

# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

## 🎯 Cibles de couverture

- **Lignes** : > 80%
- **Branches** : > 75%
- **Fonctions** : > 85%

## 📊 Résultats attendus

### Tests de sécurité (messaging-api-security.test.ts)

**9 suites de tests, ~60 tests individuels**

| Catégorie | Tests | Description |
|-----------|-------|-------------|
| Authentification | 2 | Vérification des accès |
| Injection SQL | 2 | Protection contre SQL injection |
| XSS | 2 | Protection contre scripts malveillants |
| Autorisation | 2 | Isolation des données |
| Validation | 4 | Validation des entrées |
| Caractères spéciaux | 1 | Support Unicode/émojis |
| Limites | 3 | Gestion des cas extrêmes |
| Concurrence | 1 | Messages simultanés |
| Données malformées | 3 | Robustesse |

### Tests de performance (messaging-performance.test.ts)

**7 suites de tests, ~15 tests**

| Métrique | Cible | Description |
|----------|-------|-------------|
| GET /conversations | < 500ms | Liste des conversations |
| GET /unread-count | < 300ms | Comptage rapide |
| POST /conversations | < 1000ms | Création |
| Validation | < 50ms | Erreurs instantanées |
| 50 requêtes simultanées | < 5000ms | Test de charge |
| Message 50KB | < 2000ms | Gros messages |

### Tests d'intégration (messaging-integration.test.ts)

**6 suites de tests, ~20 tests**

Flux complets testés :
1. ✅ Pro crée un ticket
2. ✅ Admin répond
3. ✅ Pro répond et marque comme lu
4. ✅ Admin ferme la conversation
5. ✅ Cohérence des données
6. ✅ Cas limites

### Tests des composants (messaging-components.test.tsx)

**3 suites de tests, ~15 tests**

Composants testés :
- ✅ MessageBadge (badge de notification)
- ✅ MessageForm (formulaire d'envoi)
- ✅ Accessibilité

## 🐛 Déboguer un test spécifique

```bash
# Exécuter un seul fichier de test
npm test -- messaging-api-security.test.ts

# Mode verbose
npm test -- --verbose messaging

# Déboguer avec Node Inspector
node --inspect-brk node_modules/.bin/jest messaging-api-security

# Puis ouvrir chrome://inspect dans Chrome
```

## ⚡ Mode watch (développement)

```bash
# Relancer les tests automatiquement
npm run test:watch -- messaging
```

## 🔥 Problèmes courants

### "Cannot find module @prisma/client"

```bash
npx prisma generate
npm test -- messaging
```

### "Database connection error"

```bash
# Vérifier que la base de données existe
npx prisma db push

# Réessayer
npm run test:messaging:quick
```

### "Timeout error"

```bash
# Augmenter le timeout dans jest.config.js
# testTimeout: 10000  // 10 secondes
```

### Tests qui échouent aléatoirement

Problème de concurrence ou d'ordre d'exécution :

```bash
# Exécuter les tests séquentiellement
npm test -- --runInBand messaging
```

## 📈 Monitoring continu

### Dans le CI/CD

Ajoutez dans votre `.github/workflows/test.yml` :

```yaml
- name: Tests de messagerie
  run: |
    npm run test:messaging
    npm run test:messaging:quick
```

### Pre-commit hook

Ajoutez dans `.husky/pre-commit` :

```bash
#!/bin/sh
npm run test:messaging:quick
```

## 📝 Checklist avant production

- [ ] Tous les tests passent (`npm run test:messaging:all`)
- [ ] Couverture > 80% (`npm test -- --coverage messaging`)
- [ ] Test rapide OK (`npm run test:messaging:quick`)
- [ ] Pas d'erreurs de linting
- [ ] Performance dans les cibles
- [ ] Documentation à jour

## 🎓 Ressources

- **Documentation complète** : `docs/MESSAGERIE_TESTS.md`
- **Documentation API** : `docs/MESSAGERIE.md`
- **Code des tests** : `src/__tests__/messaging/`
- **Script rapide** : `scripts/test-messaging.js`

## 💡 Bonnes pratiques

1. **Lancez le test rapide** avant chaque commit
2. **Tests complets** avant chaque PR
3. **Vérifiez la couverture** régulièrement
4. **Ajoutez des tests** pour chaque bug corrigé
5. **Documentez** les cas limites découverts

## ✅ Exemple de workflow

```bash
# 1. Développement d'une nouvelle fonctionnalité
git checkout -b feature/messagerie-attachments

# 2. Écrire le code

# 3. Test rapide pendant le développement
npm run test:messaging:quick

# 4. Tests complets avant commit
npm run test:messaging

# 5. Vérifier la couverture
npm test -- --coverage messaging

# 6. Commit et push
git add .
git commit -m "feat: add attachments to messaging"
git push origin feature/messagerie-attachments
```

---

**Besoin d'aide ?** Consultez `docs/MESSAGERIE_TESTS.md` pour plus de détails.

