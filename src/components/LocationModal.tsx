'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { hasShownLocationPopup, markPopupAsShown } from '@/lib/location-service';
import { City, MAJOR_FRENCH_CITIES } from '@/types/location';

/**
 * Modal de bienvenue pour demander la localisation au premier chargement
 */
export default function LocationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedCity, setDetectedCity] = useState<City | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);

  const { changeCity, changeRadius, updatePreferences, detectMyLocation } = useLocation();

  useEffect(() => {
    // Vérifier si on doit afficher le popup
    const shouldShow = !hasShownLocationPopup();
    
    if (shouldShow) {
      // Petit délai pour ne pas surcharger au chargement
      setTimeout(() => {
        tryDetectLocation();
      }, 1000);
    }
  }, []);

  const tryDetectLocation = async () => {
    setIsDetecting(true);
    setIsOpen(true);
    setError(null);

    try {
      const city = await detectMyLocation();
      setDetectedCity(city);
      setSelectedCity(city);
    } catch (err) {
      console.error('Erreur détection:', err);
      setError('Impossible de détecter votre position');
      setShowManualSelection(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAcceptDetected = () => {
    if (detectedCity) {
      changeCity(detectedCity);
      updatePreferences({
        defaultCity: detectedCity,
        mode: 'manual',
        useCurrentLocation: false,
      });
    }
    markPopupAsShown();
    setIsOpen(false);
  };

  const handleSelectManually = () => {
    setShowManualSelection(true);
  };

  const handleConfirmManual = () => {
    if (selectedCity) {
      changeCity(selectedCity);
      updatePreferences({
        defaultCity: selectedCity,
        mode: 'manual',
        useCurrentLocation: false,
      });
    }
    markPopupAsShown();
    setIsOpen(false);
  };

  const handleAskEachTime = () => {
    updatePreferences({
      mode: 'ask',
      useCurrentLocation: false,
    });
    markPopupAsShown();
    setIsOpen(false);
  };

  const handleClose = () => {
    markPopupAsShown();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Bienvenue sur Envie2Sortir !</h2>
          </div>
          <p className="text-white/90 text-sm">
            Personnalisez votre expérience en choisissant votre localisation
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isDetecting ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Détection de votre position en cours...</p>
            </div>
          ) : showManualSelection ? (
            // Sélection manuelle
            <div>
              <p className="text-gray-700 mb-4">
                Choisissez votre ville pour découvrir les événements et bons plans près de chez vous :
              </p>
              
              <select
                value={selectedCity?.id || ''}
                onChange={(e) => {
                  const city = MAJOR_FRENCH_CITIES.find(c => c.id === e.target.value);
                  setSelectedCity(city || null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-6"
              >
                <option value="">Sélectionnez une ville</option>
                {MAJOR_FRENCH_CITIES.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name} {city.region && `(${city.region})`}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmManual}
                  disabled={!selectedCity}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmer
                </button>
                <button
                  onClick={handleAskEachTime}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Me demander à chaque fois
                </button>
              </div>
            </div>
          ) : detectedCity ? (
            // Ville détectée
            <div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700 mb-2">
                  Nous avons détecté que vous êtes à :
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  📍 {detectedCity.name}
                </p>
                {detectedCity.region && (
                  <p className="text-sm text-gray-500 mt-1">{detectedCity.region}</p>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Souhaitez-vous utiliser cette ville par défaut pour découvrir les événements et bons plans autour de vous ?
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleAcceptDetected}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  ✓ Oui, utiliser {detectedCity.name}
                </button>
                
                <button
                  onClick={handleSelectManually}
                  className="w-full px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-all"
                >
                  Non, choisir une autre ville
                </button>
                
                <button
                  onClick={handleAskEachTime}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Me demander à chaque fois
                </button>
              </div>
            </div>
          ) : error ? (
            // Erreur
            <div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleSelectManually}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Choisir ma ville manuellement
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-xs text-gray-500">
          💡 Vous pourrez modifier ce paramètre à tout moment dans votre profil
        </div>
      </div>
    </div>
  );
}

