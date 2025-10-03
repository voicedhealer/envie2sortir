import React from 'react';

interface ParkingInfoProps {
  parkingOptions: string[];
  className?: string;
}

export default function ParkingInfo({ parkingOptions, className = '' }: ParkingInfoProps) {
  if (!parkingOptions || parkingOptions.length === 0) {
    return null;
  }

  // Organiser les options de parking par type
  const organizedParking = {
    gratuit: parkingOptions.filter(option => option.toLowerCase().includes('gratuit')),
    payant: parkingOptions.filter(option => option.toLowerCase().includes('payant')),
    privé: parkingOptions.filter(option => option.toLowerCase().includes('privé')),
    couvert: parkingOptions.filter(option => option.toLowerCase().includes('couvert')),
    moto: parkingOptions.filter(option => option.toLowerCase().includes('moto')),
    vélo: parkingOptions.filter(option => option.toLowerCase().includes('vélo'))
  };

  // Filtrer les catégories vides
  const categoriesWithOptions = Object.entries(organizedParking).filter(([_, options]) => options.length > 0);

  if (categoriesWithOptions.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="text-xl mr-2">🅿️</span>
        Stationnement
      </h3>
      
      <div className="space-y-3">
        {categoriesWithOptions.map(([category, options]) => (
          <div key={category} className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {option}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
