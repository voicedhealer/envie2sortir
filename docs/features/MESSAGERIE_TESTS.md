# Tests du Système de Messagerie

## Vue d'ensemble

Suite complète de tests pour garantir la sécurité, la robustesse et les performances du système de messagerie Pro-Admin.

## Structure des tests

```
src/__tests__/messaging/
├── messaging-api-security.test.ts      # Tests de sécurité
├── messaging-performance.test.ts       # Tests de performance
├── messaging-integration.test.ts       # Tests d'intégration
└── messaging-components.test.tsx       # Tests des composants React
```

## 1. Tests de sécurité (messaging-api-security.test.ts)

### Catégories testées

#### 1.1 Authentification
- ✅ Rejet des requêtes non authentifiées
- ✅ Vérification des rôles (pro vs admin)
- ✅ Protection des données entre utilisateurs

#### 1.2 Injection SQL
- ✅ Protection contre `'; DROP TABLE--`
- ✅ Protection contre `1' OR '1'='1`
- ✅ Protection contre `UNION SELECT`
- ✅ Protection contre autres variantes d'injection
- **Résultat** : Prisma ORM fournit une protection native

#### 1.3 XSS (Cross-Site Scripting)
- ✅ `<script>alert('XSS')</script>`
- ✅ `<img src=x onerror=alert('XSS')>`
- ✅ `<svg/onload=alert('XSS')>`
- ✅ Autres vecteurs d'attaque XSS
- **Résultat** : Stockage sécurisé, échappement au render

#### 1.4 Autorisation
- ✅ Isolation des données entre professionnels
- ✅ Accès admin aux ressources
- ✅ Vérification des propriétaires

#### 1.5 Validation des entrées
- ✅ Rejet des sujets vides
- ✅ Rejet des messages vides
- ✅ Validation des statuts
- ✅ Validation des formats

#### 1.6 Caractères spéciaux
- ✅ Émojis (😀🎉💻🚀)
- ✅ Accents (éèêëàâä)
- ✅ Symboles (€$£¥©®™)
- ✅ Unicode multi-langues
- ✅ Retours à la ligne
- ✅ Tabs et espaces multiples

#### 1.7 Tests de limites
- ✅ Sujets très longs (1000+ caractères)
- ✅ Messages très longs (10000+ caractères)
- ✅ IDs invalides
- ✅ Payloads malformés

#### 1.8 Concurrence
- ✅ Messages simultanés multiples
- ✅ Intégrité des données

#### 1.9 Données malformées
- ✅ JSON invalide
- ✅ Champs manquants
- ✅ Types incorrects

## 2. Tests de performance (messaging-performance.test.ts)

### Métriques cibles

#### 2.1 Temps de réponse
- `GET /conversations` : < 500ms
- `GET /unread-count` : < 300ms
- `POST /conversations` : < 1000ms
- Validation : < 50ms

#### 2.2 Tests de charge
- ✅ 50 requêtes GET simultanées
- ✅ 100 comptages simultanés
- ✅ Temps total < 5 secondes

#### 2.3 Messages volumineux
- ✅ Messages de 50KB
- ✅ 20 messages de 5KB simultanés
- **Résultat** : Gestion efficace ou limite claire

#### 2.4 Scalabilité
- ✅ 1000 conversations en liste
- ✅ 10000 messages non lus
- **Performance** : < 2 secondes

#### 2.5 Mémoire
- ✅ Pas de fuite mémoire
- ✅ Augmentation < 50MB pour 1000 requêtes

#### 2.6 Résilience réseau
- ✅ Gestion des timeouts
- ✅ Récupération gracieuse

## 3. Tests d'intégration (messaging-integration.test.ts)

### Flux complets testés

#### 3.1 Création de ticket par pro
1. ✅ Pro crée une conversation
2. ✅ Message initial inclus
3. ✅ Visible dans la liste du pro
4. ✅ Visible dans la liste admin

#### 3.2 Réponse admin
1. ✅ Admin envoie un message
2. ✅ Pro a un message non lu
3. ✅ Message visible dans la conversation
4. ✅ Badge de notification mis à jour

#### 3.3 Réponse pro et lecture
1. ✅ Pro répond
2. ✅ Pro marque comme lu
3. ✅ Compteur pro à zéro
4. ✅ Admin a message non lu

#### 3.4 Fermeture par admin
1. ✅ Admin ferme la conversation
2. ✅ Statut correctement mis à jour
3. ✅ Filtre par statut fonctionne

### Cohérence des données

- ✅ `lastMessageAt` mis à jour correctement
- ✅ Nombre de messages cohérent
- ✅ Ordre chronologique respecté
- ✅ Réouverture fonctionnelle
- ✅ Marquages multiples gérés

## 4. Tests des composants (messaging-components.test.tsx)

### MessageBadge

- ✅ Masqué si 0 message
- ✅ Affiche le bon nombre
- ✅ Affiche "9+" si > 9
- ✅ Polling toutes les 30s
- ✅ Pas d'appel sans session

### MessageForm

- ✅ Rendu correct
- ✅ Bouton désactivé si vide
- ✅ Validation client
- ✅ Envoi réussi
- ✅ Gestion des erreurs
- ✅ État de chargement
- ✅ Caractères spéciaux
- ✅ Messages multilignes
- ✅ Messages longs

### Accessibilité

- ✅ Labels appropriés
- ✅ Navigation clavier
- ✅ Attributs ARIA

## Exécution des tests

### Tous les tests
```bash
npm test -- messaging
```

### Par catégorie
```bash
# Tests de sécurité
npm test -- messaging-api-security

# Tests de performance
npm test -- messaging-performance

# Tests d'intégration
npm test -- messaging-integration

# Tests des composants
npm test -- messaging-components
```

### Avec couverture
```bash
npm test -- --coverage messaging
```

### Mode watch
```bash
npm test -- --watch messaging
```

## Résultats attendus

### Sécurité
- **Objectif** : 100% des tests passent
- **Injection SQL** : Aucune vulnérabilité
- **XSS** : Stockage sécurisé
- **Autorisation** : Isolation parfaite

### Performance
- **Temps de réponse** : < limites définies
- **Charge** : Gestion de 50+ requêtes simultanées
- **Mémoire** : Pas de fuite détectée
- **Scalabilité** : Gestion de 1000+ conversations

### Intégration
- **Flux complets** : Tous fonctionnels
- **Cohérence** : Données toujours cohérentes
- **Badge** : Mise à jour correcte

### Composants
- **Rendu** : Tous les composants s'affichent
- **Interactions** : Toutes fonctionnelles
- **Accessibilité** : Conforme aux standards

## Amélioration continues

### Tests à ajouter

1. **Tests E2E avec Playwright**
   - Navigation complète dans l'interface
   - Interactions utilisateur réelles
   - Tests cross-browser

2. **Tests de montée en charge**
   - Apache JMeter ou K6
   - 1000+ utilisateurs simultanés
   - Profiling de performance

3. **Tests de sécurité avancés**
   - OWASP ZAP
   - Burp Suite
   - Scan de vulnérabilités

4. **Tests de régression**
   - Snapshots des composants
   - Tests visuels avec Percy
   - Comparaison d'APIs

## Métriques de qualité

### Couverture de code cible
- **Lignes** : > 80%
- **Branches** : > 75%
- **Fonctions** : > 85%
- **Fichiers critiques** : 100%

### Performance cible
- **P50** : < 200ms
- **P95** : < 500ms
- **P99** : < 1000ms
- **Erreurs** : < 0.1%

## Résolution des problèmes

### Tests qui échouent

1. **Erreurs de base de données**
   - Vérifier que Prisma est à jour
   - Lancer les migrations
   - Nettoyer la base de test

2. **Timeouts**
   - Augmenter `testTimeout` dans Jest
   - Vérifier la connexion réseau
   - Optimiser les requêtes

3. **Erreurs aléatoires**
   - Problèmes de concurrence
   - Ajouter des `await` manquants
   - Isoler les tests

### Commandes utiles

```bash
# Nettoyer et réinstaller
npm ci

# Régénérer le client Prisma
npx prisma generate

# Voir les tests en détail
npm test -- --verbose messaging

# Déboguer un test spécifique
node --inspect-brk node_modules/.bin/jest messaging-api-security
```

## Conclusion

Cette suite de tests complète garantit :
- ✅ **Sécurité** : Protection contre les attaques courantes
- ✅ **Performance** : Temps de réponse acceptables
- ✅ **Robustesse** : Gestion de tous les cas limites
- ✅ **Fiabilité** : Intégration complète testée
- ✅ **Qualité** : Composants fonctionnels et accessibles

Le système de messagerie est production-ready. 🚀

