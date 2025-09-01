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

      const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // Ajouter la couche OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Ajouter le cercle de recherche si rayon défini
      if (searchCenter && searchRadius) {
        L.circle([searchCenter.lat, searchCenter.lng], {
          radius: searchRadius * 1000, // conversion km → mètres
          fillColor: "#ff751f",
          fillOpacity: 0.1,
          color: "#ff751f",
          weight: 2
        }).addTo(map);
      }

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

        const marker = L.marker([establishment.latitude, establishment.longitude])
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${establishment.name}</h3>
              <p class="text-sm text-gray-600">${establishment.address}${establishment.city ? `, ${establishment.city}` : ''}</p>
              <p class="text-xs text-gray-500">${activitiesText} • ${establishment.status}</p>
              <a href="/etablissements/${establishment.slug}" class="text-blue-600 hover:underline text-sm">
                Voir détails →
              </a>
            </div>
          `);
      });

      // Ajuster la vue pour inclure le cercle et les établissements
      const establishmentsWithCoords = establishments.filter(e => e.latitude && e.longitude);
      
      if (searchCenter && searchRadius && establishmentsWithCoords.length > 0) {
        // Créer un groupe avec le cercle et les établissements
        const bounds = L.latLngBounds([
          [searchCenter.lat - (searchRadius / 111), searchCenter.lng - (searchRadius / 111)],
          [searchCenter.lat + (searchRadius / 111), searchCenter.lng + (searchRadius / 111)]
        ]);
        
        // Ajouter les établissements aux bounds
        establishmentsWithCoords.forEach(e => {
          bounds.extend([e.latitude!, e.longitude!]);
        });
        
        map.fitBounds(bounds.pad(0.1));
      } else if (establishmentsWithCoords.length > 0) {
        // Fallback : ajuster seulement sur les établissements
        const group = new L.featureGroup(
          establishmentsWithCoords.map(e => L.latLng(e.latitude!, e.longitude!))
        );
        map.fitBounds(group.getBounds().pad(0.1));
      }
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
