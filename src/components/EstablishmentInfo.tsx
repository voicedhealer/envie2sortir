"use client";

import { Establishment } from '@prisma/client';
import { MapPin, Phone, Globe, Clock, Star, Users, Car, CreditCard, Utensils, Wifi, Coffee, ChevronDown, ChevronUp, Instagram, Facebook, Music, Youtube } from 'lucide-react';
import { useState } from 'react';
import { useLinkTracking, useScheduleTracking } from '@/hooks/useClickTracking';

// Fonction utilitaire pour nettoyer l'affichage d'une URL
const cleanUrlForDisplay = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Retourner seulement le hostname (domaine) sans www si présent
    return urlObj.hostname.startsWith('www.') ? urlObj.hostname : urlObj.hostname;
  } catch (error) {
    // Si l'URL n'est pas valide, retourner l'URL originale
    return url;
  }
};

// Fonction générique pour parser les données hybrides JSON
const parseHybridData = (jsonField: any): any => {
  if (!jsonField) return null;
  
  if (typeof jsonField === 'string') {
    try {
      return JSON.parse(jsonField);
    } catch {
      return null;
    }
  }
  
  if (typeof jsonField === 'object') {
    return jsonField;
  }
  
  return null;
};

// ✅ FONCTION POUR NETTOYER LES MARQUEURS DE RUBRIQUE
const cleanItemDisplay = (item: string): string => {
  // Enlever les marqueurs de rubrique (ex: "Déjeuner|populaire-pour" -> "Déjeuner")
  return item.replace(/\|[^|]*$/, '');
};

// Fonction pour extraire les éléments d'accessibilité des données hybrides
const getAccessibilityItems = (accessibilityDetails: any): string[] => {
  const items: string[] = [];
  
  if (!accessibilityDetails) return items;
  
  // Parcourir les données d'accessibilité et créer des libellés lisibles
  Object.entries(accessibilityDetails).forEach(([key, value]) => {
    if (value === true || value === 'true') {
      switch (key) {
        case 'wheelchairAccessibleEntrance':
          items.push('Entrée accessible en fauteuil roulant');
          break;
        case 'wheelchairAccessibleRestroom':
          items.push('Toilettes accessibles en fauteuil roulant');
          break;
        case 'wheelchairAccessibleSeating':
          items.push('Places assises accessibles');
          break;
        case 'wheelchairAccessibleParking':
          items.push('Parking accessible');
          break;
        case 'hearingLoop':
          items.push('Boucle magnétique');
          break;
        case 'brailleMenu':
          items.push('Menu en braille');
          break;
        case 'signLanguage':
          items.push('Langue des signes');
          break;
        default:
          // Pour les autres clés, créer un libellé générique
          if (typeof key === 'string') {
            items.push(key.replace(/([A-Z])/g, ' $1').toLowerCase());
          }
      }
    }
  });
  
  return items;
};

// Fonction pour extraire les moyens de paiement des données hybrides
const getPaymentMethods = (detailedPayments: any): string[] => {
  const methods: string[] = [];
  
  if (!detailedPayments) return methods;
  
  Object.entries(detailedPayments).forEach(([key, value]) => {
    if (value === true || value === 'true') {
      switch (key) {
        case 'creditCards':
          methods.push('Cartes de crédit');
          break;
        case 'debitCards':
          methods.push('Cartes de débit');
          break;
        case 'cash':
          methods.push('Espèces');
          break;
        case 'mobilePayments':
          methods.push('Paiements mobiles NFC');
          break;
        case 'contactlessPayments':
        case 'contactless':
          methods.push('Paiements sans contact');
          break;
        case 'mealVouchers':
          methods.push('Titres restaurant');
          break;
        case 'pluxee':
          methods.push('Pluxee');
          break;
        case 'checks':
        case 'check':
          methods.push('Chèques');
          break;
        // Cartes bancaires spécifiques
        case 'visa':
          methods.push('Visa');
          break;
        case 'mastercard':
          methods.push('Mastercard');
          break;
        case 'amex':
          methods.push('American Express');
          break;
        case 'diners':
          methods.push('Diners Club');
          break;
        case 'jcb':
          methods.push('JCB');
          break;
        case 'unionpay':
          methods.push('UnionPay');
          break;
        // Paiements mobiles
        case 'applePay':
          methods.push('Apple Pay');
          break;
        case 'googlePay':
          methods.push('Google Pay');
          break;
        case 'samsungPay':
          methods.push('Samsung Pay');
          break;
        case 'paypal':
          methods.push('PayPal');
          break;
        case 'titresRestaurant':
          methods.push('Titres restaurant');
          break;
        default:
          // Ignorer les clés non reconnues plutôt que de créer des libellés génériques
          break;
      }
    }
  });
  
  return methods;
};

// Fonction pour extraire les services détaillés des données hybrides
const getDetailedServices = (detailedServices: any): string[] => {
  const services: string[] = [];
  
  if (!detailedServices) return services;
  
  Object.entries(detailedServices).forEach(([key, value]) => {
    if (value === true || value === 'true') {
      switch (key) {
        case 'genderNeutralRestrooms':
          services.push('Toilettes non genrées');
          break;
        case 'pool':
          services.push('Piscine');
          break;
        case 'spa':
          services.push('Spa');
          break;
        case 'gym':
          services.push('Salle de sport');
          break;
        case 'wifi':
          services.push('Wi-Fi gratuit');
          break;
        case 'parking':
          services.push('Parking');
          break;
        case 'valet':
          services.push('Service voiturier');
          break;
        case 'petFriendly':
          services.push('Animaux acceptés');
          break;
        default:
          if (typeof key === 'string') {
            services.push(key.replace(/([A-Z])/g, ' $1').toLowerCase());
          }
      }
    }
  });
  
  return services;
};

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
  
  // Hook de tracking des liens
  const { trackLinkClick } = useLinkTracking(establishment.id);
  const { trackScheduleView, trackScheduleExpand } = useScheduleTracking(establishment.id);
  
  // Parser les données hybrides
  const hybridAccessibility = parseHybridData(establishment.accessibilityDetails);
  const hybridPayments = parseHybridData(establishment.detailedPayments);
  const hybridServices = parseHybridData(establishment.detailedServices);
  const hybridClientele = parseHybridData(establishment.clienteleInfo);
  const hybridChildren = parseHybridData(establishment.childrenServices);
  
  // Debug: Afficher les données récupérées
  console.log('🔍 Debug EstablishmentInfo pour:', establishment.name);
  console.log('🔍 EstablishmentInfo RENDU - Composant chargé');
  console.log('📊 accessibilityDetails brut:', establishment.accessibilityDetails);
  console.log('📊 detailedPayments brut:', establishment.detailedPayments);
  console.log('📊 detailedServices brut:', establishment.detailedServices);
  console.log('📊 informationsPratiques brut:', establishment.informationsPratiques);
  console.log('📊 paymentMethods brut:', establishment.paymentMethods);
  
  // Extraire les éléments utilisables - Utiliser les données existantes si les hybrides sont vides
  const accessibilityItems = getAccessibilityItems(hybridAccessibility);
  const paymentMethods = getPaymentMethods(hybridPayments);
  const detailedServices = getDetailedServices(hybridServices);
  
  // Extraire les données d'enrichissement intelligent
  const smartEnrichmentData = parseHybridData(establishment.smartEnrichmentData);
  const enrichmentData = parseHybridData(establishment.enrichmentData);
  
  // Combiner les moyens de paiement de toutes les sources et supprimer les doublons
  const allPaymentMethods = [
    ...paymentMethods,
    ...(smartEnrichmentData?.paymentMethodsArray || []),
    ...(enrichmentData?.paymentMethodsArray || [])
  ];
  const uniquePaymentMethods = [...new Set(allPaymentMethods)];
  
  // Combiner les services de parking
  const parkingOptions = [
    ...(smartEnrichmentData?.servicesArray?.filter((service: string) => 
      service.toLowerCase().includes('parking')
    ) || []),
    ...(enrichmentData?.parking || [])
  ];
  
  // Combiner les services de santé
  const healthOptions = [
    ...(smartEnrichmentData?.servicesArray?.filter((service: string) => 
      service.toLowerCase().includes('santé') || 
      service.toLowerCase().includes('sécurité') ||
      service.toLowerCase().includes('premiers secours')
    ) || []),
    ...(enrichmentData?.health || [])
  ];
  
  // ✅ CORRECTION : Utiliser les données classiques si les hybrides sont vides
  const fallbackPaymentMethods = (() => {
    if (!establishment.paymentMethods) return [];
    
    // Si c'est déjà un objet (format JSON)
    if (typeof establishment.paymentMethods === 'object' && !Array.isArray(establishment.paymentMethods)) {
      const paymentObj = establishment.paymentMethods as any;
      
      // Convertir les clés en libellés lisibles
      const paymentLabels: { [key: string]: string } = {
        creditCards: 'Cartes de crédit',
        debitCards: 'Cartes de débit',
        cash: 'Espèces',
        cashOnly: 'Espèces uniquement',
        nfc: 'Paiements mobiles NFC',
        mobilePayments: 'Paiements mobiles',
        contactlessPayments: 'Paiements sans contact',
        mealVouchers: 'Titres restaurant',
        restaurantVouchers: 'Titres restaurant',
        pluxee: 'Pluxee',
        checks: 'Chèques'
      };
      
      return Object.entries(paymentObj)
        .filter(([key, value]) => value === true)
        .map(([key]) => paymentLabels[key] || key);
    }
    
    // Si c'est un array de strings
    if (Array.isArray(establishment.paymentMethods)) {
      return establishment.paymentMethods;
    }
    
    return [];
  })();
  
  const fallbackAccessibilityItems = establishment.services && Array.isArray(establishment.services)
    ? establishment.services.filter(service => 
        typeof service === 'string' && (
          service.toLowerCase().includes('accessible') || 
          service.toLowerCase().includes('fauteuil') ||
          service.toLowerCase().includes('mobilité')
        )
      )
    : [];
  
  // Utiliser les données hybrides si disponibles, sinon les données classiques
  const finalPaymentMethods = uniquePaymentMethods.length > 0 ? uniquePaymentMethods : fallbackPaymentMethods;
  const finalAccessibilityItems = accessibilityItems.length > 0 ? accessibilityItems : fallbackAccessibilityItems;
  
  // Debug: Afficher les données parsées
  console.log('🔍 DEBUG PAYMENT METHODS:');
  console.log('  - paymentMethods (hybrid):', paymentMethods);
  console.log('  - uniquePaymentMethods:', uniquePaymentMethods);
  console.log('  - fallbackPaymentMethods:', fallbackPaymentMethods);
  console.log('  - finalPaymentMethods:', finalPaymentMethods);
  console.log('✅ accessibilityItems parsés:', finalAccessibilityItems);
  console.log('✅ detailedServices parsés:', detailedServices);
  console.log('✅ smartEnrichmentData parsé:', smartEnrichmentData);
  console.log('✅ enrichmentData parsé:', enrichmentData);
  console.log('✅ parkingOptions:', parkingOptions);
  console.log('✅ healthOptions:', healthOptions);
  
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
              return `Réouverture aujourd'hui à ${slot.open}`;
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
  
  // ✅ AMÉLIORATION : Extraire les moyens de paiement des services et informations pratiques
  const allData = [...services, ...informationsPratiques];
  const traditionalPayments = allData.filter(item => {
    const itemLower = cleanItemDisplay(item).toLowerCase(); // Nettoyer avant de filtrer
    return itemLower.includes('carte') || itemLower.includes('paiement') ||
           itemLower.includes('nfc') || itemLower.includes('pluxee') ||
           itemLower.includes('titre restaurant') || itemLower.includes('titres restaurant') ||
           itemLower.includes('espèces') || itemLower.includes('chèque') || 
           itemLower.includes('paypal');
  });

  // Combiner les moyens de paiement traditionnels et hybrides
  const moyensPaiement = [...traditionalPayments, ...finalPaymentMethods];
  
  console.log('🔍 DEBUG MOYENS PAIEMENT FINAL:');
  console.log('  - traditionalPayments:', traditionalPayments);
  console.log('  - finalPaymentMethods:', finalPaymentMethods);
  console.log('  - moyensPaiement (combiné):', moyensPaiement);

  return (
    <div className="space-y-6">
      {/* Horaires d'ouverture */}
      {establishment.horairesOuverture && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => {
              setIsHoursExpanded(!isHoursExpanded);
              // ✅ AJOUT : Tracking détaillé des horaires
              trackScheduleView('opening_hours');
              if (!isHoursExpanded) {
                trackScheduleExpand();
              }
            }}
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
              <MapPin className="w-8 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-gray-900 font-medium">Adresse</p>
                <p className="text-gray-600">{establishment.address}</p>
              </div>
            </div>
          )}
          
          {establishment.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">Téléphone</p>
                <a 
                  href={`tel:${establishment.phone}`} 
                  className="text-orange-500 hover:text-orange-600"
                  onClick={() => trackLinkClick('phone', 'Téléphone', 'phone')}
                >
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
                  onClick={() => trackLinkClick('website', 'Site web', 'website')}
                >
                  {cleanUrlForDisplay(establishment.website)}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liens externes */}
      {(establishment.theForkLink || establishment.uberEatsLink) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 text-orange-500 mr-2" />
            Réservations et commandes
          </h3>
          
          <div className="space-y-3">
            {establishment.theForkLink && (
              <div className="flex items-center space-x-3">
                <Utensils className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-gray-900 font-medium">TheFork</p>
                  <a 
                    href={establishment.theForkLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800"
                  >
                    Réserver une table
                  </a>
                </div>
              </div>
            )}
            
            {establishment.uberEatsLink && (
              <div className="flex items-center space-x-3">
                <Car className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-gray-900 font-medium">Uber Eats</p>
                  <a 
                    href={establishment.uberEatsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Commander en livraison
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Moyens de paiement */}
      {moyensPaiement.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 text-orange-500 mr-2" />
            Moyens de paiement
          </h3>
          
          <div className="space-y-4">
            {/* Cartes bancaires */}
            {moyensPaiement.some(p => {
              const pLower = cleanItemDisplay(p).toLowerCase();
              return pLower.includes('carte') && (pLower.includes('crédit') || pLower.includes('credit') || pLower.includes('débit'));
            }) && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">💳</span>
                  <h4 className="font-medium text-gray-800">Cartes bancaires</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {moyensPaiement.filter(p => {
                    const pLower = cleanItemDisplay(p).toLowerCase();
                    return pLower.includes('carte') && (pLower.includes('crédit') || pLower.includes('credit') || pLower.includes('débit'));
                  }).map((paiement, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {cleanItemDisplay(paiement)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Paiements mobiles */}
            {moyensPaiement.some(p => {
              const pLower = cleanItemDisplay(p).toLowerCase();
              return pLower.includes('nfc') || pLower.includes('mobile') || pLower.includes('apple pay') || pLower.includes('google pay') || pLower.includes('samsung pay');
            }) && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">📱</span>
                  <h4 className="font-medium text-gray-800">Paiements mobiles</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {moyensPaiement.filter(p => {
                    const pLower = cleanItemDisplay(p).toLowerCase();
                    return pLower.includes('nfc') || pLower.includes('mobile') || pLower.includes('apple pay') || pLower.includes('google pay') || pLower.includes('samsung pay');
                  }).map((paiement, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {cleanItemDisplay(paiement)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Espèces et autres */}
            {moyensPaiement.some(p => {
              const pLower = cleanItemDisplay(p).toLowerCase();
              return pLower.includes('espèces') || pLower.includes('cash') || pLower.includes('chèque') || pLower.includes('pluxee') || pLower.includes('titre') || pLower.includes('paypal');
            }) && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">💵</span>
                  <h4 className="font-medium text-gray-800">Espèces et autres</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {moyensPaiement.filter(p => {
                    const pLower = cleanItemDisplay(p).toLowerCase();
                    return pLower.includes('espèces') || pLower.includes('cash') || pLower.includes('chèque') || pLower.includes('pluxee') || pLower.includes('titre') || pLower.includes('paypal');
                  }).map((paiement, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {cleanItemDisplay(paiement)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Réseaux sociaux */}
      {(establishment.instagram || establishment.facebook || establishment.tiktok || establishment.youtube) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 text-orange-500 mr-2" />
            Réseaux sociaux
          </h3>
          
          <div className="space-y-3">
            {establishment.instagram && (
              <div className="flex items-center space-x-3">
                <Instagram className="w-4 h-4 text-pink-500" />
                <div>
                  <p className="text-gray-900 font-medium">Instagram</p>
                  <a 
                    href={establishment.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                    onClick={() => trackLinkClick('instagram', 'Instagram', 'instagram')}
                  >
                    Suivre sur Instagram
                  </a>
                </div>
              </div>
            )}
            
            {establishment.facebook && (
              <div className="flex items-center space-x-3">
                <Facebook className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-gray-900 font-medium">Facebook</p>
                  <a 
                    href={establishment.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => trackLinkClick('facebook', 'Facebook', 'facebook')}
                  >
                    Suivre sur Facebook
                  </a>
                </div>
              </div>
            )}
            
            {establishment.tiktok && (
              <div className="flex items-center space-x-3">
                <Music className="w-4 h-4 text-black" />
                <div>
                  <p className="text-gray-900 font-medium">TikTok</p>
                  <a 
                    href={establishment.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-black"
                    onClick={() => trackLinkClick('tiktok', 'TikTok', 'tiktok')}
                  >
                    Suivre sur TikTok
                  </a>
                </div>
              </div>
            )}
            
            {establishment.youtube && (
              <div className="flex items-center space-x-3">
                <Youtube className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-gray-900 font-medium">YouTube</p>
                  <a 
                    href={establishment.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => trackLinkClick('youtube', 'YouTube', 'youtube')}
                  >
                    Suivre sur YouTube
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