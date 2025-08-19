"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Types pour les établissements
type Establishment = {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
};

declare global {
  interface Window {
    L: any;
  }
}

export default function MapComponent({ establishments }: { establishments: Establishment[] }) {
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
      
      // Centrer sur Dijon par défaut
      const centerLat = 47.322;
      const centerLng = 5.041;

      const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // Ajouter la couche OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Ajouter les marqueurs pour chaque établissement
      establishments.forEach((establishment) => {
        const marker = L.marker([establishment.latitude, establishment.longitude])
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${establishment.name}</h3>
              <p class="text-sm text-gray-600">${establishment.address}</p>
              <p class="text-xs text-gray-500">${establishment.category} • ${establishment.status}</p>
              <a href="/etablissements/${establishment.slug}" class="text-blue-600 hover:underline text-sm">
                Voir détails →
              </a>
            </div>
          `);
      });

      // Ajuster la vue si des établissements existent
      if (establishments.length > 0) {
        const group = new L.featureGroup(
          establishments.map(e => L.latLng(e.latitude, e.longitude))
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
  }, [establishments]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
