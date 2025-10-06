"use client";

import { useState, useEffect } from 'react';

export interface DetailedServicesData {
  gender_neutral_restrooms: boolean;
  pool: boolean;
  wifi: boolean;
  air_conditioning: boolean;
  heating: boolean;
  smoking_area: boolean;
  non_smoking: boolean;
  private_rooms: boolean;
  event_space: boolean;
  first_aid_trained_staff: boolean;
}

interface DetailedServicesFormProps {
  initialData?: DetailedServicesData;
  onChange: (data: DetailedServicesData) => void;
  disabled?: boolean;
}

const defaultData: DetailedServicesData = {
  gender_neutral_restrooms: false,
  pool: false,
  wifi: false,
  air_conditioning: false,
  heating: false,
  smoking_area: false,
  non_smoking: false,
  private_rooms: false,
  event_space: false,
  first_aid_trained_staff: false,
};

export default function DetailedServicesForm({ 
  initialData, 
  onChange, 
  disabled = false 
}: DetailedServicesFormProps) {
  const [data, setData] = useState<DetailedServicesData>(initialData || defaultData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof DetailedServicesData, value: boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const servicesOptions = [
    {
      key: 'gender_neutral_restrooms' as const,
      label: 'Toilettes non genrées',
      icon: '🚻',
    },
    {
      key: 'pool' as const,
      label: 'Piscine',
      icon: '🏊',
    },
    {
      key: 'wifi' as const,
      label: 'WiFi gratuit',
      icon: '📶',
    },
    {
      key: 'air_conditioning' as const,
      label: 'Climatisation',
      icon: '❄️',
    },
    {
      key: 'heating' as const,
      label: 'Chauffage',
      icon: '🔥',
    },
    {
      key: 'smoking_area' as const,
      label: 'Espace fumeurs',
      icon: '🚬',
    },
    {
      key: 'non_smoking' as const,
      label: 'Espace non-fumeurs',
      icon: '🚭',
    },
    {
      key: 'private_rooms' as const,
      label: 'Salles privées',
      icon: '🏠',
    },
    {
      key: 'event_space' as const,
      label: 'Espace événementiel',
      icon: '🎉',
    },
    {
      key: 'first_aid_trained_staff' as const,
      label: 'Personnel formé aux premiers secours',
      icon: '🚑',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🏪 Services détaillés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                data[option.key]
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={data[option.key]}
                onChange={(e) => handleChange(option.key, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>✨ Astuce :</strong> Préciser vos services aide les clients à 
            choisir votre établissement selon leurs besoins spécifiques.
          </p>
        </div>
      </div>
    </div>
  );
}
