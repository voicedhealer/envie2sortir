"use client";

import { useState, useEffect } from 'react';

export interface ParkingInfoData {
  parking_gratuit: boolean;
  parking_payant: boolean;
  parking_couvert: boolean;
  parking_souterrain: boolean;
  parking_prive: boolean;
  stationnement_facile: boolean;
  parking_gratuit_rue: boolean;
  service_voiturier: boolean;
  parking_accessible: boolean;
  parking_velo: boolean;
  parking_moto: boolean;
}

interface ParkingInfoFormProps {
  initialData?: ParkingInfoData;
  onChange: (data: ParkingInfoData) => void;
  disabled?: boolean;
}

const defaultData: ParkingInfoData = {
  parking_gratuit: false,
  parking_payant: false,
  parking_couvert: false,
  parking_souterrain: false,
  parking_prive: false,
  stationnement_facile: false,
  parking_gratuit_rue: false,
  service_voiturier: false,
  parking_accessible: false,
  parking_velo: false,
  parking_moto: false,
};

export default function ParkingInfoForm({ 
  initialData, 
  onChange, 
  disabled = false 
}: ParkingInfoFormProps) {
  const [data, setData] = useState<ParkingInfoData>(initialData || defaultData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof ParkingInfoData, value: boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const parkingOptions = [
    {
      key: 'parking_gratuit' as const,
      label: 'Parking gratuit',
      icon: '🆓',
      description: 'Stationnement sans frais'
    },
    {
      key: 'parking_payant' as const,
      label: 'Parking payant',
      icon: '💰',
      description: 'Stationnement avec frais'
    },
    {
      key: 'parking_couvert' as const,
      label: 'Parking couvert',
      icon: '🏢',
      description: 'Stationnement à l\'abri des intempéries'
    },
    {
      key: 'parking_souterrain' as const,
      label: 'Parking souterrain',
      icon: '🏗️',
      description: 'Stationnement en sous-sol'
    },
    {
      key: 'parking_prive' as const,
      label: 'Parking privé',
      icon: '🔒',
      description: 'Stationnement réservé aux clients'
    },
    {
      key: 'stationnement_facile' as const,
      label: 'Stationnement facile',
      icon: '✅',
      description: 'Facile de se garer à proximité'
    },
    {
      key: 'parking_gratuit_rue' as const,
      label: 'Parking gratuit dans la rue',
      icon: '🛣️',
      description: 'Stationnement gratuit en bord de route'
    },
    {
      key: 'service_voiturier' as const,
      label: 'Service de voiturier',
      icon: '🚗',
      description: 'Service de stationnement par le personnel'
    },
    {
      key: 'parking_accessible' as const,
      label: 'Parking accessible PMR',
      icon: '♿',
      description: 'Places de stationnement adaptées'
    },
    {
      key: 'parking_velo' as const,
      label: 'Parking vélo',
      icon: '🚲',
      description: 'Stationnement pour vélos'
    },
    {
      key: 'parking_moto' as const,
      label: 'Parking moto',
      icon: '🏍️',
      description: 'Stationnement pour motocycles'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🅿️ Options de parking
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parkingOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
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
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>🅿️ Information importante :</strong> Les informations de parking 
            aident les clients à planifier leur visite et améliorent leur expérience.
          </p>
        </div>
      </div>
    </div>
  );
}

