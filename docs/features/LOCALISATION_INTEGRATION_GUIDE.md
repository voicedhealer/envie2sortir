# 🔧 Guide d'intégration du système de localisation

Ce guide détaille les modifications à apporter aux composants existants pour intégrer le système de localisation.

## 📋 Checklist d'intégration

- [ ] Migrer la base de données Prisma
- [ ] Wrapper l'app avec LocationProvider
- [ ] Ajouter LocationIndicator dans le header
- [ ] Ajouter LocationModal sur la homepage
- [ ] Adapter EventsCarousel
- [ ] Adapter DailyDealsCarousel  
- [ ] Adapter MapComponent
- [ ] Mettre à jour les APIs pour accepter les paramètres de localisation
- [ ] Tester le système complet

---

## 1️⃣ Migration de la base de données

```bash
# Générer la migration
npx prisma migrate dev --name add_location_preferences

# Générer le client Prisma
npx prisma generate
```

---

## 2️⃣ Wrapper l'application avec LocationProvider

**Fichier: `src/app/layout.tsx`**

```tsx
import { LocationProvider } from '@/contexts/LocationContext';
import { getUserSession } from '@/lib/auth'; // Votre fonction d'auth

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérifier si l'utilisateur est authentifié
  const session = await getUserSession();
  const isAuthenticated = !!session?.user;

  return (
    <html lang="fr">
      <body>
        <LocationProvider isAuthenticated={isAuthenticated}>
          {/* Votre contenu existant */}
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
```

---

## 3️⃣ Ajouter le badge dans la navigation

**Fichier: `src/app/navigation.tsx`**

```tsx
import LocationIndicator from '@/components/LocationIndicator';

export default function Navigation() {
  return (
    <nav className="flex items-center justify-between p-4">
      {/* Logo */}
      <div>Logo</div>

      {/* Navigation links */}
      <div className="flex items-center gap-4">
        <Link href="/">Accueil</Link>
        <Link href="/carte">Carte</Link>
        <Link href="/evenements">Événements</Link>
        
        {/* 📍 NOUVEAU: Badge de localisation */}
        <LocationIndicator />
        
        {/* Autres éléments (connexion, etc.) */}
      </div>
    </nav>
  );
}
```

---

## 4️⃣ Ajouter le modal de bienvenue

**Fichier: `src/app/page.tsx`**

Ajouter le composant au début de la page d'accueil :

```tsx
import LocationModal from '@/components/LocationModal';

export default function Home() {
  return (
    <main>
      {/* 🆕 Modal de bienvenue pour la localisation */}
      <LocationModal />
      
      {/* Hero section */}
      <section className="hero">
        {/* Votre contenu existant */}
      </section>

      {/* Reste de la page */}
    </main>
  );
}
```

---

## 5️⃣ Adapter EventsCarousel

**Fichier: `src/components/EventsCarousel.tsx`**

### Modifications à apporter :

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { isWithinRadius } from '@/lib/geolocation-utils';

export default function EventsCarousel() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // 🆕 Ajouter le hook de localisation
  const { currentCity, searchRadius, loading: locationLoading } = useLocation();

  // Charger tous les événements
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    // Charger TOUS les événements (on filtrera côté client)
    const response = await fetch('/api/events/upcoming');
    const data = await response.json();
    setAllEvents(data.events || []);
  };

  // 🆕 Filtrer par localisation + filtre temporel
  const filteredEvents = useMemo(() => {
    let events = allEvents;

    // Filtre de localisation
    if (currentCity && searchRadius) {
      events = events.filter(event => {
        const establishment = event.establishment;
        
        // Si l'établissement a des coordonnées GPS
        if (establishment.latitude && establishment.longitude) {
          return isWithinRadius(
            establishment.latitude,
            establishment.longitude,
            currentCity,
            searchRadius
          );
        }
        
        // Sinon, comparer par nom de ville
        return establishment.city?.toLowerCase() === currentCity.name.toLowerCase();
      });
    }

    // Filtre temporel (votre logique existante)
    const now = new Date();
    if (filter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      events = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= todayStart && eventDate <= todayEnd;
      });
    } else if (filter === 'week') {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      events = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate <= weekEnd;
      });
    }
    // ... autres filtres

    return events;
  }, [allEvents, filter, currentCity, searchRadius]);

  if (locationLoading) {
    return <div>Chargement de votre localisation...</div>;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 🆕 En-tête avec indication de localisation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">
              🎉 Événements à venir
            </h2>
            {currentCity && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                📍 {currentCity.name} • {searchRadius}km
              </span>
            )}
          </div>

          {/* Vos filtres existants */}
          <div className="flex gap-2">
            <button onClick={() => setFilter('today')}>Aujourd'hui</button>
            {/* ... autres filtres */}
          </div>
        </div>

        {/* 🆕 Message si aucun événement trouvé */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Aucun événement trouvé près de {currentCity?.name}
            </p>
            <button 
              onClick={() => {/* Ouvrir le sélecteur */}}
              className="text-orange-600 hover:underline"
            >
              Changer de ville
            </button>
          </div>
        ) : (
          <>
            {/* Badge de résultats */}
            <p className="text-sm text-gray-500 mb-4">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} 
              {' '}trouvé{filteredEvents.length > 1 ? 's' : ''} dans un rayon de {searchRadius}km
            </p>

            {/* Votre carrousel existant */}
            <div className="overflow-x-auto">
              {filteredEvents.map(event => (
                <div key={event.id}>
                  {/* Votre EventCard existante */}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
```

---

## 6️⃣ Adapter DailyDealsCarousel

**Fichier: `src/components/DailyDealsCarousel.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useLocation } from '@/hooks/useLocation';

export default function DailyDealsCarousel() {
  const [deals, setDeals] = useState([]);
  const { currentCity, searchRadius } = useLocation();

  useEffect(() => {
    if (currentCity) {
      fetchDeals();
    }
  }, [currentCity, searchRadius]);

  const fetchDeals = async () => {
    // 🆕 Passer la localisation à l'API
    const params = new URLSearchParams({
      city: currentCity?.name || '',
      radius: searchRadius?.toString() || '20',
    });

    const response = await fetch(`/api/deals/active?${params}`);
    const data = await response.json();
    setDeals(data.deals || []);
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-3xl font-bold">
            🎯 Bons Plans du Jour
          </h2>
          {currentCity && (
            <span className="text-sm text-gray-500">
              près de {currentCity.name}
            </span>
          )}
        </div>

        {/* Carrousel des bons plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map(deal => (
            <DailyDealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {deals.length === 0 && (
          <p className="text-center text-gray-500">
            Aucun bon plan disponible près de {currentCity?.name} aujourd'hui
          </p>
        )}
      </div>
    </section>
  );
}
```

---

## 7️⃣ Adapter MapComponent

**Fichier: `src/app/carte/map-component.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useLocation } from '@/hooks/useLocation';

export default function MapComponent({ establishments }: { establishments: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { currentCity, searchRadius } = useLocation();

  useEffect(() => {
    if (!mapRef.current || !currentCity) return;

    // 🆕 Centrer la carte sur la ville actuelle
    const map = L.map(mapRef.current).setView(
      [currentCity.latitude, currentCity.longitude], 
      13
    );

    // Ajouter les tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // 🆕 Ajouter le cercle de rayon
    L.circle([currentCity.latitude, currentCity.longitude], {
      color: '#ff751f',
      fillColor: '#ff751f',
      fillOpacity: 0.1,
      radius: searchRadius * 1000, // convertir en mètres
    }).addTo(map);

    // Filtrer et afficher seulement les établissements dans le rayon
    const nearbyEstablishments = establishments.filter(e => {
      if (!e.latitude || !e.longitude) return false;
      
      const distance = calculateDistance(
        e.latitude,
        e.longitude,
        currentCity.latitude,
        currentCity.longitude
      );
      
      return distance <= searchRadius;
    });

    // Ajouter les marqueurs
    nearbyEstablishments.forEach(establishment => {
      L.marker([establishment.latitude, establishment.longitude])
        .addTo(map)
        .bindPopup(establishment.name);
    });

    return () => {
      map.remove();
    };
  }, [currentCity, searchRadius, establishments]);

  return (
    <div className="relative">
      {/* 🆕 Indicateur de localisation */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">
          📍 {currentCity?.name || 'Chargement...'}
        </p>
        <p className="text-xs text-gray-500">
          Rayon: {searchRadius}km
        </p>
      </div>

      <div ref={mapRef} className="w-full h-[600px]" />
    </div>
  );
}
```

---

## 8️⃣ Adapter les APIs

### API Deals actifs

**Fichier: `src/app/api/deals/active/route.ts`**

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDistance } from '@/lib/geolocation-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 🆕 Récupérer les paramètres de localisation
  const city = searchParams.get('city');
  const radius = parseInt(searchParams.get('radius') || '20');

  // Récupérer tous les deals actifs
  const deals = await prisma.dailyDeal.findMany({
    where: { isActive: true },
    include: {
      establishment: {
        select: {
          name: true,
          city: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  // 🆕 Filtrer par localisation si fournie
  let filteredDeals = deals;
  
  if (city) {
    filteredDeals = deals.filter(deal => {
      // Comparer par nom de ville
      if (deal.establishment.city?.toLowerCase() === city.toLowerCase()) {
        return true;
      }

      // Ou par distance si coordonnées disponibles
      if (deal.establishment.latitude && deal.establishment.longitude) {
        // TODO: calculer la distance avec les coordonnées de la ville
        return true;
      }

      return false;
    });
  }

  return NextResponse.json({
    deals: filteredDeals,
    count: filteredDeals.length,
  });
}
```

### API Événements

**Fichier: `src/app/api/events/upcoming/route.ts`**

Similaire à l'API deals, ajouter les paramètres `city` et `radius`.

---

## 9️⃣ Tests

### Test manuel

1. **Premier chargement :**
   - Vérifier que le modal de bienvenue s'affiche
   - Autoriser/refuser la géolocalisation
   - Vérifier que la ville est bien détectée

2. **Changement de ville :**
   - Cliquer sur le badge de localisation
   - Changer de ville
   - Vérifier que tous les composants se mettent à jour

3. **Persistance :**
   - Rafraîchir la page
   - Vérifier que la ville est toujours la même
   - Se connecter/déconnecter
   - Vérifier la synchronisation

4. **Historique et favoris :**
   - Visiter plusieurs villes
   - Vérifier que l'historique se construit
   - Ajouter/retirer des favoris

### Tests automatisés (à créer)

```tsx
// tests/location-system.test.ts
describe('Location System', () => {
  it('should detect user location', async () => {
    // Test de détection
  });

  it('should filter events by location', () => {
    // Test de filtrage
  });

  it('should save preferences', async () => {
    // Test de persistance
  });
});
```

---

## 🎉 Résultat final

Après l'intégration, les utilisateurs pourront :

1. ✅ Voir leur ville actuelle dans le header
2. ✅ Changer facilement de ville et rayon
3. ✅ Voir uniquement les événements/bons plans près d'eux
4. ✅ Avoir leurs préférences sauvegardées
5. ✅ Utiliser l'historique et les favoris
6. ✅ Voir la carte centrée sur leur ville

---

## 🐛 Dépannage

### Le modal ne s'affiche pas
- Vérifier que `LocationModal` est bien dans `page.tsx`
- Vérifier localStorage : `localStorage.removeItem('envie2sortir_location_popup_shown')`

### La ville ne se met pas à jour
- Vérifier que le composant est bien dans le `LocationProvider`
- Vérifier la console pour les erreurs
- Vérifier que `useLocation()` est appelé

### Problèmes de performance
- Utiliser `useMemo` pour les calculs de distance
- Limiter le nombre d'établissements affichés
- Implémenter la pagination

---

## 📞 Support

Pour toute question sur l'intégration, contactez l'équipe technique.

