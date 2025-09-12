'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Clock, 
  Euro, 
  Users, 
  Car, 
  Accessibility,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

// Icône TikTok
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface HoursData {
  [key: string]: {
    isOpen: boolean;
    slots: Array<{
      name: string;
      open: string;
      close: string;
    }>;
  };
}

interface EstablishmentInfoProps {
  establishment: {
    address: string;
    city?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    theForkLink?: string;
    paymentMethods?: string[];
    horairesOuverture?: HoursData;
    prixMoyen?: number;
    capaciteMax?: number;
    accessibilite?: boolean;
    parking?: boolean;
    terrasse?: boolean;
    informationsPratiques?: string[];
  };
}

const dayNames = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

export default function EstablishmentInfo({ establishment }: EstablishmentInfoProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Fonction pour construire les URLs complètes des réseaux sociaux
  const buildSocialUrl = (platform: string, value: string) => {
    if (!value) return '';
    
    // Si c'est déjà une URL complète, la retourner
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // Construire l'URL selon la plateforme
    switch (platform) {
      case 'instagram':
        if (value.startsWith('@')) {
          return `https://instagram.com/${value.substring(1)}`;
        }
        return `https://instagram.com/${value}`;
      case 'facebook':
        if (value.startsWith('facebook/')) {
          return `https://facebook.com/${value.substring(9)}`;
        }
        return `https://facebook.com/${value}`;
      case 'tiktok':
        if (value.startsWith('@')) {
          return `https://tiktok.com/@${value.substring(1)}`;
        }
        return `https://tiktok.com/@${value}`;
      default:
        return value;
    }
  };

  const formatHours = (hours: HoursData) => {
    const currentDayKey = getCurrentDayKey();
    
    return Object.entries(hours).map(([day, data]) => {
      const isCurrentDay = day === currentDayKey;
      
      return (
        <div 
          key={day} 
          className={`flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 ${
            isCurrentDay ? 'bg-green-100 rounded-lg px-4 -mx-4 border border-green-200' : ''
          }`}
        >
          <span className={`font-medium ${isCurrentDay ? 'text-green-800' : 'text-gray-700'}`}>
            {dayNames[day as keyof typeof dayNames]}
          </span>
          <div className="text-right">
            {data.isOpen ? (
              data.slots.map((slot, index) => (
                <div key={index} className={`text-sm font-medium ${isCurrentDay ? 'text-green-700' : 'text-gray-600'}`}>
                  {slot.open} - {slot.close}
                </div>
              ))
            ) : (
              <span className={`text-sm font-medium ${isCurrentDay ? 'text-red-600' : 'text-red-500'}`}>
                Fermé
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  const getCurrentStatus = (hours: HoursData) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    
    // Trouver le prochain créneau d'ouverture
    const findNextOpening = () => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      // Chercher dans les 7 prochains jours
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const checkDay = (currentDay + dayOffset) % 7;
        const dayKey = dayNames[checkDay] as keyof typeof hours;
        const dayHours = hours[dayKey];
        
        if (dayHours && dayHours.isOpen && dayHours.slots.length > 0) {
          for (const slot of dayHours.slots) {
            const [openHour, openMin] = slot.open.split(':').map(Number);
            const openTime = openHour * 60 + openMin;
            
            // Si c'est aujourd'hui, vérifier que l'heure n'est pas passée
            if (dayOffset === 0 && currentTime >= openTime) {
              continue;
            }
            
            // Formater l'heure de réouverture
            const openTimeFormatted = slot.open;
            const dayName = dayOffset === 0 ? 'aujourd\'hui' : 
                           dayOffset === 1 ? 'demain' : 
                           dayNames[checkDay].charAt(0).toUpperCase() + dayNames[checkDay].slice(1);
            
            return { time: openTimeFormatted, day: dayName };
          }
        }
      }
      return null;
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayKey = today as keyof typeof hours;
    const todayHours = hours[todayKey];
    
    if (!todayHours || !todayHours.isOpen) {
      const nextOpening = findNextOpening();
      if (nextOpening) {
        return { 
          isOpen: false, 
          text: `Fermé - Réouvre ${nextOpening.day} à ${nextOpening.time}`, 
          color: 'text-red-500' 
        };
      }
      return { isOpen: false, text: 'Fermé aujourd\'hui', color: 'text-red-500' };
    }

    // Vérifier si on est dans un créneau d'ouverture aujourd'hui
    for (const slot of todayHours.slots) {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const [closeHour, closeMin] = slot.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      let closeTime = closeHour * 60 + closeMin;
      
      // Gérer les horaires qui passent minuit (ex: 19:00-02:00)
      if (closeTime < openTime) {
        closeTime += 24 * 60; // Ajouter 24h si la fermeture est le lendemain
      }
      
      if (currentTime >= openTime && currentTime <= closeTime) {
        return { isOpen: true, text: 'Ouvert', color: 'text-green-500' };
      }
    }
    
    // Si on est fermé aujourd'hui, chercher s'il y a un autre créneau plus tard dans la journée
    for (const slot of todayHours.slots) {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      
      if (currentTime < openTime) {
        return { 
          isOpen: false, 
          text: `Fermé - Réouvre aujourd'hui à ${slot.open}`, 
          color: 'text-red-500' 
        };
      }
    }
    
    // Si pas de créneau plus tard aujourd'hui, chercher le prochain jour
    const nextOpening = findNextOpening();
    if (nextOpening) {
      return { 
        isOpen: false, 
        text: `Fermé - Réouvre ${nextOpening.day} à ${nextOpening.time}`, 
        color: 'text-red-500' 
      };
    }
    
    return { isOpen: false, text: 'Fermé', color: 'text-red-500' };
  };

  const getCurrentDayKey = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return today;
  };

  const currentStatus = establishment.horairesOuverture ? getCurrentStatus(establishment.horairesOuverture) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Horaires d'ouverture */}
      {establishment.horairesOuverture && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('hours')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Horaires d'ouverture</h3>
                {currentStatus && (
                  <div className={`text-sm ${currentStatus.color} font-medium`}>
                    {currentStatus.text.includes('Réouvre') ? (
                      <div>
                        <div>Fermé</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {currentStatus.text.replace('Fermé - ', '')}
                        </div>
                      </div>
                    ) : (
                      currentStatus.text
                    )}
                  </div>
                )}
              </div>
            </div>
            {expandedSection === 'hours' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'hours' && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <div className="pt-4">
                {formatHours(establishment.horairesOuverture)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact et localisation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span>Contact & Localisation</span>
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Adresse */}
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{establishment.address}</p>
              {establishment.city && !establishment.address.includes(establishment.city) && (
                <p className="text-gray-600">{establishment.city}</p>
              )}
            </div>
          </div>

          {/* Téléphone */}
          {establishment.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <a 
                href={`tel:${establishment.phone}`}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                {establishment.phone}
              </a>
            </div>
          )}

          {/* Email */}
          {establishment.email && (
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <a 
                href={`mailto:${establishment.email}`}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                {establishment.email}
              </a>
            </div>
          )}

          {/* Site web */}

          {/* Lien TheFork */}
          {establishment.theForkLink && (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">🍴</span>
              </div>
              <a 
                href={establishment.theForkLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center space-x-1"
              >
                <span>Réserver sur TheFork</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {establishment.website && (
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <a 
                href={establishment.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors flex items-center space-x-1"
              >
                <span>Site web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Réseaux sociaux */}
      {(establishment.instagram || establishment.facebook || establishment.tiktok) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Réseaux sociaux</h3>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4">
              {establishment.instagram && (
                <a
                  href={buildSocialUrl('instagram', establishment.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="font-medium">Instagram</span>
                </a>
              )}
              
              {establishment.facebook && (
                <a
                  href={buildSocialUrl('facebook', establishment.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </a>
              )}
              
              {establishment.tiktok && (
                <a
                  href={buildSocialUrl('tiktok', establishment.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-black hover:text-gray-800 transition-colors"
                >
                  <TikTokIcon className="w-5 h-5" />
                  <span className="font-medium">TikTok</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informations pratiques */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Info className="w-5 h-5 text-orange-500" />
            <span>Informations pratiques</span>
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {establishment.prixMoyen && (
              <div className="flex items-center space-x-3">
                <Euro className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Prix moyen</p>
                  <p className="text-gray-600">{establishment.prixMoyen}€ par personne</p>
                </div>
              </div>
            )}
            
            {establishment.capaciteMax && (
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Capacité</p>
                  <p className="text-gray-600">Jusqu'à {establishment.capaciteMax} personnes</p>
                </div>
              </div>
            )}
            
            {establishment.parking && (
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Parking</p>
                  <p className="text-gray-600">Parking disponible</p>
                </div>
              </div>
            )}
            
            {establishment.terrasse && (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-green-500">🌿</div>
                <div>
                  <p className="font-medium text-gray-900">Terrasse</p>
                  <p className="text-gray-600">Terrasse extérieure</p>
                </div>
              </div>
            )}
            
            {establishment.accessibilite && (
              <div className="flex items-center space-x-3">
                <Accessibility className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Accessibilité</p>
                  <p className="text-gray-600">Accessible aux personnes à mobilité réduite</p>
                </div>
              </div>
            )}
          </div>

          {/* Nouvelles informations pratiques */}
          {establishment.informationsPratiques && establishment.informationsPratiques.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Autres informations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {establishment.informationsPratiques.map((info: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{info}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Moyens de paiement */}
      {(() => {
        let paymentMethods = establishment.paymentMethods;
        if (typeof paymentMethods === 'string') {
          try {
            paymentMethods = JSON.parse(paymentMethods);
          } catch (error) {
            console.error('Erreur lors du parsing des moyens de paiement:', error);
            paymentMethods = [];
          }
        }
        return paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0;
      })() && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Euro className="w-5 h-5 text-orange-500" />
              <span>Moyens de paiement</span>
            </h3>
          </div>
          
          <div className="p-6">
            <ul className="list-none space-y-1">
              {(() => {
                let paymentMethods = establishment.paymentMethods;
                if (typeof paymentMethods === 'string') {
                  try {
                    paymentMethods = JSON.parse(paymentMethods);
                  } catch (error) {
                    console.error('Erreur lors du parsing des moyens de paiement:', error);
                    paymentMethods = [];
                  }
                }
                return paymentMethods && Array.isArray(paymentMethods) ? paymentMethods : [];
              })().map((method: string, index: number) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-2 flex-shrink-0"></span>
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
