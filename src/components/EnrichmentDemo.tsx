'use client';

import React from 'react';
import EnrichmentSections from '@/components/EnrichmentSections';
import { EnrichmentData } from '@/lib/enrichment-system';

// Données de démonstration pour Le Maharaja
const demoEnrichmentData: EnrichmentData = {
  // Infos de base
  name: "Le Maharaja",
  establishmentType: "restaurant",
  priceLevel: 2,
  rating: 3.6,
  website: "http://www.le-maharaja.fr/",
  phone: "03 80 27 46 02",
  address: "44 Rue Monge, 21000 Dijon, France",
  description: "Restaurant indien ouvert 6 jours par semaine",
  openingHours: [],
  hours: {},
  practicalInfo: ["Repas sur place", "Nourriture", "Carte bancaire acceptée", "Espace non-fumeurs", "Réservation recommandée", "Chauffage"],
  
  // Tags d'envie générés
  envieTags: ["Envie de bien manger", "Envie de sortir dîner", "Envie de découvrir", "Envie de se régaler", "Envie de bon rapport qualité-prix"],
  
  // Informations spécifiques selon le type
  specialties: [],
  atmosphere: [],
  accessibility: [],
  
  // Données Google
  googlePlaceId: "ChIVVVXqnQgqd8kcRXae6Qauu1G8",
  googleBusinessUrl: "https://maps.app.goo.gl/z9BUXstYFcfZtiuE7",
  googleRating: 3.6,
  googleReviewCount: 445,
  
  // Intégration TheFork
  theForkLink: "",
  
  // Lien Uber Eats
  uberEatsLink: "",

  // === SECTIONS DÉTAILLÉES (DONNÉES DE DÉMONSTRATION) ===
  
  // Accessibilité
  accessibilityInfo: {
    wheelchairAccessibleEntrance: true,
    wheelchairAccessibleParking: false,
    wheelchairAccessibleRestroom: undefined,
    wheelchairAccessibleSeating: true,
  },
  
  // Services disponibles
  servicesAvailable: {
    delivery: true,
    takeout: true,
    dineIn: true,
    curbsidePickup: false,
    reservations: true,
  },
  
  // Services de restauration
  diningServices: {
    breakfast: false,
    brunch: false,
    lunch: true,
    dinner: true,
    dessert: true,
    lateNightFood: false,
  },
  
  // Offres alimentaires et boissons
  offerings: {
    beer: true,
    wine: true,
    cocktails: true,
    coffee: true,
    vegetarianFood: true,
    happyHourFood: false,
  },
  
  // Moyens de paiement
  paymentMethods: {
    creditCards: true,
    debitCards: true,
    nfc: true,
    cashOnly: false,
  },
  
  // Ambiance et caractéristiques
  atmosphereFeatures: {
    goodForChildren: true,
    goodForGroups: true,
    goodForWatchingSports: false,
    liveMusic: false,
    outdoorSeating: false,
  },
  
  // Services généraux
  generalServices: {
    wifi: true,
    restroom: true,
    parking: false,
    valetParking: false,
    paidParking: true,
    freeParking: false,
  },
};

export default function EnrichmentDemo() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Avertissement de démonstration */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Mode démonstration
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Cette démonstration utilise des données simulées car l'API Google Places n'est pas configurée.
                Pour utiliser les vraies données, configurez votre clé API Google Places dans le fichier <code>.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des sections d'enrichissement */}
      <EnrichmentSections 
        enrichmentData={demoEnrichmentData} 
        readOnly={true} 
      />
    </div>
  );
}
