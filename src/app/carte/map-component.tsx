"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { useLocation } from "@/hooks/useLocation";

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
  images?: Array<{
    url: string;
    isCardImage: boolean;
  }>;
  status: string;
  avgRating?: number | null;
  googleRating?: number | null;
  prixMoyen?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  events?: Array<{
    title: string;
    startDate: Date | string;
    endDate?: Date | string | null;
  }>;
  comments?: Array<{
    content: string;
    rating: number;
  }>;
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
    mapFavoriteHandlers?: {
      favorites: Set<string>;
      isAuthenticated: boolean;
      checkFavorites(): Promise<void>;
      toggleFavorite(establishmentId: string, heartElement: HTMLElement): Promise<void>;
    };
  }
}

export default function MapComponent({ establishments, searchCenter, searchRadius, context = 'homepage' }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Référence pour la carte
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // 📍 Hook de localisation (utilisé comme fallback si pas de props)
  const { currentCity, searchRadius: userRadius } = useLocation();

  // Utiliser searchCenter/searchRadius des props OU la localisation utilisateur
  const effectiveCenter = searchCenter || (currentCity ? { lat: currentCity.latitude, lng: currentCity.longitude } : null);
  const effectiveRadius = searchRadius || userRadius;

  // Optimisation : éviter les re-renders inutiles
  const memoizedEstablishments = useMemo(() => establishments, [establishments.length, establishments.map(e => e.id).join(',')]);
  const memoizedSearchCenter = useMemo(() => effectiveCenter, [effectiveCenter?.lat, effectiveCenter?.lng]);
  const memoizedSearchRadius = useMemo(() => effectiveRadius, [effectiveRadius]);

  // Écouter les événements d'authentification depuis la carte
  useEffect(() => {
    const handleAuthRequired = () => {
      setShowAuthModal(true);
    };

    const handleFavoriteChanged = (event: CustomEvent) => {
      const { establishmentId, isFavorite } = event.detail;
      
      // Mettre à jour l'état des favoris dans le MapComponent
      if (window.mapFavoriteHandlers?.favorites) {
        if (isFavorite) {
          window.mapFavoriteHandlers.favorites.add(establishmentId);
        } else {
          window.mapFavoriteHandlers.favorites.delete(establishmentId);
        }
        
        // Forcer la mise à jour visuelle de tous les popups (ouverts ou fermés)
        if (window.mapInstance) {
          window.mapInstance.eachLayer((layer: any) => {
            if (layer.getPopup) {
              const popup = layer.getPopup();
              if (!popup) return; // Ignorer si pas de popup
              
              const content = popup.getContent();
              
              if (content && content.includes(establishmentId)) {
                const popupElement = popup.getElement();
                
                if (popupElement) {
                  const heartContainer = popupElement.querySelector('.popup-heart-icon');
                  
                  if (heartContainer) {
                    const heartElement = heartContainer.querySelector('svg');
                    
                    if (heartElement) {
                      if (isFavorite) {
                        // État favori : cœur rouge plein
                        heartElement.setAttribute('fill', '#ef4444');
                        heartElement.setAttribute('stroke', '#ef4444');
                        heartContainer.classList.add('is-favorite');
                      } else {
                        // État non-favori : cœur blanc avec contour
                        heartElement.setAttribute('fill', 'none');
                        heartElement.setAttribute('stroke', 'currentColor');
                        heartContainer.classList.remove('is-favorite');
                      }
                    }
                  }
                }
              }
            }
          });
        }
      }
    };

    window.addEventListener('map-auth-required', handleAuthRequired);
    window.addEventListener('favorite-changed', handleFavoriteChanged as EventListener);
    return () => {
      window.removeEventListener('map-auth-required', handleAuthRequired);
      window.removeEventListener('favorite-changed', handleFavoriteChanged as EventListener);
    };
  }, []);

  const handleAuthConfirm = () => {
    setShowAuthModal(false);
    window.location.href = '/auth?redirect=/carte';
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  // 🎛️ RÉGLAGES FACILES - Design inspiré de TheFork
  const POPUP_CONFIG = {
    // Base de calcul (en pixels) - Design premium
    baseWidth: 240,
    baseImageHeight: 140,
    
    // Multiplicateurs par contexte
    multipliers: {
      'homepage': { width: 1.0, image: 1.0 },      // Standard
      'establishment-detail': { width: 0.9, image: 1.1 }  // Légèrement plus compact
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

        // CSS personnalisé pour les popups style TheFork avec icône cœur
        const customStyle = document.createElement("style");
        customStyle.innerHTML = `
          /* Style de la popup */
          .leaflet-popup-content-wrapper {
            padding: 0 !important;
            border-radius: 12px !important;
            overflow: hidden;
          }
          .leaflet-popup-content {
            margin: 0 !important;
          }
          /* Cacher le bouton de fermeture par défaut de Leaflet */
          .leaflet-popup-close-button {
            display: none !important;
          }
          .leaflet-popup-tip-container {
            margin-top: -1px;
          }
          /* Style du cœur like - version discrète */
          .popup-heart-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(4px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.2s;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          }
          .popup-heart-icon:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.1);
          }
          .popup-heart-icon svg {
            width: 16px;
            height: 16px;
            stroke: #ef4444;
            stroke-width: 2;
            transition: fill 0.2s;
          }
          .popup-heart-icon.is-favorite svg {
            fill: #ef4444;
          }
          .popup-heart-icon.is-loading {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `;
        document.head.appendChild(customStyle);

        // Ajouter les fonctions globales pour gérer les favoris depuis les popups
        if (!window.mapFavoriteHandlers) {
          window.mapFavoriteHandlers = {
            favorites: new Set<string>(), // Set des IDs en favoris
            isAuthenticated: false,
            
            async checkFavorites() {
              try {
                const response = await fetch('/api/user/favorites');
                if (response.ok) {
                  const data = await response.json();
                  this.favorites = new Set(data.favorites.map((fav: any) => fav.establishment.id));
                  this.isAuthenticated = true;
                } else if (response.status === 401 || response.status === 403) {
                  // Utilisateur non authentifié - c'est normal, ne pas afficher d'erreur
                  this.isAuthenticated = false;
                  this.favorites = new Set();
                }
              } catch (error) {
                // Erreur réseau ou autre - ne pas afficher en console (non critique)
                this.isAuthenticated = false;
                this.favorites = new Set();
              }
            },
            
            async toggleFavorite(establishmentId: string, heartElement: HTMLElement) {
              // Éviter les clics multiples
              if (heartElement.classList.contains('is-loading')) {
                return;
              }
              
              // Désactiver pendant le chargement
              heartElement.classList.add('is-loading');
              
              // Vérifier si l'utilisateur est authentifié
              if (!this.isAuthenticated) {
                heartElement.classList.remove('is-loading');
                // Déclencher l'événement pour ouvrir le modal React
                window.dispatchEvent(new Event('map-auth-required'));
                return;
              }
              
              const isFavorite = this.favorites.has(establishmentId);
              
              try {
                if (isFavorite) {
                  // Retirer des favoris
                  const response = await fetch('/api/user/favorites');
                  if (response.ok) {
                    const data = await response.json();
                    const favorite = data.favorites.find((fav: any) => fav.establishment.id === establishmentId);
                    
                    if (favorite) {
                      const deleteResponse = await fetch('/api/user/favorites/' + favorite.id, {
                        method: 'DELETE'
                      });
                      
                      if (deleteResponse.ok) {
                        this.favorites.delete(establishmentId);
                        heartElement.classList.remove('is-favorite');
                        console.log('✅ Retiré des favoris');
                        // Afficher notification toast
                        window.dispatchEvent(new CustomEvent('show-toast', {
                          detail: { type: 'success', message: 'Retiré des favoris' }
                        }));
                        // Notifier EstablishmentActions du changement
                        window.dispatchEvent(new CustomEvent('favorite-changed', {
                          detail: { establishmentId, isFavorite: false }
                        }));
                      }
                    }
                  } else if (response.status === 401 || response.status === 403) {
                    alert('Vous devez être connecté pour gérer vos favoris.');
                    this.isAuthenticated = false;
                  }
                } else {
                  // Ajouter aux favoris
                  const response = await fetch('/api/user/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ establishmentId })
                  });
                  
                  if (response.ok) {
                    this.favorites.add(establishmentId);
                    heartElement.classList.add('is-favorite');
                    // Notifier EstablishmentActions du changement
                    window.dispatchEvent(new CustomEvent('favorite-changed', {
                      detail: { establishmentId, isFavorite: true }
                    }));
                    console.log('✅ Ajouté aux favoris');
                    // Afficher notification toast
                    window.dispatchEvent(new CustomEvent('show-toast', {
                      detail: { type: 'success', message: 'Ajouté aux favoris' }
                    }));
                  } else if (response.status === 401 || response.status === 403) {
                    alert('Vous devez être connecté pour ajouter des favoris.');
                    this.isAuthenticated = false;
                  } else {
                    const error = await response.json();
                    alert('Une erreur est survenue: ' + (error.error || 'Erreur inconnue'));
                  }
                }
              } catch (error) {
                alert('Erreur de connexion. Veuillez réessayer.');
                console.error('Erreur lors de la gestion des favoris:', error);
              } finally {
                heartElement.classList.remove('is-loading');
              }
            }
          };
          
          // Charger les favoris au démarrage (silencieusement)
          window.mapFavoriteHandlers.checkFavorites();
        }

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
        window.mapInstance = undefined; // Nettoyer la référence globale
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
      window.mapInstance = map; // Rendre disponible globalement pour la synchronisation des favoris

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

        // Formater les activités pour un affichage élégant
        const formatActivity = (activity: string): string => {
          const activityMap: Record<string, string> = {
            'bar_bières': 'Bar à bières',
            'bar_ambiance': 'Bar ambiance',
            'restaurant': 'Restaurant',
            'restaurant_familial': 'Restaurant familial',
            'tacos_mexicain': 'Tacos mexicain',
            'burger': 'Burger',
            'pizzeria': 'Pizzeria',
            'karaoké': 'Karaoké',
            'escape_game': 'Escape Game',
            'vr_gaming': 'Réalité Virtuelle',
            'parc_jeux': 'Parc de jeux'
          };
          return activityMap[activity] || activity.replace(/_/g, ' ');
        };
        
        let activitiesText = '';
        if (establishment.activities && Array.isArray(establishment.activities)) {
          activitiesText = establishment.activities
            .map(activity => formatActivity(activity))
            .slice(0, 2) // Limiter à 2 activités max
            .join(' • ');
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

        // Calculer la note à afficher (priorité à avgRating, puis googleRating)
        const rating = establishment.avgRating || establishment.googleRating;
        let displayRating = null;
        if (rating) {
          // Toujours afficher la note telle quelle (pas de conversion)
          displayRating = rating.toFixed(1);
        }
        console.log('📊 Note pour', establishment.name, '- avgRating:', establishment.avgRating, 'googleRating:', establishment.googleRating, 'displayRating:', displayRating);
        
        // Formater le prix
        let priceText = '';
        if (establishment.prixMoyen) {
          priceText = `Prix moyen ${Math.round(establishment.prixMoyen)}€`;
        } else if (establishment.priceMin && establishment.priceMax) {
          priceText = `${Math.round(establishment.priceMin)}-${Math.round(establishment.priceMax)}€`;
        } else if (establishment.priceMin) {
          priceText = `À partir de ${Math.round(establishment.priceMin)}€`;
        }
        
        // Vérifier si un événement est en cours ou à venir
        const upcomingEvent = establishment.events?.[0];
        let eventBadge = '';
        if (upcomingEvent) {
          const now = new Date();
          const startDate = new Date(upcomingEvent.startDate);
          const endDate = upcomingEvent.endDate ? new Date(upcomingEvent.endDate) : null;
          
          // Normaliser les dates pour comparer seulement les jours (sans l'heure)
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const eventDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          
          if (endDate && now >= startDate && now <= endDate) {
            // Événement en cours
            eventBadge = `<div class="mb-2 inline-block px-3 py-1 rounded-full text-xs font-semibold" style="background-color: #FFEB3B; color: #000000;">🎉 ${upcomingEvent.title}</div>`;
          } else if (eventDay.getTime() === today.getTime()) {
            // Événement aujourd'hui
            eventBadge = `<div class="mb-2 inline-block px-3 py-1 rounded-full text-xs font-semibold" style="background-color: #FFEB3B; color: #000000;">📅 ${upcomingEvent.title} aujourd'hui</div>`;
          } else if (eventDay > today) {
            // Événement à venir
            const daysUntil = Math.ceil((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const daysText = daysUntil <= 7 ? ` dans ${daysUntil}j` : '';
            eventBadge = `<div class="mb-2 inline-block px-3 py-1 rounded-full text-xs font-semibold" style="background-color: #FFEB3B; color: #000000;">📅 ${upcomingEvent.title}${daysText}</div>`;
          }
        }
        
        // Récupérer un avis client si disponible
        const customerReview = establishment.comments?.[0];
        let reviewText = '';
        if (customerReview && customerReview.content) {
          const truncatedReview = customerReview.content.length > 60 
            ? customerReview.content.substring(0, 60) + '...' 
            : customerReview.content;
          reviewText = `<p class="text-xs text-gray-600 italic mb-2">"${truncatedReview}"</p>`;
        }

        const marker = window.L.marker([establishment.latitude, establishment.longitude], {
          icon: establishmentIcon
        })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: ${popupSize.minWidth}; max-width: ${popupSize.maxWidth}; position: relative;">
              ${(() => {
                // Même logique de priorité que EstablishmentCard
                const cardImage = establishment.images?.find(img => img.isCardImage)?.url;
                const primaryImage = cardImage || establishment.imageUrl || establishment.images?.[0]?.url;
                return primaryImage;
              })() ? `
                <div style="position: relative; width: 100%; height: ${popupSize.imageHeight}; background-color: #f3f4f6;">
                  <img src="${(() => {
                    // Même logique de priorité que EstablishmentCard
                    const cardImage = establishment.images?.find(img => img.isCardImage)?.url;
                    return cardImage || establishment.imageUrl || establishment.images?.[0]?.url;
                  })()}" alt="${establishment.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                  <div 
                    class="popup-heart-icon ${window.mapFavoriteHandlers?.favorites.has(establishment.id) ? 'is-favorite' : ''}" 
                    data-establishment-id="${establishment.id}"
                    onclick="event.stopPropagation(); window.mapFavoriteHandlers?.toggleFavorite('${establishment.id}', this);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                         ${window.mapFavoriteHandlers?.favorites.has(establishment.id) ? 'fill="#ef4444" stroke="#ef4444"' : 'fill="none" stroke="currentColor"'} 
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>
                </div>
              ` : ''}
              
              <div class="p-3">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="font-bold text-base text-gray-900 leading-tight flex-1">${establishment.name}</h3>
                  ${displayRating ? `
                    <div class="ml-2 flex items-center gap-1 flex-shrink-0">
                      <svg class="w-4 h-4" style="color: #fbbf24;" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="text-sm font-bold text-gray-900">${displayRating}</span>
                    </div>
                  ` : ''}
                </div>
                
                <p class="text-xs text-gray-600 mb-2">
                  ${activitiesText}${priceText ? ` • ${priceText}` : ''}
                </p>
                
                ${eventBadge}
                
                ${reviewText}
                
                <p class="text-xs text-gray-500 mb-3">📍 ${establishment.address}</p>
                
                <a href="/etablissements/${establishment.slug}?from=carte" class="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm">
                  En savoir plus →
                </a>
              </div>
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
        window.mapInstance = undefined; // Nettoyer la référence globale
      }
    };
  }, [memoizedEstablishments, memoizedSearchCenter, memoizedSearchRadius, context]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onConfirm={handleAuthConfirm}
      />
    </>
  );
}
