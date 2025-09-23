"use client";

import { useEffect, useRef, useMemo } from "react";
import Link from "next/link";

// Types pour les établissements
type Establishment = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  activities?: any;
  imageUrl?: string;
  status: string;
};

// Props pour le composant carte
interface MapComponentProps {
  establishments: Establishment[]
  searchCenter?: { lat: number; lng: number };
  searchRadius?: number; // en km
  context?: 'homepage' | 'establishment-detail'; // Contexte pour ajuster la taille des popups
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapComponent({ establishments, searchCenter, searchRadius, context = 'homepage' }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Référence pour la carte

  // Optimisation : éviter les re-renders inutiles
  const memoizedEstablishments = useMemo(() => establishments, [establishments.length, establishments.map(e => e.id).join(',')]);
  const memoizedSearchCenter = useMemo(() => searchCenter, [searchCenter?.lat, searchCenter?.lng]);
  const memoizedSearchRadius = useMemo(() => searchRadius, [searchRadius]);

  // 🎛️ RÉGLAGES FACILES -
  const POPUP_CONFIG = {
    // Base de calcul (en pixels)
    baseWidth: 200,
    baseImageHeight: 80,
    
    // Multiplicateurs par contexte
    multipliers: {
      'homepage': { width: 1.1, image: 0.9 },      // Légèrement plus grand
      'establishment-detail': { width: 0.9, image: 1.1 }  // Plus compact
    }
  };

  // Définir les tailles selon le contexte
  const getPopupSize = () => {
    const config = POPUP_CONFIG.multipliers[context] || POPUP_CONFIG.multipliers.homepage;
    
    const width = Math.round(POPUP_CONFIG.baseWidth * config.width);
    const imageHeight = Math.round(POPUP_CONFIG.baseImageHeight * config.image);
    
    return {
      minWidth: `${width}px`,
      maxWidth: `${width + 40}px`, // +40px pour la marge
      imageHeight: `${imageHeight}px`
    };
  };

  useEffect(() => {
    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // CSS Leaflet
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // JS Leaflet
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.head.appendChild(script);
      } else if (window.L) {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.L) return;

      // Nettoyer l'ancienne carte si elle existe
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const popupSize = getPopupSize();

      // Centre par défaut : Dijon
      const defaultCenter = [47.322, 5.041];
      const defaultRadius = 5; // km

      const centerLat = memoizedSearchCenter?.lat || defaultCenter[0];
      const centerLng = memoizedSearchCenter?.lng || defaultCenter[1];
      const radius = memoizedSearchRadius || defaultRadius;

      // Créer la carte
      const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map; // Stocker la référence

      // Ajouter les tuiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Filtrer les établissements avec coordonnées
      const establishmentsWithCoords = memoizedEstablishments.filter(e => e.latitude && e.longitude);
      
      console.log(`${establishmentsWithCoords.length} résultats trouvés - Ajustement de la vue pour inclure le cercle de ${radius}km avec padding 15%`);

      // Ajouter le cercle de recherche si on a un centre et un rayon
      if (memoizedSearchCenter && memoizedSearchRadius) {
        console.log(`🗺️ Création du cercle: Centre [${centerLat}, ${centerLng}], Rayon: ${radius}km (${radius * 1000}m)`);
        const circle = window.L.circle([centerLat, centerLng], {
          color: '#ff751f',
          fillColor: '#ff751f',
          fillOpacity: 0.1,
          radius: radius * 1000 // convertir en mètres
        }).addTo(map);
        console.log(`✅ Cercle créé et ajouté à la carte`);
      } else {
        console.log(`❌ Pas de cercle: searchCenter=${JSON.stringify(memoizedSearchCenter)}, searchRadius=${memoizedSearchRadius}`);
      }
        // Ajouter un petit point central pour montrer le centre de recherche
        const centerIcon = window.L.divIcon({
          html: `
            <div class="w-3 h-3 bg-orange-600 rounded-full border border-white shadow-lg relative">
              <div class="absolute inset-0 bg-black opacity-20 rounded-full blur-sm transform translate-x-0.5 translate-y-0.5"></div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        window.L.marker([centerLat, centerLng], {
          icon: centerIcon
        }).addTo(map);
      establishments.forEach((establishment) => {
        // Vérifier que l'établissement a des coordonnées
        if (!establishment.latitude || !establishment.longitude) return;

        // Extraire les activités pour l'affichage
        let activitiesText = '';
        if (establishment.activities && Array.isArray(establishment.activities)) {
          activitiesText = establishment.activities.join(', ');
        }

        // Créer un marqueur personnalisé avec l'icône PNG
        const establishmentIcon = window.L.divIcon({
          html: `
            <div class="w-10 h-10 flex items-center justify-center">
              <img src="/localisé_4.png" alt="Marqueur" class="w-full h-full object-contain">
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [32, 32],
          iconAnchor: [12, 24]
        });

        const marker = window.L.marker([establishment.latitude, establishment.longitude], {
          icon: establishmentIcon
        })
          .addTo(map)
          .bindPopup(`
            <div class="p-3" style="min-width: ${popupSize.minWidth}; max-width: ${popupSize.maxWidth};">
              ${establishment.imageUrl ? `
                <div class="mb-3 w-full bg-gray-100 rounded-lg overflow-hidden" style="height: ${popupSize.imageHeight};">
                  <img src="${establishment.imageUrl}" alt="${establishment.name}" class="w-full h-full object-cover">
                </div>
              ` : `
                <div class="mb-3 w-full bg-gray-100 rounded-lg flex items-center justify-center" style="height: ${popupSize.imageHeight};">
                  <span class="text-gray-400 text-sm">Aucune image</span>
                </div>
              `}
              <h3 class="font-bold text-lg text-gray-900 mb-1">${establishment.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${establishment.address}${establishment.city ? `, ${establishment.city}` : ''}</p>
              <p class="text-xs text-gray-500 mb-2">${activitiesText} • ${establishment.status}</p>
              <a href="/etablissements/${establishment.slug}?from=carte" class="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm">
                Voir détails →
              </a>
            </div>
          `);
      });

      // Ajuster la vue pour que le cercle de recherche soit entièrement visible
      // Cette approche garantit que tous les résultats dans le rayon sont visibles
      
      // Calculer les bounds du cercle de recherche
      const radiusInDegrees = radius / 111; // Approximation : 1 degré ≈ 111 km (utiliser le rayon réel)
      const circleBounds = window.L.latLngBounds([
        [centerLat - radiusInDegrees, centerLng - radiusInDegrees],
        [centerLat + radiusInDegrees, centerLng + radiusInDegrees]
      ]);
      
      // Ajouter tous les établissements trouvés aux bounds
      establishmentsWithCoords.forEach(e => {
        circleBounds.extend([e.latitude!, e.longitude!]);
      });
      
      // Ajuster la vue pour inclure le cercle complet avec un padding
      map.fitBounds(circleBounds.pad(0.15)); // 15% de padding pour une vue confortable
      
      console.log(`${establishmentsWithCoords.length} résultats trouvés - Ajustement de la vue pour inclure le cercle de ${defaultRadius}km avec padding 15%`);
    };

    loadLeaflet();

    // Fonction de nettoyage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [memoizedEstablishments, memoizedSearchCenter, memoizedSearchRadius, context]);

  return <div ref={mapRef} className="w-full h-full" />;
}
