'use client';

import React from 'react';

// Types pour les créneaux horaires
export type TimeSlot = {
  name: string;      // ex: "Service midi", "Soirée"
  open: string;      // "12:00"
  close: string;     // "14:00"
};

// Types pour les horaires d'ouverture
export type HoursData = {
  monday?: { isOpen: boolean; slots: TimeSlot[] };
  tuesday?: { isOpen: boolean; slots: TimeSlot[] };
  wednesday?: { isOpen: boolean; slots: TimeSlot[] };
  thursday?: { isOpen: boolean; slots: TimeSlot[] };
  friday?: { isOpen: boolean; slots: TimeSlot[] };
  saturday?: { isOpen: boolean; slots: TimeSlot[] };
  sunday?: { isOpen: boolean; slots: TimeSlot[] };
};

// Props du composant
interface OpeningHoursInputProps {
  value: HoursData;
  onChange: (hours: HoursData) => void;
}

// Configuration des jours de la semaine
const DAYS_CONFIG = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const;

export default function OpeningHoursInput({ value, onChange }: OpeningHoursInputProps) {
  
  // Fonction pour mettre à jour un jour spécifique
  const updateDay = (dayKey: keyof HoursData, updates: Partial<HoursData[keyof HoursData]>) => {
    const currentDay = value[dayKey] || { isOpen: false, slots: [] };
    const updatedDay = { ...currentDay, ...updates };
    
    onChange({
      ...value,
      [dayKey]: updatedDay
    });
  };

  // Fonction pour basculer l'état ouvert/fermé d'un jour
  const toggleDayOpen = (dayKey: keyof HoursData) => {
    const currentDay = value[dayKey];
    const isOpen = !currentDay?.isOpen;
    
    if (isOpen && (!currentDay?.slots || currentDay.slots.length === 0)) {
      // Créer un créneau vide par défaut (l'utilisateur tape ce qu'il veut)
      updateDay(dayKey, {
        isOpen: true,
        slots: [{ name: '', open: '09:00', close: '18:00' }]
      });
    } else {
      updateDay(dayKey, { isOpen });
    }
  };

  // Fonction pour ajouter un créneau
  const addSlot = (dayKey: keyof HoursData) => {
    const currentDay = value[dayKey];
    if (!currentDay?.isOpen || currentDay.slots.length >= 3) return;
    
    const newSlot: TimeSlot = {
      name: '', // Nom vide pour que l'utilisateur tape ce qu'il veut
      open: '12:00',
      close: '14:00'
    };
    
    const updatedSlots = [...currentDay.slots, newSlot];
    updateDay(dayKey, {
      slots: updatedSlots
    });
  };

  // Fonction pour supprimer un créneau
  const removeSlot = (dayKey: keyof HoursData, slotIndex: number) => {
    const currentDay = value[dayKey];
    if (!currentDay?.slots || currentDay.slots.length <= 1) return;
    
    const updatedSlots = currentDay.slots.filter((_, index) => index !== slotIndex);
    updateDay(dayKey, { slots: updatedSlots });
  };

  // Fonction pour mettre à jour un créneau
  const updateSlot = (dayKey: keyof HoursData, slotIndex: number, updates: Partial<TimeSlot>) => {
    const currentDay = value[dayKey];
    if (!currentDay?.slots) return;
    
    const updatedSlots = currentDay.slots.map((slot, index) => 
      index === slotIndex ? { ...slot, ...updates } : slot
    );
    
    updateDay(dayKey, { slots: updatedSlots });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Horaires d'ouverture</h3>
      
      {DAYS_CONFIG.map(({ key, label }) => {
        const dayData = value[key] || { isOpen: false, slots: [] };
        
        return (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            {/* En-tête du jour avec checkbox */}
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id={`${key}-open`}
                checked={dayData.isOpen}
                onChange={() => toggleDayOpen(key)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor={`${key}-open`} className="ml-2 text-sm font-medium text-gray-700">
                {label}
              </label>
            </div>

            {/* Affichage conditionnel selon l'état */}
            {dayData.isOpen ? (
              <div className="space-y-3">
                {/* Créneaux existants */}
                {dayData.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      {/* Nom du créneau - Input text simple sans dropdown */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={slot.name}
                          onChange={(e) => updateSlot(key, slotIndex, { name: e.target.value })}
                          placeholder="Ex: Service midi, Soirée..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        {/* Texte d'aide avec exemples */}
                        <p className="text-xs text-gray-500 mt-1">
                          Exemples : Service continu, Midi, Soir, Matin...
                        </p>
                      </div>
                      
                      {/* Bouton supprimer - seulement si > 1 créneau */}
                      {dayData.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(key, slotIndex)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    
                    {/* Horaires du créneau */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">de</span>
                      <input
                        type="time"
                        value={slot.open}
                        onChange={(e) => updateSlot(key, slotIndex, { open: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <span className="text-sm text-gray-600">à</span>
                      <input
                        type="time"
                        value={slot.close}
                        onChange={(e) => updateSlot(key, slotIndex, { close: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Bouton d'ajout - en bas des créneaux, plus discret */}
                {dayData.slots.length < 3 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => addSlot(key)}
                      className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>➕</span>
                      <span>Ajouter un autre créneau</span>
                    </button>
                  </div>
                )}
                
                {/* Indicateur de limite */}
                {dayData.slots.length >= 3 && (
                  <p className="text-xs text-gray-500 text-center italic">
                    Maximum 3 créneaux atteint
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Fermé
              </div>
            )}
          </div>
        );
      })}
      
      <div className="text-xs text-gray-500 mt-2">
        * Cochez la case pour définir les horaires d'un jour. Maximum 3 créneaux par jour.
      </div>
    </div>
  );
}
