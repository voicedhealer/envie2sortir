"use client";

import { useState, useEffect } from 'react';

export interface ChildrenServicesData {
  child_friendly_activities: boolean;
  changing_tables: boolean;
  high_chairs: boolean;
  kids_menu: boolean;
  playground: boolean;
  stroller_accessible: boolean;
  child_care: boolean;
  family_restrooms: boolean;
}

interface ChildrenServicesFormProps {
  initialData?: ChildrenServicesData;
  onChange: (data: ChildrenServicesData) => void;
  disabled?: boolean;
}

const defaultData: ChildrenServicesData = {
  child_friendly_activities: false,
  changing_tables: false,
  high_chairs: false,
  kids_menu: false,
  playground: false,
  stroller_accessible: false,
  child_care: false,
  family_restrooms: false,
};

export default function ChildrenServicesForm({ 
  initialData, 
  onChange, 
  disabled = false 
}: ChildrenServicesFormProps) {
  const [data, setData] = useState<ChildrenServicesData>(initialData || defaultData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof ChildrenServicesData, value: boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const childrenOptions = [
    {
      key: 'child_friendly_activities' as const,
      label: 'Activités adaptées aux enfants',
      icon: '🎮',
    },
    {
      key: 'changing_tables' as const,
      label: 'Tables à langer',
      icon: '🍼',
    },
    {
      key: 'high_chairs' as const,
      label: 'Chaises hautes',
      icon: '🪑',
    },
    {
      key: 'kids_menu' as const,
      label: 'Menu enfant',
      icon: '🍝',
    },
    {
      key: 'playground' as const,
      label: 'Aire de jeux',
      icon: '🛝',
    },
    {
      key: 'stroller_accessible' as const,
      label: 'Accessible aux poussettes',
      icon: '🍼',
    },
    {
      key: 'child_care' as const,
      label: 'Service de garde',
      icon: '👶',
    },
    {
      key: 'family_restrooms' as const,
      label: 'Toilettes familiales',
      icon: '🚻',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          👶 Services enfants et familles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childrenOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                data[option.key]
                  ? 'bg-pink-50 border-pink-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={data[option.key]}
                onChange={(e) => handleChange(option.key, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
          <p className="text-sm text-pink-700">
            <strong>👨‍👩‍👧‍👦 Familles :</strong> Les services enfants attirent les familles 
            et augmentent la durée de visite dans votre établissement.
          </p>
        </div>
      </div>
    </div>
  );
}
