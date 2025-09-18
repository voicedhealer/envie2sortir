"use client";

import { useState, useEffect } from 'react';

export interface DetailedAccessibilityData {
  wheelchair_restrooms: boolean;
  hearing_loop: boolean;
  accessible_parking: boolean;
  accessible_seating: boolean;
  braille_menu: boolean;
  sign_language_support: boolean;
}

interface DetailedAccessibilityFormProps {
  initialData?: DetailedAccessibilityData;
  onChange: (data: DetailedAccessibilityData) => void;
  disabled?: boolean;
}

const defaultData: DetailedAccessibilityData = {
  wheelchair_restrooms: false,
  hearing_loop: false,
  accessible_parking: false,
  accessible_seating: false,
  braille_menu: false,
  sign_language_support: false,
};

export default function DetailedAccessibilityForm({ 
  initialData, 
  onChange, 
  disabled = false 
}: DetailedAccessibilityFormProps) {
  const [data, setData] = useState<DetailedAccessibilityData>(initialData || defaultData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof DetailedAccessibilityData, value: boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const accessibilityOptions = [
    {
      key: 'wheelchair_restrooms' as const,
      label: 'Toilettes accessibles en fauteuil roulant',
      icon: '♿',
    },
    {
      key: 'hearing_loop' as const,
      label: 'Boucle magnétique',
      icon: '🔊',
    },
    {
      key: 'accessible_parking' as const,
      label: 'Parking accessible en fauteuil roulant',
      icon: '🅿️',
    },
    {
      key: 'accessible_seating' as const,
      label: 'Places assises accessibles en fauteuil roulant',
      icon: '💺',
    },
    {
      key: 'braille_menu' as const,
      label: 'Menu en braille disponible',
      icon: '⠃',
    },
    {
      key: 'sign_language_support' as const,
      label: 'Support langue des signes',
      icon: '🤟',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          ♿ Accessibilité détaillée
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessibilityOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                data[option.key]
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={data[option.key]}
                onChange={(e) => handleChange(option.key, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 Conseil :</strong> Ces informations complémentaires amélioreront 
            la visibilité de votre établissement pour les personnes à besoins spécifiques.
          </p>
        </div>
      </div>
    </div>
  );
}
