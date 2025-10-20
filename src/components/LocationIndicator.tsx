'use client';

import React, { useState, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import LocationDropdown from './LocationDropdown';

/**
 * Badge indicateur de localisation dans le header
 * Affiche la ville actuelle et le rayon, avec possibilité de changer
 */
export default function LocationIndicator() {
  const [showSelector, setShowSelector] = useState(false);
  const { currentCity, searchRadius, loading, updatePreferences } = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (loading || !currentCity) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    );
  }

  const handleToggle = () => {
    setShowSelector(!showSelector);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-pink-50 hover:from-orange-100 hover:to-pink-100 border rounded-lg transition-all duration-200 group"
        style={{ borderColor: '#EA916EFF', borderWidth: '1px', borderStyle: 'solid' }}
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
        <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors ${showSelector ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown de sélection */}
      {showSelector && (
        <LocationDropdown
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
          buttonRef={buttonRef}
          updatePreferences={updatePreferences}
        />
      )}
    </div>
  );
}

