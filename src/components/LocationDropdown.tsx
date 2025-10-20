'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Star, Search, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useCityHistory } from '@/hooks/useCityHistory';
import { City, MAJOR_FRENCH_CITIES, SEARCH_RADIUS_OPTIONS } from '@/types/location';
import { searchCities, debounce, CitySearchResult } from '@/lib/city-search-service';

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  updatePreferences?: () => void;
}

/**
 * Dropdown compact de localisation pour la barre de navigation
 */
export default function LocationDropdown({ isOpen, onClose, buttonRef, updatePreferences }: LocationDropdownProps) {
  const { currentCity, searchRadius, changeCity, changeRadius } = useLocation();
  const { recentCities, favorites, isFavorite, toggleFavorite } = useCityHistory();
  
  const [selectedRadius, setSelectedRadius] = useState(searchRadius);
  const [selectedCity, setSelectedCity] = useState<City | null>(currentCity);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'recent'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMoreCities, setShowMoreCities] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche dynamique avec l'API Adresse (avec debounce)
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      setSearchError(null);
      try {
        console.log('Recherche de villes pour:', query);
        const results = await searchCities(query, 8);
        console.log('Résultats trouvés:', results.length);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur recherche villes:', error);
        setSearchResults([]);
        setSearchError('Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Synchroniser les états quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedRadius(searchRadius);
      setSelectedCity(currentCity);
    }
  }, [isOpen, searchRadius, currentCity]);

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

  const handleSelectCity = (city: City | CitySearchResult) => {
    // Convertir CitySearchResult en City si nécessaire
    const cityToSelect: City = {
      id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      region: city.region
    };
    setSelectedCity(cityToSelect); // Pré-sélectionner sans valider
  };

  const handleValidate = () => {
    console.log('🔍 Validation:', { 
      selectedCity: selectedCity?.name, 
      selectedRadius, 
      currentCity: currentCity?.name,
      currentRadius: searchRadius 
    });
    
    // Changer la ville si une nouvelle ville est sélectionnée
    if (selectedCity && selectedCity.id !== currentCity?.id) {
      console.log('✅ Changement de ville:', selectedCity.name);
      changeCity(selectedCity);
    }
    
    // Changer le rayon si le rayon a changé
    if (selectedRadius !== searchRadius) {
      console.log('✅ Changement de rayon:', selectedRadius);
      changeRadius(selectedRadius);
    }
    
    updatePreferences?.(); // Sauvegarder les préférences (optionnel)
    onClose(); // Fermer après validation
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
              onClick={() => {
                console.log('🎯 Sélection du rayon:', option.value);
                setSelectedRadius(option.value);
                // Réinitialiser la sélection de ville si elle ne correspond plus
                if (selectedCity && selectedCity !== currentCity) {
                  setSelectedCity(null);
                }
              }}
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
          <MapPin className="w-3 h-3 inline mr-1" />
          Villes
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
        
        {/* Tab Villes principales */}
        {activeTab === 'search' && (
          <div className="p-3">
            {/* Liste des villes principales */}
            <div className="space-y-1">
              {!showMoreCities ? (
                <>
                  {MAJOR_FRENCH_CITIES.slice(0, 8).map((city) => (
                    <div
                      key={city.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        currentCity?.id === city.id
                          ? 'bg-orange-50 border-orange-300' // Ville active (actuellement configurée)
                          : selectedCity?.id === city.id
                          ? 'bg-blue-50 border-blue-400' // Ville sélectionnée (en attente de validation)
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectCity(city)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${
                          currentCity?.id === city.id 
                            ? 'text-orange-600' 
                            : selectedCity?.id === city.id 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
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
                  
                  {/* Bouton "Voir + de villes" */}
                  <button
                    onClick={() => setShowMoreCities(true)}
                    className="w-full p-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all border border-dashed border-orange-200"
                  >
                    🔍 Voir + de villes
                  </button>
                </>
              ) : (
                <>
                  {/* Barre de recherche pour petites villes */}
                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        debouncedSearch(e.target.value);
                      }}
                      placeholder="Rechercher une ville..."
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
                    )}
                  </div>

                  {/* Bouton retour */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Recherche de villes</span>
                    <button
                      onClick={() => {
                        setShowMoreCities(false);
                        setSearchQuery('');
                        setSearchResults([]);
                        setSearchError(null);
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      ← Retour
                    </button>
                  </div>

                  {/* Résultats de l'API (recherche dynamique) */}
                  {searchResults.length > 0 && (
                    <div className="space-y-1">
                      {searchResults.map((city) => (
                        <div
                          key={city.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                            currentCity?.id === city.id
                              ? 'bg-orange-50 border-orange-300' // Ville active (actuellement configurée)
                              : selectedCity?.id === city.id
                              ? 'bg-blue-50 border-blue-400' // Ville sélectionnée (en attente de validation)
                              : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectCity(city)}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${
                              currentCity?.id === city.id 
                                ? 'text-orange-600' 
                                : selectedCity?.id === city.id 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                              <p className="text-xs text-gray-500">{city.department}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Convertir en City pour toggleFavorite
                              const cityForFavorite: City = {
                                id: city.id,
                                name: city.name,
                                latitude: city.latitude,
                                longitude: city.longitude,
                                region: city.region
                              };
                              toggleFavorite(cityForFavorite);
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

                  {/* Message d'erreur */}
                  {searchError && (
                    <div className="text-center py-4 text-red-500">
                      <p className="text-sm">{searchError}</p>
                      <button
                        onClick={() => {
                          setSearchError(null);
                          debouncedSearch(searchQuery);
                        }}
                        className="text-xs text-red-400 hover:text-red-600 underline mt-1"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}

                  {/* Message si aucun résultat */}
                  {!searchError && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Aucune ville trouvée</p>
                      <p className="text-xs">Essayez avec un autre terme</p>
                    </div>
                  )}

                  {/* Message d'accueil */}
                  {searchResults.length === 0 && searchQuery.length < 2 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Tapez le nom de votre ville</p>
                      <p className="text-xs">Ex: Chevigny-Saint-Sauveur, Annecy...</p>
                    </div>
                  )}
                </>
              )}
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
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      currentCity?.id === city.id
                        ? 'bg-orange-50 border-orange-300' // Ville active (actuellement configurée)
                        : selectedCity?.id === city.id
                        ? 'bg-blue-50 border-blue-400' // Ville sélectionnée (en attente de validation)
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectCity(city)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${
                        currentCity?.id === city.id 
                          ? 'text-orange-600' 
                          : selectedCity?.id === city.id 
                          ? 'text-blue-600' 
                          : 'text-orange-600'
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
                {recentCities.slice(0, 5).map((cityHistory) => (
                  <div
                    key={cityHistory.city.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      currentCity?.id === cityHistory.city.id
                        ? 'bg-orange-50 border-orange-300' // Ville active (actuellement configurée)
                        : selectedCity?.id === cityHistory.city.id
                        ? 'bg-blue-50 border-blue-400' // Ville sélectionnée (en attente de validation)
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectCity(cityHistory.city)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${
                        currentCity?.id === cityHistory.city.id 
                          ? 'text-orange-600' 
                          : selectedCity?.id === cityHistory.city.id 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cityHistory.city.name}</p>
                        {cityHistory.city.region && (
                          <p className="text-xs text-gray-500">{cityHistory.city.region}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(cityHistory.city);
                      }}
                      className="p-1 hover:bg-white rounded-full transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFavorite(cityHistory.city.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'
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

      {/* Bouton de validation */}
      {(selectedCity || selectedRadius !== searchRadius) && (
        <div className="px-3 py-2 bg-green-50 border-t border-green-200">
          <button
            onClick={handleValidate}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all text-sm"
          >
            ✓ Valider la sélection
          </button>
        </div>
      )}

      {/* Footer compact */}
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
        {(selectedCity || selectedRadius !== searchRadius) 
          ? 'Modifications en attente de validation' 
          : 'Vos préférences sont enregistrées automatiquement'
        }
      </div>
    </div>
  );
}
