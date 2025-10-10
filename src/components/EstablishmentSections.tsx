'use client';

import { useState, useEffect } from 'react';
import EstablishmentMainSections from './EstablishmentMainSections';

interface EstablishmentSectionsProps {
  establishment: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    activities?: any;
    services?: any;
    ambiance?: any;
    specialties?: any;
    atmosphere?: any;
    paymentMethods?: any;
    informationsPratiques?: any;
    detailedServices?: any;
    clienteleInfo?: any;
    accessibilite?: boolean;
    parking?: boolean;
    terrasse?: boolean;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    // Champs hybrides
    accessibilityDetails?: any;
    detailedPayments?: any;
    childrenServices?: any;
    smartEnrichmentData?: any;
    enrichmentData?: any;
    tags?: Array<{
      tag: string;
      typeTag: string;
      poids: number;
    }>;
  };
  // Données d'enrichissement
  parkingOptions?: string[];
  healthOptions?: string[];
}

export default function EstablishmentSections({ establishment, parkingOptions = [], healthOptions = [] }: EstablishmentSectionsProps) {
  const [isClient, setIsClient] = useState(false);

  // Protection contre l'erreur d'hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Protection contre l'erreur d'hydratation - ne pas rendre côté serveur
  if (!isClient) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4 sections principales avec sous-rubriques organisées */}
      <EstablishmentMainSections
        establishment={{
          id: establishment.id,
          name: establishment.name,
          description: establishment.description,
          services: establishment.services,
          ambiance: establishment.ambiance,
          specialties: establishment.specialties,
          atmosphere: establishment.atmosphere,
          detailedServices: establishment.detailedServices,
          clienteleInfo: establishment.clienteleInfo,
          informationsPratiques: establishment.informationsPratiques,
          activities: establishment.activities,
          paymentMethods: establishment.paymentMethods,
          accessibilite: establishment.accessibilite,
          parking: establishment.parking,
          terrasse: establishment.terrasse,
          smartEnrichmentData: establishment.smartEnrichmentData,
          enrichmentData: establishment.enrichmentData,
          accessibilityDetails: establishment.accessibilityDetails,
          detailedPayments: establishment.detailedPayments,
          childrenServices: establishment.childrenServices
        }}
      />

      {/* Les réseaux sociaux sont affichés dans EstablishmentInfo.tsx */}
    </div>
  );
}