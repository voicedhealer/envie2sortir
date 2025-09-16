"use client";

import { useState } from 'react';

interface OrganizedServicesAmbianceManagerProps {
  services: string[];
  ambiance: string[];
  onServicesChange: (services: string[]) => void;
  onAmbianceChange: (ambiance: string[]) => void;
  isEditMode?: boolean;
}

export default function OrganizedServicesAmbianceManager({
  services,
  ambiance,
  onServicesChange,
  onAmbianceChange,
  isEditMode = false
}: OrganizedServicesAmbianceManagerProps) {
  const [newService, setNewService] = useState('');
  const [newAmbiance, setNewAmbiance] = useState('');

  // Organiser les services par catégories
  const organizeServices = (servicesList: string[]) => {
    const categories = {
      '🏪 Services disponibles': [],
      '🍽️ Services de restauration': [],
      '🛎️ Services généraux': [],
      '♿ Accessibilité': [],
      '💳 Paiements': [],
      '🅿️ Parking': [],
      'Autres': []
    };

    servicesList.forEach(service => {
      const serviceLower = service.toLowerCase();
      
      if (serviceLower.includes('livraison') || serviceLower.includes('emporter') || serviceLower.includes('sur place')) {
        categories['🏪 Services disponibles'].push(service);
      } else if (serviceLower.includes('déjeuner') || serviceLower.includes('dîner') || serviceLower.includes('traiteur') || serviceLower.includes('dessert') || serviceLower.includes('service à table')) {
        categories['🍽️ Services de restauration'].push(service);
      } else if (serviceLower.includes('toilettes') || serviceLower.includes('wifi') || serviceLower.includes('climatisation') || serviceLower.includes('chauffage')) {
        categories['🛎️ Services généraux'].push(service);
      } else if (serviceLower.includes('accessible') || serviceLower.includes('fauteuil') || serviceLower.includes('pmr')) {
        categories['♿ Accessibilité'].push(service);
      } else if (serviceLower.includes('carte') || serviceLower.includes('paiement') || serviceLower.includes('nfc') || serviceLower.includes('pluxee') || serviceLower.includes('titre')) {
        categories['💳 Paiements'].push(service);
      } else if (serviceLower.includes('parking')) {
        categories['🅿️ Parking'].push(service);
      } else {
        categories['Autres'].push(service);
      }
    });

    return categories;
  };

  // Organiser l'ambiance par catégories
  const organizeAmbiance = (ambianceList: string[]) => {
    const categories = {
      '🎵 Ambiance': [],
      '⭐ Points forts': [],
      '👥 Populaire pour': [],
      '🍻 Offres': [],
      '👥 Clientèle': [],
      '👶 Enfants': [],
      'Autres': []
    };

    ambianceList.forEach(item => {
      const itemLower = item.toLowerCase();
      
      if (itemLower.includes('ambiance') || itemLower.includes('cadre') || itemLower.includes('calme')) {
        categories['🎵 Ambiance'].push(item);
      } else if (itemLower.includes('excellent') || itemLower.includes('grand choix') || itemLower.includes('café') || itemLower.includes('thé')) {
        categories['⭐ Points forts'].push(item);
      } else if (itemLower.includes('déjeuner') || itemLower.includes('dîner') || itemLower.includes('solo')) {
        categories['👥 Populaire pour'].push(item);
      } else if (itemLower.includes('alcool') || itemLower.includes('bière') || itemLower.includes('cocktail') || itemLower.includes('spiritueux') || itemLower.includes('vin') || itemLower.includes('végétarien') || itemLower.includes('portion') || itemLower.includes('sain')) {
        categories['🍻 Offres'].push(item);
      } else if (itemLower.includes('étudiant') || itemLower.includes('groupe') || itemLower.includes('touriste')) {
        categories['👥 Clientèle'].push(item);
      } else if (itemLower.includes('enfant') || itemLower.includes('menu enfant')) {
        categories['👶 Enfants'].push(item);
      } else {
        categories['Autres'].push(item);
      }
    });

    return categories;
  };

  const removeService = (serviceToRemove: string) => {
    onServicesChange(services.filter(service => service !== serviceToRemove));
  };

  const removeAmbiance = (ambianceToRemove: string) => {
    onAmbianceChange(ambiance.filter(item => item !== ambianceToRemove));
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      onServicesChange([...services, newService.trim()]);
      setNewService('');
    }
  };

  const addAmbiance = () => {
    if (newAmbiance.trim() && !ambiance.includes(newAmbiance.trim())) {
      onAmbianceChange([...ambiance, newAmbiance.trim()]);
      setNewAmbiance('');
    }
  };

  const organizedServices = organizeServices(services);
  const organizedAmbiance = organizeAmbiance(ambiance);

  const renderCategory = (title: string, items: string[], onRemove: (item: string) => void, color: string) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">{title.split(' ')[0]}</span>
          <span>{title.split(' ').slice(1).join(' ')}</span>
          <span className="ml-2 text-sm text-gray-500">({items.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} border`}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Services & Commodités */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🔧</span>
          <h2 className="text-xl font-bold text-blue-800">Services & Commodités</h2>
        </div>
        <p className="text-blue-700 mb-4">
          Gérez les services de votre établissement. Vous pouvez ajouter, supprimer ou modifier chaque élément.
        </p>

        <div className="space-y-4">
          {Object.entries(organizedServices).map(([category, items]) => 
            <div key={category}>
              {renderCategory(category, items as string[], removeService, 'bg-blue-100 text-blue-800 border-blue-300')}
            </div>
          )}
        </div>

        {/* Ajouter un service */}
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Ajouter un service..."
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addService()}
          />
          <button
            type="button"
            onClick={addService}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Ambiance & Spécialités */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🎨</span>
          <h2 className="text-xl font-bold text-green-800">Ambiance & Spécialités</h2>
        </div>
        <p className="text-green-700 mb-4">
          Définissez l'ambiance de votre établissement. Vous pouvez ajouter, supprimer ou modifier chaque élément.
        </p>

        <div className="space-y-4">
          {Object.entries(organizedAmbiance).map(([category, items]) => 
            <div key={category}>
              {renderCategory(category, items as string[], removeAmbiance, 'bg-green-100 text-green-800 border-green-300')}
            </div>
          )}
        </div>

        {/* Ajouter une ambiance */}
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={newAmbiance}
            onChange={(e) => setNewAmbiance(e.target.value)}
            placeholder="Ajouter une ambiance..."
            className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && addAmbiance()}
          />
          <button
            type="button"
            onClick={addAmbiance}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
