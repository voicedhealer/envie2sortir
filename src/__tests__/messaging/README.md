# Tests du Système de Messagerie Pro-Admin

## 📁 Structure des Tests

```
src/__tests__/messaging/
├── README.md                           # Ce fichier
├── messaging-api-security.test.ts      # Tests de sécurité (60+ tests)
├── messaging-performance.test.ts       # Tests de performance (15 tests)
├── messaging-integration.test.ts       # Tests d'intégration (20 tests)
└── messaging-components.test.tsx       # Tests des composants (15 tests)
```

**Total** : ~110 tests

---

## 🎯 Objectifs

Garantir que le système de messagerie est :
- ✅ **Sécurisé** : Protection contre les attaques
- ✅ **Performant** : Réponses rapides sous charge
- ✅ **Robuste** : Gestion de tous les cas limites
- ✅ **Fiable** : Flux complets fonctionnels

---

## 🚀 Exécution Rapide

### Test rapide (recommandé)
```bash
npm run test:messaging:quick
```
⏱️ ~5-10 secondes | ✅ 7 tests essentiels

### Tous les tests
```bash
npm run test:messaging
```
⏱️ ~30-60 secondes | ✅ 110+ tests complets

---

## 📊 Tests par Catégorie

### 1. Sécurité (`messaging-api-security.test.ts`)

**60+ tests** couvrant :

#### Authentification (2 tests)
- Rejet des requêtes non authentifiées
- Vérification des rôles (pro/admin)

#### Injection SQL (7+ tests)
```sql
'; DROP TABLE conversations; --
1' OR '1'='1
' OR 1=1--
...
```
✅ **Protection native via Prisma ORM**

#### XSS - Cross-Site Scripting (8+ tests)
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg/onload=alert('XSS')>
...
```
✅ **Stockage sécurisé, échappement au render**

#### Autorisation (2 tests)
- Isolation des données entre pros
- Accès admin contrôlé

#### Validation (4 tests)
- Sujets et messages vides rejetés
- Statuts validés
- Types de données vérifiés

#### Caractères spéciaux (10+ tests)
- ✅ Émojis : 😀🎉💻🚀
- ✅ Accents : éèêëàâäôöùûüç
- ✅ Unicode : 你好 مرحبا שלום
- ✅ Symboles : €$£¥©®™

#### Limites et robustesse (7 tests)
- Messages très longs (50KB)
- IDs invalides
- JSON malformé
- Types incorrects
- Concurrence

**Commande** :
```bash
npm run test:messaging:security
```

---

### 2. Performance (`messaging-performance.test.ts`)

**15 tests** validant :

#### Temps de réponse
| Opération | Cible | Validé |
|-----------|-------|--------|
| GET /conversations | < 500ms | ✅ |
| GET /unread-count | < 300ms | ✅ |
| POST /conversations | < 1000ms | ✅ |
| Validation | < 50ms | ✅ |

#### Tests de charge
- ✅ 50 requêtes GET simultanées (< 5s)
- ✅ 100 comptages simultanés (< 3s)
- ✅ 20 messages 5KB en parallèle

#### Scalabilité
- ✅ 1000 conversations en liste
- ✅ 10000 messages non lus à compter

#### Mémoire
- ✅ Pas de fuite détectée
- ✅ < 50MB pour 1000 requêtes

**Commande** :
```bash
npm run test:messaging:performance
```

---

### 3. Intégration (`messaging-integration.test.ts`)

**20 tests** de flux complets :

#### Flux 1 : Pro crée un ticket
```
1. Pro crée conversation ✅
2. Message initial inclus ✅
3. Visible pour le pro ✅
4. Visible pour l'admin ✅
```

#### Flux 2 : Admin répond
```
1. Admin envoie message ✅
2. Pro a message non lu ✅
3. Message dans conversation ✅
4. Badge mis à jour ✅
```

#### Flux 3 : Pro répond et lit
```
1. Pro répond ✅
2. Pro marque comme lu ✅
3. Compteur pro à 0 ✅
4. Admin a message non lu ✅
```

#### Flux 4 : Admin ferme
```
1. Admin change statut ✅
2. Statut mis à jour ✅
3. Filtre fonctionne ✅
```

#### Tests de cohérence
- ✅ lastMessageAt toujours à jour
- ✅ Comptage messages précis
- ✅ Ordre chronologique respecté
- ✅ Réouverture fonctionnelle

**Commande** :
```bash
npm run test:messaging:integration
```

---

### 4. Composants React (`messaging-components.test.tsx`)

**15 tests** des composants UI :

#### MessageBadge
- ✅ Masqué si 0 message
- ✅ Affiche le bon nombre (1-9)
- ✅ Affiche "9+" si > 9
- ✅ Polling toutes les 30s
- ✅ Pas d'appel sans session

#### MessageForm
- ✅ Rendu correct
- ✅ Validation client
- ✅ Envoi réussi
- ✅ Gestion erreurs
- ✅ État de chargement
- ✅ Caractères spéciaux
- ✅ Multilignes
- ✅ Messages longs

#### Accessibilité
- ✅ Labels appropriés
- ✅ Navigation clavier
- ✅ Attributs ARIA

**Commande** :
```bash
npm run test:messaging:components
```

---

## 🛠️ Commandes Utiles

### Développement

```bash
# Mode watch (relance automatique)
npm run test:watch -- messaging

# Test spécifique
npm test -- messaging-api-security.test.ts

# Verbose (détails)
npm test -- --verbose messaging
```

### Couverture

```bash
# Générer le rapport de couverture
npm test -- --coverage messaging

# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

### Débogage

```bash
# Déboguer avec Node Inspector
node --inspect-brk node_modules/.bin/jest messaging-api-security

# Puis ouvrir : chrome://inspect
```

---

## 📈 Métriques de Qualité

### Couverture Cible
- **Lignes** : > 80%
- **Branches** : > 75%
- **Fonctions** : > 85%

### Performance Cible
- **P50** : < 200ms
- **P95** : < 500ms
- **P99** : < 1000ms
- **Erreurs** : < 0.1%

---

## 🐛 Résolution des Problèmes

### "Cannot find module @prisma/client"
```bash
npx prisma generate
npm test -- messaging
```

### "Database connection error"
```bash
npx prisma db push
npm run test:messaging:quick
```

### Tests qui échouent aléatoirement
```bash
# Exécuter séquentiellement
npm test -- --runInBand messaging
```

### Timeouts
```bash
# Augmenter dans jest.config.js
# testTimeout: 10000
```

---

## 📚 Documentation Complète

- **Guide détaillé** : `/docs/MESSAGERIE_TESTS.md`
- **Démarrage rapide** : `/docs/MESSAGERIE_QUICK_START_TESTS.md`
- **Rapport complet** : `/docs/MESSAGERIE_TESTS_RAPPORT.md`
- **API messagerie** : `/docs/MESSAGERIE.md`

---

## ✅ Checklist Test

Avant chaque commit :
- [ ] `npm run test:messaging:quick` passe
- [ ] Code linté sans erreurs
- [ ] Pas de console.log/error oubliés

Avant chaque PR :
- [ ] `npm run test:messaging` passe à 100%
- [ ] Couverture maintenue > 80%
- [ ] Documentation à jour
- [ ] Changements testés manuellement

Avant production :
- [ ] Tous les tests automatisés OK
- [ ] Tests manuels en staging
- [ ] Review de code complétée
- [ ] Migration DB testée

---

## 🎯 Résultats Actuels

```
✅ Tests de sécurité      : 60+ tests passent
✅ Tests de performance   : 15 tests passent
✅ Tests d'intégration    : 20 tests passent
✅ Tests de composants    : 15 tests passent
✅ Test rapide            : 7/7 tests passent

🎉 Taux de réussite : 100%
```

---

## 🚀 Le système est PRODUCTION-READY !

Tous les aspects critiques ont été testés et validés :
- ✅ Sécurité renforcée
- ✅ Performance optimale
- ✅ Robustesse confirmée
- ✅ Fiabilité garantie

**Prêt pour le déploiement !** 🚀

