# Tests du Système de Localisation

Ce dossier contient tous les tests automatisés pour le système de localisation.

## 📁 Structure des tests

```
location/
├── geolocation-utils.test.ts      # Tests des utilitaires GPS/calculs
├── location-service.test.ts       # Tests du service localStorage
├── useLocation.test.tsx           # Tests du hook principal
├── useCityHistory.test.tsx        # Tests du hook d'historique
├── LocationIndicator.test.tsx     # Tests du badge header
├── LocationSelector.test.tsx      # Tests du sélecteur complet
├── integration.test.tsx           # Tests d'intégration bout-en-bout
└── README.md                      # Ce fichier
```

## 🚀 Lancer les tests

### Tous les tests du système de localisation
```bash
npm test -- location
```

### Un fichier spécifique
```bash
npm test -- geolocation-utils
```

### En mode watch (développement)
```bash
npm test -- --watch location
```

### Avec coverage
```bash
npm test -- --coverage location
```

## 📊 Couverture des tests

### geolocation-utils.test.ts
- ✅ Calcul de distance entre deux points (Haversine)
- ✅ Recherche de la ville la plus proche
- ✅ Recherche et filtrage de villes
- ✅ Formatage de distances
- ✅ Vérification de rayon
- ✅ Vérification des permissions GPS

### location-service.test.ts  
- ✅ Sauvegarde/récupération des préférences
- ✅ Gestion du cache (expiration après 30 jours)
- ✅ Historique des villes (limite à 5)
- ✅ Compteur de visites
- ✅ Gestion des favoris
- ✅ Popup de bienvenue
- ✅ Nettoyage des données
- ✅ Détermination de la ville actuelle (priorités)

### useLocation.test.tsx
- ✅ Initialisation avec ville par défaut
- ✅ Changement de ville
- ✅ Changement de rayon
- ✅ Mise à jour des préférences
- ✅ Gestion des favoris
- ✅ Réinitialisation
- ✅ Persistance dans localStorage
- ✅ Validation hors Provider

### useCityHistory.test.tsx
- ✅ Historique vide à l'init
- ✅ Ajout/retrait de favoris
- ✅ Toggle favori
- ✅ Tri par date (plus récent en premier)
- ✅ Limite à 5 villes récentes
- ✅ Calcul des plus visitées
- ✅ Génération de suggestions
- ✅ Pas de doublons dans les suggestions

### LocationIndicator.test.tsx
- ✅ État de chargement
- ✅ Affichage ville + rayon
- ✅ Ouverture du sélecteur au clic
- ✅ Classes CSS correctes
- ✅ Icône MapPin présente
- ✅ Accessibilité

### LocationSelector.test.tsx
- ✅ Affichage conditionnel (isOpen)
- ✅ Fermeture au clic sur X
- ✅ Affichage ville actuelle
- ✅ Options de rayon
- ✅ 3 onglets (Rechercher, Favoris, Récents)
- ✅ Barre de recherche fonctionnelle
- ✅ Filtrage des villes
- ✅ Messages si vide (favoris/historique)
- ✅ Bouton détection GPS
- ✅ Système d'étoiles favoris
- ✅ Accessibilité
- ✅ Footer avec note

### integration.test.tsx
- ✅ Flux complet changement de ville
- ✅ Persistance dans localStorage
- ✅ Restauration depuis localStorage
- ✅ Intégration Indicator + Selector
- ✅ Favoris dans le sélecteur
- ✅ Construction de l'historique
- ✅ Changement et persistance du rayon
- ✅ Mode déconnecté (localStorage)
- ✅ Mode connecté (API ready)
- ✅ Parcours utilisateur complet
- ✅ Gestion d'erreurs (localStorage corrompu)
- ✅ Fallback ville par défaut

## 🎯 Objectifs de couverture

- **Cible minimale** : 80% de couverture
- **Cible idéale** : 90%+ de couverture

## 🧪 Types de tests

### Tests unitaires
Testent chaque fonction/composant isolément :
- `geolocation-utils.test.ts`
- `location-service.test.ts`
- `useLocation.test.tsx`
- `useCityHistory.test.tsx`

### Tests de composants
Testent le rendu et les interactions UI :
- `LocationIndicator.test.tsx`
- `LocationSelector.test.tsx`

### Tests d'intégration
Testent le système complet bout-en-bout :
- `integration.test.tsx`

## 📝 Bonnes pratiques

### Avant de committer
```bash
# Lancer tous les tests
npm test -- location

# Vérifier la couverture
npm test -- --coverage location

# Vérifier le linting
npm run lint
```

### Ajouter un nouveau test
1. Créer un fichier `*.test.ts(x)` dans ce dossier
2. Suivre la structure existante
3. Mock localStorage si nécessaire
4. Wrapper avec LocationProvider pour les tests de composants
5. Utiliser `waitFor` pour les opérations async
6. Nettoyer avec `beforeEach`

### Exemple de structure
```tsx
describe('MonComposant', () => {
  beforeEach(() => {
    // Setup
    localStorageMock.clear();
  });

  it('devrait faire quelque chose', async () => {
    // Arrange
    const { result } = renderHook(() => useLocation(), { wrapper });

    // Act
    act(() => {
      result.current.changeCity(testCity);
    });

    // Assert
    await waitFor(() => {
      expect(result.current.currentCity?.name).toBe('Paris');
    });
  });
});
```

## 🐛 Debugging

### Tests qui échouent
```bash
# Mode verbose
npm test -- --verbose location

# Un seul test
npm test -- -t "nom du test"

# Avec console.log
npm test -- --silent=false
```

### Mock localStorage ne fonctionne pas
Vérifier que le mock est bien défini :
```ts
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

### Erreurs async
Toujours utiliser `waitFor` pour les opérations asynchrones :
```tsx
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

## 📈 CI/CD

Les tests sont automatiquement lancés :
- ✅ À chaque push sur la branche
- ✅ À chaque Pull Request
- ✅ Avant chaque déploiement

## 🔄 Mise à jour

Si vous modifiez le code source :
1. Mettez à jour les tests correspondants
2. Vérifiez que tous les tests passent
3. Ajoutez des tests pour les nouvelles fonctionnalités
4. Maintenez la couverture > 80%

## ❓ Questions

Pour toute question sur les tests :
- Consulter la documentation Jest
- Consulter la documentation React Testing Library
- Vérifier les exemples dans ce dossier

