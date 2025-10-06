"use client";

import { useState, useEffect } from 'react';
import { EnrichmentData, enrichmentSystem } from '@/lib/enrichment-system';
import EnrichmentSections from '@/components/EnrichmentSections';
import HybridEnrichmentForm, { HybridEnrichmentData } from './HybridEnrichmentForm';
import SmartEnrichmentStepV2 from './SmartEnrichmentStepV2';

interface EnrichmentStepProps {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  isVisible: boolean;
  onEnrichmentDataChange?: (data: EnrichmentData | null) => void;
  establishmentType?: string;
  useSmartEnrichment?: boolean;
}

export default function EnrichmentStep({ 
  onEnrichmentComplete, 
  onSkip, 
  isVisible, 
  onEnrichmentDataChange,
  establishmentType = 'restaurant',
  useSmartEnrichment = true
}: EnrichmentStepProps) {
  const [googleUrl, setGoogleUrl] = useState('');
  const [theForkUrl, setTheForkUrl] = useState('');
  const [uberEatsUrl, setUberEatsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theForkValid, setTheForkValid] = useState<boolean | null>(null);
  const [uberEatsValid, setUberEatsValid] = useState<boolean | null>(null);
  const [hybridData, setHybridData] = useState<HybridEnrichmentData>({});

  // Réinitialiser l'état quand le composant devient visible
  useEffect(() => {
    if (isVisible) {
      setGoogleUrl('');
      setTheForkUrl('');
      setUberEatsUrl('');
      setEnrichmentData(null);
      setError(null);
      setTheForkValid(null);
      setUberEatsValid(null);
      
      // Notifier le composant parent de la réinitialisation
      if (onEnrichmentDataChange) {
        onEnrichmentDataChange(null);
      }
    }
  }, [isVisible, onEnrichmentDataChange]);

  const handleGoogleEnrichment = async () => {
    if (!googleUrl.trim()) {
      setError('Veuillez saisir une URL Google My Business');
      return;
    }

    setIsLoading(true);
    setError(null);
    
      try {
      const data = await enrichmentSystem.triggerGoogleEnrichment(googleUrl);
        
        // Stocker les données enrichies pour affichage
        const finalData = {
          ...data,
          theForkLink: theForkUrl.trim() || data.theForkLink,
          uberEatsLink: uberEatsUrl.trim() || undefined
        };
        setEnrichmentData(finalData);
        
        // Notifier le composant parent des nouvelles données
        if (onEnrichmentDataChange) {
          onEnrichmentDataChange(finalData);
        }
      } catch (err) {
        console.error('Erreur enrichissement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enrichissement');
      } finally {
        setIsLoading(false);
    }
  };


  // Validation URL TheFork
  const validateTheForkUrl = async (url: string) => {
    if (!url.trim()) {
      setTheForkValid(null);
      return;
    }

    // Vérifier que c'est bien une URL TheFork
    const isTheForkUrl = url.includes('lafourchette.com') || url.includes('thefork.com') || url.includes('thefork.fr');
    
    if (!isTheForkUrl) {
      setTheForkValid(false);
      return;
    }

    try {
      // Vérifier que l'URL est accessible (optionnel)
      setTheForkValid(true);
    } catch (e) {
      setTheForkValid(false);
    }
  };

  // Validation URL Uber Eats
  const validateUberEatsUrl = async (url: string) => {
    if (!url.trim()) {
      setUberEatsValid(null);
      return;
    }

    // Vérifier que c'est bien une URL Uber Eats
    const isUberEatsUrl = url.includes('ubereats.com');
    
    if (!isUberEatsUrl) {
      setUberEatsValid(false);
      return;
    }

    try {
      // Vérifier que l'URL est accessible (optionnel)
      setUberEatsValid(true);
    } catch (e) {
      setUberEatsValid(false);
    }
  };

  if (!isVisible) return null;

  // Utiliser l'enrichissement intelligent si activé
  if (useSmartEnrichment) {
    return (
      <SmartEnrichmentStepV2
        onEnrichmentComplete={onEnrichmentComplete}
        onSkip={onSkip}
        isVisible={isVisible}
        onEnrichmentDataChange={onEnrichmentDataChange}
        establishmentType={establishmentType}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enrichissement des données
        </h2>
        <p className="text-gray-600">
          Ajoutez votre lien Google My Business pour récupérer automatiquement vos informations.
        </p>
      </div>

      {/* Formulaire de saisie */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="google_url">
              🔗 Lien Google My Business
            </label>
            <input
              type="url"
              id="google_url"
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              placeholder="https://goo.gl/maps/votre-etablissement"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Copiez-collez l'URL de votre établissement depuis Google My Business
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="thefork_url">
              🍴 Lien TheFork (optionnel)
            </label>
            <input
              type="url"
              id="thefork_url"
              value={theForkUrl}
              onChange={(e) => {
                setTheForkUrl(e.target.value);
                validateTheForkUrl(e.target.value);
              }}
              placeholder="https://www.thefork.fr/restaurant/votre-restaurant"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border-gray-300"
            />
            <div className="flex items-center mt-1">
              {theForkValid === true && (
                <span className="text-green-600 text-xs flex items-center">
                  ✅ URL TheFork valide
                </span>
              )}
              {theForkValid === false && (
                <span className="text-red-600 text-xs flex items-center">
                  ❌ URL TheFork invalide
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="ubereats_url">
              🚗 Lien Uber Eats (optionnel)
            </label>
            <input
              type="url"
              id="ubereats_url"
              value={uberEatsUrl}
              onChange={(e) => {
                setUberEatsUrl(e.target.value);
                validateUberEatsUrl(e.target.value);
              }}
              placeholder="https://www.ubereats.com/fr/store/votre-restaurant"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border-gray-300"
            />
            <div className="flex items-center mt-1">
              {uberEatsValid === true && (
                <span className="text-green-600 text-xs flex items-center">
                  ✅ URL Uber Eats valide
                </span>
              )}
              {uberEatsValid === false && (
                <span className="text-red-600 text-xs flex items-center">
                  ❌ URL Uber Eats invalide
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleEnrichment}
            disabled={!googleUrl.trim() || isLoading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enrichissement en cours...
              </>
            ) : (
              '🚀 Lancer l\'enrichissement'
            )}
          </button>
        </div>
      </div>

      {/* Affichage des données enrichies */}
      {enrichmentData && (
        <div className="space-y-6">
          {/* Données récupérées automatiquement */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="text-xl mr-2">✅</span>
              Informations récupérées automatiquement
            </h3>
            <EnrichmentSections data={enrichmentData} />
          </div>

          {/* Formulaire d'enrichissement manuel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Formulaire d'enrichissement manuel pour les informations complémentaires
            </h3>
            <p className="text-gray-600 mb-6">
              Cochez les informations les plus pertinentes pour votre établissement. Ces détails aideront les clients à mieux vous trouver et vous choisir.
            </p>
            
            <HybridEnrichmentForm
              data={enrichmentData}
              onDataChange={setHybridData}
              title="Cochez les informations les plus pertinentes pour votre établissement"
            />
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Passer cette étape
              </button>
              <button
                onClick={() => {
                  if (enrichmentData) {
                    // Combiner les données d'enrichissement automatique et les données manuelles
                    const combinedData = {
                      ...enrichmentData,
                      // Ajouter les données d'enrichissement manuel
                      accessibilityDetails: hybridData.accessibilityDetails,
                      detailedServices: hybridData.detailedServices,
                      clienteleInfo: hybridData.clienteleInfo,
                      detailedPayments: hybridData.detailedPayments,
                      childrenServices: hybridData.childrenServices,
                      parkingInfo: hybridData.parkingInfo,
                    };
                    onEnrichmentComplete(combinedData);
                  }
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ✅ Continuer avec ces informations
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}