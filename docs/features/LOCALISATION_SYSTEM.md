# 📍 Système de Localisation Utilisateur

## Vue d'ensemble

Le système de localisation permet aux utilisateurs de choisir leur ville et rayon de recherche pour personnaliser leur expérience sur la plateforme Envie2Sortir.

## 🎯 Fonctionnalités

### Pour les utilisateurs
- ✅ Détection automatique de la localisation (GPS + fallback IP)
- ✅ Sélection manuelle de ville
- ✅ Gestion de l'historique des villes visitées (5 dernières)
- ✅ Villes favorites avec système d'étoiles
- ✅ Choix du rayon de recherche (10km, 20km, 50km, 100km)
- ✅ Persistance multi-device pour utilisateurs connectés
- ✅ localStorage pour utilisateurs non-connectés
- ✅ Popup de bienvenue au premier chargement

### Modes de fonctionnement
1. **Auto** : Utilise toujours la position GPS actuelle
2. **Manual** : Utilise la ville par défaut enregistrée
3. **Ask** : Demande à chaque fois

## 🏗️ Architecture

```
src/
├── types/location.ts              # Types TypeScript
├── lib/
│   ├── geolocation-utils.ts       # Utilitaires GPS
│   └── location-service.ts        # Service localStorage/API
├── contexts/
│   └── LocationContext.tsx        # Context React global
├── hooks/
│   ├── useLocation.ts             # Hook principal
│   ├── useGeolocation.ts          # Hook GPS
│   └── useCityHistory.ts          # Hook historique
├── components/
│   ├── LocationModal.tsx          # Modal première visite
│   ├── LocationIndicator.tsx      # Badge header
│   └── LocationSelector.tsx       # Sélecteur complet
└── app/api/user/location-preferences/
    └── route.ts                   # API endpoints
```

## 🚀 Installation

### 1. Migration de la base de données

```bash
npx prisma migrate dev --name add_location_preferences
```

### 2. Wrapper l'application avec LocationProvider

**src/app/layout.tsx** :
```tsx
import { LocationProvider } from '@/contexts/LocationContext';

export default function RootLayout({ children }) {
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = /* votre logique */;

  return (
    <html>
      <body>
        <LocationProvider isAuthenticated={isAuthenticated}>
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
```

### 3. Ajouter le badge dans le header

**src/app/navigation.tsx** :
```tsx
import LocationIndicator from '@/components/LocationIndicator';

export default function Navigation() {
  return (
    <nav>
      {/* Vos autres éléments */}
      <LocationIndicator />
    </nav>
  );
}
```

### 4. Ajouter le modal de bienvenue

**src/app/page.tsx** :
```tsx
import LocationModal from '@/components/LocationModal';

export default function Home() {
  return (
    <>
      <LocationModal />
      {/* Votre contenu */}
    </>
  );
}
```

## 📖 Utilisation dans les composants

### Hook useLocation

```tsx
import { useLocation } from '@/hooks/useLocation';

function MyComponent() {
  const { 
    currentCity,        // Ville actuelle
    searchRadius,       // Rayon en km
    loading,            // État de chargement
    changeCity,         // Changer de ville
    changeRadius,       // Changer le rayon
    detectMyLocation,   // Détecter la position GPS
  } = useLocation();

  // Utiliser la ville actuelle pour filtrer
  const filteredEvents = events.filter(event => 
    event.city === currentCity?.name
  );

  return (
    <div>
      <p>Ville : {currentCity?.name}</p>
      <p>Rayon : {searchRadius}km</p>
    </div>
  );
}
```

### Hook useCityHistory

```tsx
import { useCityHistory } from '@/hooks/useCityHistory';

function CitySelector() {
  const {
    recentCities,       // 5 dernières villes
    favorites,          // Villes favorites
    isFavorite,         // Vérifier si favori
    toggleFavorite,     // Toggle favori
  } = useCityHistory();

  return (
    <div>
      {recentCities.map(historyItem => (
        <div key={historyItem.city.id}>
          {historyItem.city.name}
          <button onClick={() => toggleFavorite(historyItem.city)}>
            {isFavorite(historyItem.city.id) ? '⭐' : '☆'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Intégration dans les composants existants

### EventsCarousel

```tsx
import { useLocation } from '@/hooks/useLocation';
import { isWithinRadius } from '@/lib/geolocation-utils';

function EventsCarousel() {
  const { currentCity, searchRadius } = useLocation();
  const [allEvents, setAllEvents] = useState([]);

  // Filtrer les événements selon la localisation
  const filteredEvents = useMemo(() => {
    if (!currentCity) return allEvents;

    return allEvents.filter(event => {
      // Si l'événement a des coordonnées
      if (event.establishment.latitude && event.establishment.longitude) {
        return isWithinRadius(
          event.establishment.latitude,
          event.establishment.longitude,
          currentCity,
          searchRadius
        );
      }

      // Sinon, comparer par nom de ville
      return event.establishment.city === currentCity.name;
    });
  }, [allEvents, currentCity, searchRadius]);

  return (
    <section>
      <h2>
        🎉 Événements près de {currentCity?.name} 
        <span className="text-sm">({filteredEvents.length} résultats)</span>
      </h2>
      {/* Afficher les événements filtrés */}
    </section>
  );
}
```

### DailyDealsCarousel

```tsx
import { useLocation } from '@/hooks/useLocation';

function DailyDealsCarousel() {
  const { currentCity, searchRadius } = useLocation();

  // Passer la ville et le rayon à l'API
  const fetchDeals = async () => {
    const params = new URLSearchParams({
      city: currentCity?.name || 'Dijon',
      radius: searchRadius.toString(),
    });
    
    const response = await fetch(`/api/deals/active?${params}`);
    const data = await response.json();
    return data.deals;
  };

  // ... reste du composant
}
```

### MapComponent

```tsx
import { useLocation } from '@/hooks/useLocation';

function MapComponent() {
  const { currentCity, searchRadius } = useLocation();

  useEffect(() => {
    if (currentCity) {
      // Centrer la carte sur la ville actuelle
      map.setView([currentCity.latitude, currentCity.longitude], 13);
      
      // Ajouter le cercle de rayon
      L.circle([currentCity.latitude, currentCity.longitude], {
        radius: searchRadius * 1000, // convertir en mètres
        color: '#ff751f',
      }).addTo(map);
    }
  }, [currentCity, searchRadius]);

  // ... reste du composant
}
```

## 🎨 Personnalisation

### Modifier les villes disponibles

**src/types/location.ts** :
```tsx
export const MAJOR_FRENCH_CITIES: City[] = [
  // Ajouter/modifier vos villes ici
  { 
    id: 'ma-ville', 
    name: 'Ma Ville', 
    latitude: 48.0, 
    longitude: 2.0,
    region: 'Ma Région' 
  },
];
```

### Modifier les rayons disponibles

**src/types/location.ts** :
```tsx
export const SEARCH_RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
];
```

## 🔐 Sécurité & RGPD

- ✅ Demande de permission avant géolocalisation GPS
- ✅ Données anonymisées pour utilisateurs non-connectés
- ✅ Possibilité de refuser la géolocalisation
- ✅ Données stockées uniquement avec consentement
- ✅ Suppression facile des données (clearLocationData())

## 📊 Analytics

Pour tracker l'utilisation :

```tsx
import { trackEvent } from '@/lib/analytics';

// Lors du changement de ville
trackEvent('location_changed', {
  city: city.name,
  method: 'manual' // ou 'gps', 'ip'
});

// Lors du changement de rayon
trackEvent('radius_changed', {
  radius: radius,
  city: currentCity.name
});
```

## 🐛 Debug

Activer les logs :
```tsx
localStorage.setItem('debug_location', 'true');
```

Nettoyer toutes les données :
```tsx
import { clearLocationData } from '@/lib/location-service';
clearLocationData();
```

## 🚧 Prochaines étapes

- [ ] Ajouter plus de villes françaises
- [ ] Implémenter le mode "toute la France"
- [ ] Ajouter des notifications de nouveaux événements dans la ville
- [ ] Intégrer avec le système de recommandations
- [ ] Ajouter des filtres avancés (par type d'établissement)
- [ ] Créer une page dédiée aux statistiques de localisation (admin)

## ❓ FAQ

**Q: Que se passe-t-il si l'utilisateur refuse la géolocalisation ?**
R: Le système utilise un fallback par IP, puis la dernière ville visitée, et enfin Dijon par défaut.

**Q: Les préférences sont-elles synchronisées entre appareils ?**
R: Oui, si l'utilisateur est connecté. Sinon, elles sont stockées en localStorage par appareil.

**Q: Comment tester le système sans GPS ?**
R: Utilisez le mode manuel ou modifiez temporairement DEFAULT_CITY dans location.ts.

**Q: Puis-je désactiver le popup de bienvenue ?**
R: Oui, il ne s'affiche qu'une fois. Pour le réafficher en dev : `localStorage.removeItem('envie2sortir_location_popup_shown')`.

