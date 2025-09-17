"use client";

import { Establishment } from '@prisma/client';
import { MapPin, Phone, Globe, Clock, Star, Users, Car, CreditCard, Utensils, Wifi, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface EstablishmentInfoProps {
  establishment: Establishment;
}

// Fonction pour parser les champs Google Places
function parseGooglePlacesField(field: any, fieldName: string): string[] {
  if (!field) return [];
  
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return field.split(',').map((item: string) => item.trim()).filter(Boolean);
    }
  }
  
  if (Array.isArray(field)) {
    return field;
  }
  
  return [];
}

export default function EstablishmentInfo({ establishment }: EstablishmentInfoProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  
  // Fonction pour obtenir le jour actuel
  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[today.getDay()];
  };

  // Fonction pour obtenir le statut d'ouverture actuel
  const getCurrentStatus = () => {
    if (!establishment.horairesOuverture) return { isOpen: false, nextOpen: null, nextReopening: null };
    
    const currentDay = getCurrentDay();
    const todayData = (establishment.horairesOuverture as any)[currentDay];
    
    // Debug: afficher les informations
    console.log('Debug horaires:', {
      currentDay,
      todayData,
      currentTime: new Date().getHours() * 100 + new Date().getMinutes()
    });
    
    if (!todayData || !todayData.isOpen || !todayData.slots || todayData.slots.length === 0) {
      // Chercher la prochaine réouverture
      const nextReopening = getNextReopening();
      return { isOpen: false, nextOpen: null, nextReopening };
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    for (const slot of todayData.slots) {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const [closeHour, closeMin] = slot.close.split(':').map(Number);
      const openTime = openHour * 100 + openMin;
      let closeTime = closeHour * 100 + closeMin;
      
      // Gérer les créneaux qui se terminent après minuit (ex: 17:00 - 01:30)
      if (closeTime < openTime) {
        closeTime += 2400; // Ajouter 24h pour les créneaux nocturnes
      }
      
      console.log('Debug slot:', {
        slot: slot.open + '-' + slot.close,
        openTime,
        closeTime: closeTime > 2400 ? closeTime - 2400 : closeTime,
        currentTime,
        isOpen: currentTime >= openTime && currentTime <= closeTime
      });
      
      if (currentTime >= openTime && currentTime <= closeTime) {
        return { isOpen: true, nextOpen: slot.close, nextReopening: null };
      }
    }
    
    // Fermé aujourd'hui mais ouvert plus tard aujourd'hui
    const nextReopening = getNextReopening();
    return { isOpen: false, nextOpen: null, nextReopening };
  };

  // Fonction pour trouver la prochaine réouverture
  const getNextReopening = () => {
    if (!establishment.horairesOuverture) return null;
    
    const currentDay = getCurrentDay();
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Ordre des jours de la semaine (Lundi en premier)
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = dayOrder.indexOf(currentDay);
    
    // Chercher dans les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const dayKey = dayOrder[dayIndex];
      const dayData = (establishment.horairesOuverture as any)[dayKey];
      
      if (dayData && dayData.isOpen && dayData.slots && dayData.slots.length > 0) {
        // Si c'est aujourd'hui, vérifier s'il y a un créneau plus tard
        if (i === 0) {
          for (const slot of dayData.slots) {
            const [openHour, openMin] = slot.open.split(':').map(Number);
            const openTime = openHour * 100 + openMin;
            
            if (currentTime < openTime) {
              const dayLabels: { [key: string]: string } = {
                monday: 'lundi',
                tuesday: 'mardi',
                wednesday: 'mercredi',
                thursday: 'jeudi',
                friday: 'vendredi',
                saturday: 'samedi',
                sunday: 'dimanche'
              };
              return `Réouverture ${dayLabels[dayKey]} à ${slot.open}`;
            }
          }
        } else {
          // C'est un jour futur
          const slot = dayData.slots[0]; // Prendre le premier créneau
          const dayLabels: { [key: string]: string } = {
            monday: 'lundi',
            tuesday: 'mardi',
            wednesday: 'mercredi',
            thursday: 'jeudi',
            friday: 'vendredi',
            saturday: 'samedi',
            sunday: 'dimanche'
          };
          return `Réouverture ${dayLabels[dayKey]} à ${slot.open}`;
        }
      }
    }
    
    return null;
  };

  // Parser les données Google Places
  const services = parseGooglePlacesField(establishment.services, 'services');
  const ambiance = parseGooglePlacesField(establishment.ambiance, 'ambiance');
  const informationsPratiques = parseGooglePlacesField(establishment.informationsPratiques, 'informationsPratiques');

  return (
    <div className="space-y-6">
      {/* Horaires d'ouverture */}
      {establishment.horairesOuverture && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setIsHoursExpanded(!isHoursExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Horaires d'ouverture</h3>
              {(() => {
                const status = getCurrentStatus();
                if (status.isOpen) {
                  return (
                    <span className="text-sm font-medium text-green-600">
                      Ouvert jusqu'à {status.nextOpen}
                    </span>
                  );
                } else {
                  return (
                    <span className="text-sm font-medium text-red-600">
                      {status.nextReopening ? ` ${status.nextReopening}` : 'Fermé'}
                    </span>
                  );
                }
              })()}
            </div>
            {isHoursExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {isHoursExpanded && (
            <div className="px-6 pb-6">
              <div className="space-y-1">
                {(() => {
                  // Ordre des jours de la semaine (Lundi en premier)
                  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  
                  return dayOrder.map((day) => {
                    const dayData = (establishment.horairesOuverture as any)[day];
                    
                    const formatHours = (dayData: any) => {
                      if (!dayData || !dayData.isOpen || !dayData.slots || dayData.slots.length === 0) {
                        return 'Fermé';
                      }
                      return dayData.slots
                        .map((slot: any) => `${slot.open} - ${slot.close}`)
                        .join(', ');
                    };

                    const dayLabels: { [key: string]: string } = {
                      monday: 'Lundi',
                      tuesday: 'Mardi',
                      wednesday: 'Mercredi',
                      thursday: 'Jeudi',
                      friday: 'Vendredi',
                      saturday: 'Samedi',
                      sunday: 'Dimanche'
                    };

                    const isCurrentDay = day === getCurrentDay();
                    
                    return (
                      <div 
                        key={day} 
                        className={`flex justify-between items-center py-2 px-3 rounded transition-colors ${
                          isCurrentDay 
                            ? 'bg-green-100 text-green-800' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{dayLabels[day] || day}</span>
                        <span className="text-sm">{formatHours(dayData)}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informations de contact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 text-orange-500 mr-2" />
          Informations de contact
        </h3>
        
        <div className="space-y-3">
          {establishment.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-gray-900 font-medium">Adresse</p>
                <p className="text-gray-600">{establishment.address}</p>
                {establishment.city && (
                  <p className="text-gray-600">{establishment.city}</p>
                )}
              </div>
            </div>
          )}
          
          {establishment.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">Téléphone</p>
                <a href={`tel:${establishment.phone}`} className="text-orange-500 hover:text-orange-600">
                  {establishment.phone}
                </a>
              </div>
            </div>
          )}
          
          {establishment.website && (
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">Site web</p>
                <a 
                  href={establishment.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600"
                >
                  {establishment.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informations pratiques */}
      {informationsPratiques.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coffee className="w-5 h-5 text-orange-500 mr-2" />
            Informations pratiques
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {informationsPratiques.map((info, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {info}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Liens externes */}
      {(establishment.theForkLink || establishment.uberEatsLink) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Réservations et commandes
          </h3>
          
          <div className="space-y-3">
            {establishment.theForkLink && (
              <div className="flex items-center space-x-3">
                <Utensils className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-900 font-medium">TheFork</p>
                  <a 
                    href={establishment.theForkLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Réserver une table
                  </a>
                </div>
              </div>
            )}
            
            {establishment.uberEatsLink && (
              <div className="flex items-center space-x-3">
                <Car className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-900 font-medium">Uber Eats</p>
                  <a 
                    href={establishment.uberEatsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Commander en livraison
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}