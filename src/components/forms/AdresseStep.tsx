'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Types pour les données d'adresse
export interface AddressData {
  street: string;
  postalCode: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

// Props du composant
interface AdresseStepProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  error?: string;
  disableAutoGeocode?: boolean; // Nouveau prop pour désactiver le géocodage automatique
  onValidationChange?: (isValid: boolean) => void; // Callback pour notifier la validation
}

// Type pour les suggestions d'autocomplete
interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

export default function AdresseStep({ value, onChange, error, disableAutoGeocode = false, onValidationChange }: AdresseStepProps) {
  // États locaux
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAddressExtracted, setShowAddressExtracted] = useState(false);

  // Debounce pour l'autocomplete
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Ref pour stocker la fonction de callback et éviter les boucles infinies
  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;

  // Ref pour stocker la dernière valeur de validation pour éviter les appels inutiles
  const lastValidationRef = useRef<boolean | null>(null);

  // Vérifier la validation de l'adresse
  useEffect(() => {
    if (onValidationChangeRef.current) {
      // Validation flexible : soit adresse complète, soit coordonnées GPS
      const hasFullAddress = !!(
        value.street?.trim() && 
        value.postalCode?.trim() && 
        value.city?.trim()
      );
      
      const hasCoordinates = !!(
        value.latitude && 
        value.longitude
      );
      
      const isValid = hasFullAddress || hasCoordinates;
      
      // Ne pas appeler le callback si la validation n'a pas changé
      if (lastValidationRef.current !== isValid) {
        lastValidationRef.current = isValid;
        onValidationChangeRef.current(isValid);
        
        // Log pour debug
        console.log('📍 Validation adresse:', {
          street: value.street,
          postalCode: value.postalCode,
          city: value.city,
          latitude: value.latitude,
          longitude: value.longitude,
          hasFullAddress,
          hasCoordinates,
          isValid
        });
      }
    }
  }, [value.street, value.postalCode, value.city, value.latitude, value.longitude]);

  // Fonction de géocodage automatique
  const geocodeAddress = useCallback(async (street: string, postalCode: string, city: string, currentAddress?: AddressData) => {
    if (!street.trim() || !postalCode.trim() || !city.trim()) {
      return;
    }

    // Vérifier que l'adresse commence par un numéro pour une précision maximale
    const hasNumberAtStart = /^\d+[a-zA-Z]?\s/.test(street.trim());
    if (!hasNumberAtStart) {
      setGeocodeError("⚠️ L'adresse doit commencer par un numéro (ex: 708 Rue...) pour un géocodage précis");
      return;
    }

    const fullAddress = `${street.trim()}, ${postalCode.trim()} ${city.trim()}`;
    
    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Mise à jour des coordonnées - utiliser currentAddress si fourni, sinon value
        const baseAddress = currentAddress || value;
        const updatedAddress = {
          ...baseAddress,
          latitude: result.data.latitude,
          longitude: result.data.longitude
        };
        onChange(updatedAddress);
        
        // Notifier que l'adresse est validée
        if (onValidationChange) {
          onValidationChange(true);
        }
        
        console.log(`✅ Géocodage réussi: ${result.data.latitude}, ${result.data.longitude}`);
      } else {
        setGeocodeError("Adresse introuvable, merci de vérifier");
        console.error("❌ Erreur géocodage:", result);
      }
    } catch (error) {
      setGeocodeError("Erreur de connexion lors du géocodage");
      console.error("❌ Erreur géocodage:", error);
    } finally {
      setIsGeocoding(false);
    }
  }, [value, onChange, onValidationChange]);

  // Fonction d'autocomplete avec debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Annuler le timer précédent
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Nouveau timer avec debounce de 300ms
    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      
      try {
        const response = await fetch(`/api/geocode?address=${encodeURIComponent(query)}&limit=5`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setSuggestions(result.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("❌ Erreur autocomplete:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  // Gestion des changements de champs
  const handleFieldChange = (field: keyof AddressData, fieldValue: string) => {
    const newAddress = { ...value, [field]: fieldValue };
    onChange(newAddress);

    // Nettoyer les erreurs
    if (geocodeError) {
      setGeocodeError(null);
    }

    // Géocodage automatique si tous les champs sont remplis ET si le géocodage automatique n'est pas désactivé
    if (!disableAutoGeocode && (field === 'street' || field === 'postalCode' || field === 'city')) {
      const { street, postalCode, city } = newAddress;
      if (street && street.trim() && postalCode && postalCode.trim() && city && city.trim()) {
        geocodeAddress(street, postalCode, city);
      }
    }

    // Autocomplete sur le champ rue
    if (field === 'street') {
      fetchSuggestions(fieldValue);
    }
  };

  // Fonction pour gérer le changement de l'adresse complète
  const handleFullAddressChange = (fullAddress: string) => {
    // Déclencher l'autocomplete si l'adresse contient au moins 3 caractères
    if (fullAddress.length >= 3) {
      fetchSuggestions(fullAddress);
    } else {
      // Fermer les suggestions si moins de 3 caractères
      setShowSuggestions(false);
      setSuggestions([]);
    }
    
    // Pour l'instant, on stocke l'adresse complète dans le champ street
    // Le géocodage se fera via les suggestions ou manuellement
    const updatedAddress = { ...value, street: fullAddress };
    onChange(updatedAddress);
    
    // Nettoyer les erreurs
    if (geocodeError) {
      setGeocodeError(null);
    }
  };

  // Sélection d'une suggestion - NOUVELLE LOGIQUE : Extraire automatiquement ville et code postal
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const address = suggestion.address || {};
    
    // Préserver le numéro saisi par l'utilisateur
    const currentStreet = value.street || '';
    const userNumber = currentStreet.match(/^\d+[a-zA-Z]?/)?.[0] || '';
    
    // Construire la rue avec le numéro
    let street = '';
    let houseNumber = '';
    
    // Si l'utilisateur a saisi un numéro, le garder en priorité
    if (userNumber) {
      houseNumber = userNumber;
      street = address.road || '';
    } else if (address.house_number) {
      // Sinon, utiliser le numéro de la suggestion
      houseNumber = address.house_number;
      street = address.road || '';
    } else {
      // En dernier recours, juste la rue
      street = address.road || '';
    }
    
    // Extraire automatiquement ville et code postal depuis display_name
    let postalCode = address.postcode || '';
    let city = address.city || address.town || address.village || '';
    
    // Si les données de l'API ne sont pas complètes, extraire depuis display_name
    if (!postalCode || !city) {
      const displayName = suggestion.display_name || '';
      
      // Pattern pour extraire "code postal ville" depuis display_name
      // Ex: "8 Pl. Raspail, 69007 Lyon, France" -> "69007" et "Lyon"
      const postalCityMatch = displayName.match(/,?\s*(\d{5})\s+([^,]+?)(?:,|$)/);
      if (postalCityMatch) {
        postalCode = postalCityMatch[1];
        city = postalCityMatch[2].trim();
      }
    }

    // Validation des coordonnées
    const latitude = suggestion.lat ? parseFloat(suggestion.lat) : undefined;
    const longitude = suggestion.lon ? parseFloat(suggestion.lon) : undefined;

    // Construire seulement la partie rue (avant la virgule) pour le champ street
    const streetOnly = `${houseNumber}${houseNumber && street ? ' ' : ''}${street}`.trim();

    const newAddress: AddressData = {
      street: streetOnly, // Seulement la partie rue (ex: "8 Pl. Raspail")
      postalCode,
      city,
      latitude,
      longitude
    };

    // Fermer les suggestions AVANT de mettre à jour l'adresse pour éviter les re-renders
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Nettoyer les erreurs
    setGeocodeError(null);
    
    // Afficher le bloc "Adresse extraite" pendant 5 secondes
    setShowAddressExtracted(true);
    setTimeout(() => {
      setShowAddressExtracted(false);
    }, 5000);
    
    // Mettre à jour l'adresse
    onChange(newAddress);
    
    // RE-GÉOCODER avec l'adresse complète et le numéro pour avoir des coordonnées PRÉCISES
    if (houseNumber && street && postalCode && city) {
      const preciseAddress = `${houseNumber} ${street}`;
      console.log('🔄 Re-géocodage pour précision avec:', preciseAddress, postalCode, city);
      // Passer newAddress pour éviter d'utiliser l'ancien value
      geocodeAddress(preciseAddress, postalCode, city, newAddress);
    }
  };

  // Nettoyage des timers
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Adresse de l'établissement *</label>
        
        {/* Champ Rue avec autocomplete */}
        <div className="relative mb-3">
          <input
            type="text"
            value={value.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            onBlur={() => {
              // Fermer les suggestions après un court délai pour permettre le clic sur une suggestion
              setTimeout(() => {
                setShowSuggestions(false);
              }, 200);
            }}
            onFocus={() => {
              // Réafficher les suggestions si on a déjà du contenu
              if (value.street && value.street.length >= 3 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              error && !(value.latitude && value.longitude) ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex : 8 Pl. Raspail"
          />
          
          {/* Suggestions d'autocomplete */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoadingSuggestions ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Recherche en cours...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.display_name}
                    </div>
                    {/* Afficher plus de détails si disponibles */}
                    {suggestion.address && (
                      <div className="text-xs text-gray-600 mt-1">
                        {suggestion.address.house_number && (
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                            N°{suggestion.address.house_number}
                          </span>
                        )}
                        {suggestion.address.road && (
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                            {suggestion.address.road}
                          </span>
                        )}
                        {suggestion.address.postcode && (
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                            {suggestion.address.postcode}
                          </span>
                        )}
                        {(suggestion.address.city || suggestion.address.town || suggestion.address.village) && (
                          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {suggestion.address.city || suggestion.address.town || suggestion.address.village}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  Aucune suggestion trouvée
                </div>
              )}
            </div>
          )}
          
          {/* Affichage détaillé de l'adresse après sélection - 5 secondes */}
          {showAddressExtracted && value.street && value.postalCode && value.city && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in duration-300">
              <p className="text-xs font-medium text-gray-600 mb-2">Adresse extraite :</p>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const fullAddr = value.street;
                  const numberMatch = fullAddr.match(/^(\d+[a-zA-Z]?)\s/);
                  const number = numberMatch ? numberMatch[1] : null;
                  
                  return (
                    <>
                      {number && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          N° {number}
                        </span>
                      )}
                      {!number && (
                        <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          ⚠️ Numéro manquant
                        </span>
                      )}
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {value.street.replace(/^\d+[a-zA-Z]?\s/, '').split(',')[0]}
                      </span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        {value.postalCode}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                        {value.city}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Champs Code postal et Ville */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Champ Code postal */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Code postal</label>
            <input
              type="text"
              value={value.postalCode || ''}
              onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex : 69007"
            />
          </div>
          
          {/* Champ Ville */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ville</label>
            <input
              type="text"
              value={value.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex : Lyon"
            />
          </div>
        </div>

        {/* Champs de coordonnées GPS modifiables */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-3">
            📍 Coordonnées GPS (optionnel)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Champ Latitude */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={value.latitude || ''}
                onChange={(e) => {
                  const latitude = e.target.value ? parseFloat(e.target.value) : undefined;
                  onChange({
                    ...value,
                    latitude
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 47.302780"
              />
            </div>
            
            {/* Champ Longitude */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={value.longitude || ''}
                onChange={(e) => {
                  const longitude = e.target.value ? parseFloat(e.target.value) : undefined;
                  onChange({
                    ...value,
                    longitude
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 5.114379"
              />
            </div>
          </div>
          
          {/* Message de validation des coordonnées */}
          {(value.latitude && value.longitude) && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-sm text-green-700 font-medium">
                  Coordonnées GPS validées ! L'adresse est considérée comme complète.
                </span>
              </div>
            </div>
          )}

          {/* Message d'aide pour Google Maps */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 text-sm">💡</span>
              <div className="text-xs text-blue-700 flex-1">
                <p className="font-medium mb-1">Comment récupérer les coordonnées depuis Google Maps :</p>
                <ol className="list-decimal list-inside space-y-1 mb-3">
                  <li>Ouvrez Google Maps</li>
                  <li>Recherchez votre adresse</li>
                  <li>Clic droit sur l'emplacement exact</li>
                  <li>Sélectionnez "Plus d'infos sur cet endroit"</li>
                  <li>Copiez les coordonnées affichées</li>
                  <li>Cliquez pour vérifier</li>
                </ol>
                
                {/* Bouton intégré dans les instructions */}
                {(value.latitude && value.longitude) && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        // Ouvrir Google Maps avec les coordonnées
                        const mapsUrl = `https://www.google.com/maps?q=${value.latitude},${value.longitude}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>🗺️</span>
                      <span>Voir sur Google Maps</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur de géocodage */}
        {geocodeError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-sm text-red-700">{geocodeError}</span>
            </div>
          </div>
        )}

        {/* Indicateur de géocodage en cours */}
        {isGeocoding && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-700">Géocodage en cours...</span>
            </div>
          </div>
        )}

        {/* Message d'erreur général */}
        {error && !(value.latitude && value.longitude) && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
