# 🧪 Guide de Tests - Système de Localisation

Ce document explique comment lancer et maintenir les tests du système de localisation.

## 📋 Vue d'ensemble

Le système de localisation est testé à 3 niveaux :
1. **Tests unitaires** - Fonctions et utilitaires isolés
2. **Tests de composants** - Composants React UI
3. **Tests d'intégration** - Système complet bout-en-bout

**Couverture cible** : > 80%

---

## 🚀 Lancer les tests

### Commandes principales

```bash
# Tous les tests de localisation
npm test location

# Avec mode watch (développement)
npm test -- --watch location

# Avec couverture
npm test -- --coverage location

# Tests spécifiques
npm test geolocation-utils
npm test useLocation
npm test integration

# Mode verbeux
npm test -- --verbose location
```

### Dans votre workflow

```bash
# Avant de committer
npm test location && npm run lint

# Avant de pusher
npm test && npm run build
```

---

## 📊 Résultats attendus

### Si tout fonctionne
```
 PASS  src/__tests__/location/geolocation-utils.test.ts
 PASS  src/__tests__/location/location-service.test.ts
 PASS  src/__tests__/location/useLocation.test.tsx
 PASS  src/__tests__/location/useCityHistory.test.tsx
 PASS  src/__tests__/location/LocationIndicator.test.tsx
 PASS  src/__tests__/location/LocationSelector.test.tsx
 PASS  src/__tests__/location/integration.test.tsx

Test Suites: 7 passed, 7 total
Tests:       85+ passed, 85+ total
```

### Rapport de couverture
```
File                      | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|---------|--------
geolocation-utils.ts      |   95.2  |   88.5   |   100   |   94.8
location-service.ts       |   91.7  |   85.3   |   95.8  |   90.9
LocationContext.tsx       |   87.3  |   80.2   |   88.9  |   86.7
useLocation.ts            |   100   |   100    |   100   |   100
...
--------------------------|---------|----------|---------|--------
All files                 |   90.1  |   85.7   |   93.2  |   89.5
```

---

## 🧪 Description des tests

### 1. geolocation-utils.test.ts (Utilitaires GPS)

**Ce qui est testé :**
- ✅ Calcul de distance (formule de Haversine)
- ✅ Recherche de ville la plus proche
- ✅ Recherche et filtrage de villes
- ✅ Formatage de distances (km/m)
- ✅ Vérification si dans rayon
- ✅ Permissions de géolocalisation

**Exemple :**
```tsx
it('devrait calculer la distance entre Paris et Lyon', () => {
  const distance = calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);
  expect(distance).toBeGreaterThan(390);
  expect(distance).toBeLessThan(400);
});
```

---

### 2. location-service.test.ts (Service localStorage)

**Ce qui est testé :**
- ✅ Sauvegarde/récupération préférences
- ✅ Expiration du cache (30 jours)
- ✅ Historique des villes (limite 5)
- ✅ Compteur de visites
- ✅ Gestion des favoris
- ✅ Popup de bienvenue
- ✅ Nettoyage des données
- ✅ Ordre de priorité (préférences > dernière ville > défaut)

**Exemple :**
```tsx
it('devrait retourner null si le cache est expiré', () => {
  const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000;
  localStorageMock.setItem('key', JSON.stringify({
    ...data,
    timestamp: oldTimestamp
  }));
  
  const result = getLocationPreferences();
  expect(result).toBeNull();
});
```

---

### 3. useLocation.test.tsx (Hook principal)

**Ce qui est testé :**
- ✅ Initialisation avec ville par défaut
- ✅ Changement de ville
- ✅ Changement de rayon
- ✅ Mise à jour des préférences
- ✅ Gestion des favoris
- ✅ Réinitialisation
- ✅ Persistance localStorage
- ✅ Erreur si hors Provider

**Exemple :**
```tsx
it('devrait changer de ville', async () => {
  const { result } = renderHook(() => useLocation(), { wrapper });
  
  act(() => {
    result.current.changeCity(testCity);
  });
  
  expect(result.current.currentCity?.name).toBe('Paris');
});
```

---

### 4. useCityHistory.test.tsx (Hook historique)

**Ce qui est testé :**
- ✅ Historique vide à l'init
- ✅ Ajout/retrait favoris
- ✅ Toggle favori
- ✅ Tri par date
- ✅ Limite 5 villes récentes
- ✅ Calcul plus visitées
- ✅ Génération suggestions
- ✅ Pas de doublons

**Exemple :**
```tsx
it('devrait toggle une ville favorite', async () => {
  const { result } = renderHook(() => useCityHistory(), { wrapper });
  
  act(() => {
    result.current.toggleFavorite(paris);
  });
  
  expect(result.current.isFavorite('paris')).toBe(true);
  
  act(() => {
    result.current.toggleFavorite(paris);
  });
  
  expect(result.current.isFavorite('paris')).toBe(false);
});
```

---

### 5. LocationIndicator.test.tsx (Badge header)

**Ce qui est testé :**
- ✅ État de chargement
- ✅ Affichage ville + rayon
- ✅ Ouverture sélecteur au clic
- ✅ Classes CSS
- ✅ Icône présente
- ✅ Accessibilité

**Exemple :**
```tsx
it('devrait ouvrir le sélecteur au clic', async () => {
  render(<LocationIndicator />, { wrapper });
  
  const button = screen.getByRole('button', { name: /changer de localisation/i });
  fireEvent.click(button);
  
  expect(screen.getByText(/choisir ma localisation/i)).toBeInTheDocument();
});
```

---

### 6. LocationSelector.test.tsx (Sélecteur complet)

**Ce qui est testé :**
- ✅ Affichage conditionnel (isOpen)
- ✅ Fermeture au clic X
- ✅ Ville actuelle affichée
- ✅ Options de rayon
- ✅ 3 onglets
- ✅ Barre de recherche
- ✅ Filtrage villes
- ✅ Messages si vide
- ✅ Bouton GPS
- ✅ Étoiles favoris
- ✅ Accessibilité

**Exemple :**
```tsx
it('devrait filtrer les villes lors de la recherche', async () => {
  render(<LocationSelector isOpen={true} onClose={mockOnClose} />, { wrapper });
  
  const searchInput = screen.getByPlaceholderText(/rechercher une ville/i);
  fireEvent.change(searchInput, { target: { value: 'Paris' } });
  
  expect(screen.getByText('Paris')).toBeInTheDocument();
});
```

---

### 7. integration.test.tsx (Tests d'intégration)

**Ce qui est testé :**
- ✅ Flux complet changement ville
- ✅ Persistance localStorage
- ✅ Restauration au rechargement
- ✅ Intégration Indicator + Selector
- ✅ Favoris dans sélecteur
- ✅ Construction historique
- ✅ Changement rayon
- ✅ Mode déconnecté
- ✅ Mode connecté
- ✅ Parcours utilisateur complet
- ✅ Gestion erreurs

**Exemple :**
```tsx
it('devrait gérer le parcours complet d\'un nouvel utilisateur', async () => {
  // 1. Première visite
  const { result } = renderHook(() => useLocation(), { wrapper });
  expect(result.current.currentCity?.name).toBe('Dijon');
  
  // 2. Changer de ville
  act(() => result.current.changeCity(paris));
  
  // 3. Ajouter aux favoris
  act(() => result.current.addFavorite(paris));
  
  // 4. Changer le rayon
  act(() => result.current.changeRadius(50));
  
  // 5. Vérifier persistance
  expect(localStorageMock.getItem('envie2sortir_last_city')).toBeTruthy();
});
```

---

## 🐛 Debugging

### Tests qui échouent

1. **Lire l'erreur complètement**
```bash
npm test -- --verbose location
```

2. **Isoler le test**
```bash
npm test -- -t "nom exact du test"
```

3. **Ajouter des logs**
```tsx
console.log('État actuel:', result.current.currentCity);
```

4. **Vérifier les mocks**
```tsx
console.log('localStorage:', localStorageMock.store);
```

### Erreurs communes

#### "Cannot read property 'name' of null"
➡️ Ville pas encore chargée, utiliser `waitFor`
```tsx
await waitFor(() => {
  expect(result.current.currentCity).toBeDefined();
});
```

#### "Element not found"
➡️ Composant pas encore rendu, utiliser `waitFor`
```tsx
await waitFor(() => {
  expect(screen.getByText('Paris')).toBeInTheDocument();
});
```

#### "localStorage is not defined"
➡️ Mock localStorage manquant
```tsx
const localStorageMock = (() => { /* ... */ })();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

#### "Hook must be used within Provider"
➡️ Utiliser le wrapper
```tsx
const wrapper = ({ children }) => (
  <LocationProvider>{children}</LocationProvider>
);
renderHook(() => useLocation(), { wrapper });
```

---

## ✅ Checklist avant PR

- [ ] Tous les tests passent : `npm test location`
- [ ] Couverture > 80% : `npm test -- --coverage location`
- [ ] Linting OK : `npm run lint`
- [ ] Build OK : `npm run build`
- [ ] Tests d'intégration passent : `npm test integration`
- [ ] Nouveaux tests ajoutés pour nouvelles features
- [ ] Documentation mise à jour si nécessaire

---

## 📝 Ajouter de nouveaux tests

### 1. Créer le fichier
```bash
touch src/__tests__/location/mon-nouveau-test.test.tsx
```

### 2. Structure de base
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { LocationProvider } from '@/contexts/LocationContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider>{children}</LocationProvider>
);

describe('MonNouveauTest', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('devrait faire quelque chose', async () => {
    // Arrange
    // ...
    
    // Act
    // ...
    
    // Assert
    await waitFor(() => {
      expect(/* ... */).toBe(/* ... */);
    });
  });
});
```

### 3. Lancer
```bash
npm test mon-nouveau-test
```

---

## 🎯 Bonnes pratiques

### ✅ DO
- Utiliser `waitFor` pour les opérations async
- Nettoyer avec `beforeEach`
- Tester les cas d'erreur
- Tester l'accessibilité
- Utiliser des noms descriptifs
- Mock localStorage
- Wrapper avec Provider

### ❌ DON'T
- Tests sans `waitFor` pour async
- Oublier de nettoyer
- Tests trop longs (découper)
- Tests interdépendants
- Hard-coder des timeouts
- Oublier les cas limites

---

## 📊 Couverture cible

| Fichier | Cible minimale | Cible idéale |
|---------|---------------|--------------|
| Utilitaires | 90% | 95%+ |
| Services | 85% | 90%+ |
| Hooks | 85% | 90%+ |
| Composants | 75% | 85%+ |
| **Global** | **80%** | **90%+** |

---

## 🔄 CI/CD

Les tests sont lancés automatiquement :
- ✅ À chaque push
- ✅ À chaque PR
- ✅ Avant le merge
- ✅ Avant le déploiement

Si les tests échouent, le déploiement est bloqué.

---

## ❓ FAQ

**Q: Combien de temps prennent les tests ?**
R: ~10-30 secondes pour tous les tests de localisation.

**Q: Puis-je skip un test temporairement ?**
R: Oui, avec `it.skip()` mais à éviter en production.

**Q: Comment tester la géolocalisation GPS ?**
R: Utiliser `jest.mock()` pour mocker `navigator.geolocation`.

**Q: Comment tester les API calls ?**
R: Utiliser `jest.mock()` pour mocker `fetch`.

---

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifier cette documentation
2. Consulter les exemples dans `/src/__tests__/location/`
3. Lire les erreurs complètes avec `--verbose`
4. Contacter l'équipe technique

