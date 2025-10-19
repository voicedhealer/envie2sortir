'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, Star, Navigation, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useCityHistory } from '@/hooks/useCityHistory';
import { City, MAJOR_FRENCH_CITIES, SEARCH_RADIUS_OPTIONS } from '@/types/location';
import { searchCities } from '@/lib/geolocation-utils';

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * Dropdown compact de localisation pour la barre de navigation
 */
export default function LocationDropdown({ isOpen, onClose, buttonRef }: LocationDropdownProps) {
  const { currentCity, searchRadius, changeCity, changeRadius, detectMyLocation } = useLocation();
  const { recentCities, favorites, isFavorite, toggleFavorite } = useCityHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(searchRadius);
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'recent'>('search');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche avec filtrage
  const filteredCities = useMemo(() => {
    return searchCities(searchQuery);
  }, [searchQuery]);

  // Fermer le dropdown si on clique à l'extérieur (mais pas sur le bouton parent)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdown = dropdownRef.current;
      const button = buttonRef?.current;
      
      if (dropdown && !dropdown.contains(target) && button && !button.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      // Petit délai pour éviter la fermeture immédiate
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  const handleSelectCity = (city: City) => {
    changeCity(city);
    changeRadius(selectedRadius);
    onClose(); // Fermer automatiquement après sélection
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const city = await detectMyLocation();
      changeCity(city);
      changeRadius(selectedRadius);
      onClose();
    } catch (error) {
      console.error('Erreur détection:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden"
    >
      {/* Header compact */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Localisation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      </div>

      {/* Rayon de recherche compact */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Rayon
        </label>
        <div className="grid grid-cols-4 gap-1">
          {SEARCH_RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRadius(option.value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                selectedRadius === option.value
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton GPS compact */}
      <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
        <button
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-all disabled:opacity-50"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Détection...
            </>
          ) : (
            <>
              <Navigation className="w-3 h-3" />
              Ma position
            </>
          )}
        </button>
      </div>

      {/* Tabs compacts */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="w-3 h-3 inline mr-1" />
          Recherche
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className="w-3 h-3 inline mr-1" />
          Favoris ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Récents ({recentCities.length})
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="max-h-64 overflow-y-auto">
        
        {/* Tab Recherche */}
        {activeTab === 'search' && (
          <div className="p-3">
            {/* Barre de recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Liste des villes */}
            <div className="space-y-1">
              {filteredCities.slice(0, 8).map((city) => (
                <div
                  key={city.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                    currentCity?.id === city.id
                      ? 'bg-orange-50 border-orange-300'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectCity(city)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${
                      currentCity?.id === city.id ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                      {city.region && (
                        <p className="text-xs text-gray-500">{city.region}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(city);
                    }}
                    className="p-1 hover:bg-white rounded-full transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFavorite(city.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Favoris */}
        {activeTab === 'favorites' && (
          <div className="p-3">
            {favorites.length === 0 ? (
              <div className="text-center py-4">
                <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun favori</p>
                <p className="text-xs text-gray-400">Cliquez sur l'étoile pour ajouter</p>
              </div>
            ) : (
              <div className="space-y-1">
                {favorites.map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => handleSelectCity(city)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                        {city.region && (
                          <p className="text-xs text-gray-500">{city.region}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(city);
                      }}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Récents */}
        {activeTab === 'recent' && (
          <div className="p-3">
            {recentCities.length === 0 ? (
              <div className="text-center py-4">
                <MapPin className="w-8 h-8 text-gray-ñ300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun historique</p>
                <p className="text-xs text-gray-400">Vos recherches récentes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentCities.slice(0, 5).map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => handleSelectCity(city)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                        {city.region && (
                          <p className="text-xs text-gray-500">{city.region}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(city);
                      }}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFavorite(city.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer compact */}
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
        Vos préférences sont enregistrées automatiquement
      </div>
    </div>
  );
}
