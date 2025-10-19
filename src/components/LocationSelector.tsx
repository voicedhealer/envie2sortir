'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, X, Search, Star, Clock, Navigation, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useCityHistory } from '@/hooks/useCityHistory';
import { City, MAJOR_FRENCH_CITIES, SEARCH_RADIUS_OPTIONS } from '@/types/location';
import { searchCities } from '@/lib/geolocation-utils';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sélecteur complet de localisation avec recherche, historique et favoris
 */
export default function LocationSelector({ isOpen, onClose }: LocationSelectorProps) {
  const { currentCity, searchRadius, changeCity, changeRadius, detectMyLocation } = useLocation();
  const { recentCities, favorites, isFavorite, toggleFavorite } = useCityHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(searchRadius);
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'recent'>('search');

  // Recherche avec filtrage
  const filteredCities = useMemo(() => {
    return searchCities(searchQuery);
  }, [searchQuery]);

  const handleSelectCity = (city: City) => {
    changeCity(city);
    changeRadius(selectedRadius);
    onClose();
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Choisir ma localisation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Ville actuelle */}
          {currentCity && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Ville actuelle</p>
                <p className="text-white font-semibold text-lg">{currentCity.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Rayon de recherche</p>
                <p className="text-white font-semibold text-lg">{searchRadius}km</p>
              </div>
            </div>
          )}
        </div>

        {/* Rayon de recherche */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rayon de recherche
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SEARCH_RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRadius(option.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedRadius === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton détection GPS */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Détection en cours...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Utiliser ma position actuelle
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Rechercher
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Favoris ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'recent'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Récents ({recentCities.length})
          </button>
        </div>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Tab Recherche */}
          {activeTab === 'search' && (
            <div>
              {/* Barre de recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une ville..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Liste des villes */}
              <div className="space-y-2">
                {filteredCities.map((city) => (
                  <div
                    key={city.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      currentCity?.id === city.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectCity(city)}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${
                        currentCity?.id === city.id ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{city.name}</p>
                        {city.region && (
                          <p className="text-sm text-gray-500">{city.region}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(city);
                      }}
                      className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          isFavorite(city.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
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
            <div className="space-y-2">
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune ville favorite</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ajoutez des villes en cliquant sur l'étoile
                  </p>
                </div>
              ) : (
                favorites.map((city) => (
                  <div
                    key={city.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      currentCity?.id === city.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectCity(city)}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${
                        currentCity?.id === city.id ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{city.name}</p>
                        {city.region && (
                          <p className="text-sm text-gray-500">{city.region}</p>
                        )}
                      </div>
                    </div>
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Récents */}
          {activeTab === 'recent' && (
            <div className="space-y-2">
              {recentCities.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun historique</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Vos villes récemment visitées apparaîtront ici
                  </p>
                </div>
              ) : (
                recentCities.map((historyItem) => (
                  <div
                    key={historyItem.city.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      currentCity?.id === historyItem.city.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectCity(historyItem.city)}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${
                        currentCity?.id === historyItem.city.id ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{historyItem.city.name}</p>
                        <p className="text-xs text-gray-500">
                          {historyItem.visitCount} visite{historyItem.visitCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(historyItem.city);
                      }}
                      className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          isFavorite(historyItem.city.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            💡 Vos préférences sont enregistrées automatiquement
          </p>
        </div>
      </div>
    </div>
  );
}

