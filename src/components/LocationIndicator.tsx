'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import LocationSelector from './LocationSelector';

/**
 * Badge indicateur de localisation dans le header
 * Affiche la ville actuelle et le rayon, avec possibilité de changer
 */
export default function LocationIndicator() {
  const [showSelector, setShowSelector] = useState(false);
  const { currentCity, searchRadius, loading } = useLocation();

  if (loading || !currentCity) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-pink-50 hover:from-orange-100 hover:to-pink-100 border border-orange-200 rounded-lg transition-all duration-200 group"
        title="Changer de localisation"
      >
        <MapPin className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900">
            {currentCity.name}
          </span>
          <span className="text-xs text-gray-500">
            Rayon {searchRadius}km
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
      </button>

      {/* Modal de sélection */}
      {showSelector && (
        <LocationSelector
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}

