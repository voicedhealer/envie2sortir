"use client";

import { useState, useEffect } from 'react';

export interface ClienteleInfoData {
  lgbtq_friendly: boolean;
  transgender_safe: boolean;
  family_friendly: boolean;
  pet_friendly: boolean;
  student_friendly: boolean;
  business_friendly: boolean;
  tourist_friendly: boolean;
  senior_friendly: boolean;
}

interface ClienteleInfoFormProps {
  initialData?: ClienteleInfoData;
  onChange: (data: ClienteleInfoData) => void;
  disabled?: boolean;
}

const defaultData: ClienteleInfoData = {
  lgbtq_friendly: false,
  transgender_safe: false,
  family_friendly: false,
  pet_friendly: false,
  student_friendly: false,
  business_friendly: false,
  tourist_friendly: false,
  senior_friendly: false,
};

export default function ClienteleInfoForm({ 
  initialData, 
  onChange, 
  disabled = false 
}: ClienteleInfoFormProps) {
  const [data, setData] = useState<ClienteleInfoData>(initialData || defaultData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof ClienteleInfoData, value: boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const clienteleOptions = [
    {
      key: 'lgbtq_friendly' as const,
      label: 'LGBTQ+ friendly',
      icon: '🏳️‍🌈',
    },
    {
      key: 'transgender_safe' as const,
      label: 'Safe place pour les transgenres',
      icon: '🏳️‍⚧️',
    },
    {
      key: 'family_friendly' as const,
      label: 'Accueil familial',
      icon: '👨‍👩‍👧‍👦',
    },
    {
      key: 'pet_friendly' as const,
      label: 'Animaux acceptés',
      icon: '🐕',
    },
    {
      key: 'student_friendly' as const,
      label: 'Étudiants bienvenus',
      icon: '🎓',
    },
    {
      key: 'business_friendly' as const,
      label: 'Clientèle d\'affaires',
      icon: '💼',
    },
    {
      key: 'tourist_friendly' as const,
      label: 'Touristes bienvenus',
      icon: '🗺️',
    },
    {
      key: 'senior_friendly' as const,
      label: 'Seniors bienvenus',
      icon: '👴',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          👥 Clientèle et inclusivité
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clienteleOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                data[option.key]
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={data[option.key]}
                onChange={(e) => handleChange(option.key, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700">
            <strong>🤝 Inclusivité :</strong> Montrer que votre établissement est 
            ouvert à tous renforce votre image et attire une clientèle diversifiée.
          </p>
        </div>
      </div>
    </div>
  );
}
