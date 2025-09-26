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
      const isValid = !!(
        value.street?.trim() && 
        value.postalCode?.trim() && 
        value.city?.trim() && 
        value.latitude && 
        value.longitude
      );
      
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
          isValid
        });
      }
    }
  }, [value.street, value.postalCode, value.city, value.latitude, value.longitude]);

  // Fonction de géocodage automatique
  const geocodeAddress = useCallback(async (street: string, postalCode: string, city: string) => {
    if (!street.trim() || !postalCode.trim() || !city.trim()) {
      return;
    }

    // Vérifier que l'adresse contient un numéro pour éviter la confusion
    const hasNumber = /\d/.test(street.trim());
    if (!hasNumber) {
      setGeocodeError("⚠️ Ajoutez le numéro de rue pour éviter la confusion avec d'autres établissements");
      return;
    }

    const fullAddress = `${street.trim()}, ${postalCode.trim()} ${city.trim()}`;
    
    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Mise à jour des coordonnées
        const updatedAddress = {
          ...value,
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
  }, [value, onChange]);

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

  // Sélection d'une suggestion - CORRECTION : Préserver le numéro utilisateur
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const address = suggestion.address || {};
    
    // Préserver le numéro saisi par l'utilisateur
    const currentStreet = value.street || '';
    const userNumber = currentStreet.match(/^\d+[a-zA-Z]?/)?.[0] || '';
    
    // Construire la nouvelle adresse en préservant le numéro utilisateur
    let street = currentStreet;
    
    // Si l'utilisateur a saisi un numéro, le garder
    if (userNumber) {
      street = `${userNumber} ${address.road || ''}`.trim();
    } else if (address.house_number) {
      // Sinon, utiliser le numéro de la suggestion
      street = `${address.house_number} ${address.road || ''}`.trim();
    } else {
      // En dernier recours, juste la rue
      street = address.road || '';
    }
    
    const postalCode = address.postcode || '';
    const city = address.city || address.town || address.village || '';

    // Validation des coordonnées
    const latitude = suggestion.lat ? parseFloat(suggestion.lat) : undefined;
    const longitude = suggestion.lon ? parseFloat(suggestion.lon) : undefined;

    const newAddress: AddressData = {
      street,
      postalCode,
      city,
      latitude,
      longitude
    };

    onChange(newAddress);
    setShowSuggestions(false);
    setSuggestions([]);
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
        
        {/* Champ Rue et numéro */}
        <div className="relative mb-3">
          <input
            type="text"
            value={value.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex : 15 rue du Cap Vert"
          />
          
          {/* Suggestions d'autocomplete */}
          {showSuggestions && (
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
        </div>

        {/* Champ Code postal */}
        <div className="mb-3">
          <input
            type="text"
            value={value.postalCode || ''}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex : 21800"
            maxLength={5}
          />
        </div>

        {/* Champ Ville */}
        <div className="mb-3">
          <input
            type="text"
            value={value.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex : Quetigny"
          />
        </div>

        {/* Message d'aide */}
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-500 text-sm">ℹ️</span>
          <p className="text-sm text-blue-700">
            Pourquoi ? Pour afficher précisément votre établissement sur la carte et aider vos clients à le trouver.
          </p>
        </div>

        {/* Affichage des coordonnées géocodées */}
        {(value.latitude && value.longitude) && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">📍</span>
              <span className="text-sm text-green-700 font-medium">
                Coordonnées détectées : {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        )}

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
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
