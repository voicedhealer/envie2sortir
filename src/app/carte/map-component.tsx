"use client";

import { useEffect, useRef } from "react";
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
  establishments: Establishment[];
  searchCenter?: { lat: number; lng: number };
  searchRadius?: number; // en km
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapComponent({ establishments, searchCenter, searchRadius }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = window.L;
      
      // Centrer sur le point de recherche ou Dijon par défaut
      const centerLat = searchCenter?.lat || 47.322;
      const centerLng = searchCenter?.lng || 5.041;
      const defaultRadius = searchRadius || 5; // Rayon par défaut de 5km

      // Initialiser la carte avec un zoom par défaut (sera ajusté par fitBounds)
      const establishmentsWithCoords = establishments.filter(e => e.latitude && e.longitude);
      const numResults = establishmentsWithCoords.length;
      
      const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // Ajouter la couche OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Ajouter le cercle de recherche (toujours affiché)
      L.circle([centerLat, centerLng], {
        radius: defaultRadius * 1000, // conversion km → mètres
        fillColor: "#ff751f",
        fillOpacity: 0.08, // Plus subtil
        color: "#ff751f",
        weight: 2,
        dashArray: "8, 4", // Pointillés plus espacés
        className: "search-radius-circle"
      }).addTo(map);

      // Ajouter un marqueur central pour le point de recherche
      L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: 'search-center-marker',
          html: `
            <div style="
              background-color: #ff751f; 
              width: 16px; 
              height: 16px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.6);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 6px;
                height: 6px;
                background-color: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);

      // Ajouter les marqueurs pour chaque établissement avec coordonnées
      establishments.forEach((establishment) => {
        // Vérifier que l'établissement a des coordonnées
        if (!establishment.latitude || !establishment.longitude) {
          console.warn(`Établissement ${establishment.name} sans coordonnées`);
          return;
        }

        // Formater les activités
        const activitiesText = establishment.activities && Array.isArray(establishment.activities) 
          ? establishment.activities.slice(0, 2).map((a: string) => a.replace(/_/g, " ")).join(", ")
          : "Activités non définies";

        // Créer un marqueur personnalisé pour l'établissement
        const establishmentIcon = L.divIcon({
          className: 'establishment-marker',
          html: `
            <div style="
              background-color: #3b82f6; 
              width: 24px; 
              height: 24px; 
              border-radius: 50% 50% 50% 0; 
              border: 3px solid white; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              transform: rotate(-45deg);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                color: white;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                line-height: 1;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        });

        const marker = L.marker([establishment.latitude, establishment.longitude], {
          icon: establishmentIcon
        })
          .addTo(map)
          .bindPopup(`
            <div class="p-3 min-w-[200px]">
              ${establishment.imageUrl ? `
                <div class="mb-3">
                  <img src="${establishment.imageUrl}" alt="${establishment.name}" class="w-full h-24 object-cover rounded-lg">
                </div>
              ` : ''}
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
      const radiusInDegrees = defaultRadius / 111; // Approximation : 1 degré ≈ 111 km
      const circleBounds = L.latLngBounds([
        [centerLat - radiusInDegrees, centerLng - radiusInDegrees],
        [centerLat + radiusInDegrees, centerLng + radiusInDegrees]
      ]);
      
      // Ajouter tous les établissements trouvés aux bounds
      establishmentsWithCoords.forEach(e => {
        circleBounds.extend([e.latitude!, e.longitude!]);
      });
      
      // Ajuster la vue pour inclure le cercle complet avec un padding
      map.fitBounds(circleBounds.pad(0.15)); // 15% de padding pour une vue confortable
      
      console.log(`📍 ${numResults} résultats trouvés - Ajustement de la vue pour inclure le cercle de ${defaultRadius}km avec padding 15%`);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [establishments, searchCenter, searchRadius]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
