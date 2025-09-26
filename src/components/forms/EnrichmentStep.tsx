"use client";

import { useState, useEffect } from 'react';
import { EnrichmentData, enrichmentSystem } from '@/lib/enrichment-system';
import EnrichmentSections from '@/components/EnrichmentSections';
import HybridEnrichmentForm, { HybridEnrichmentData } from './HybridEnrichmentForm';

interface EnrichmentStepProps {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  isVisible: boolean;
  onEnrichmentDataChange?: (data: EnrichmentData | null) => void;
}

export default function EnrichmentStep({ onEnrichmentComplete, onSkip, isVisible, onEnrichmentDataChange }: EnrichmentStepProps) {
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
    const isUberEatsUrl = url.includes('ubereats.com') || url.includes('uber.com/fr/store');
    
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600 mt-2">
          Gagnez du temps ! Ajoutez votre lien Google MAPS de votre établissement, pour pré-remplir automatiquement vos informations et optimiser votre visibilité.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="google_business_url" className="block text-sm font-medium mb-2">
              🔗 Lien Google Maps de votre établissement
        </label>
        <input
          type="url"
          id="google_business_url"
          value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
          placeholder="https://goo.gl/maps/votre-etablissement"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
            <p className="text-xs text-gray-500 mt-1">
              Copiez-collez l'URL de votre établissement depuis Google Maps ou Google My Business
        </p>
      </div>

          {/* Champ TheFork */}
          <div>
            <label htmlFor="thefork_url" className="block text-sm font-medium mb-2">
              🍴 Lien TheFork (recommandé)
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                theForkValid === false ? 'border-red-500' : 
                theForkValid === true ? 'border-green-500' : 'border-gray-300'
              }`}
            />
            <div className="flex items-center mt-1">
              {theForkValid === true && (
                <span className="text-xs text-green-600 flex items-center">
                  ✅ URL TheFork valide
                </span>
              )}
              {theForkValid === false && (
                <span className="text-xs text-red-600 flex items-center">
                  ❌ URL TheFork invalide (doit contenir thefork.com, thefork.fr ou lafourchette.com)
                </span>
              )}
              {theForkValid === null && theForkUrl.trim() === '' && (
                <span className="text-xs text-green-600">
                  Permet aux clients de réserver directement une table
                </span>
              )}
            </div>
          </div>

          {/* Champ Uber Eats */}
          <div>
            <label htmlFor="ubereats_url" className="block text-sm font-medium mb-2">
              🚗 Lien Uber Eats (recommandé)
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                uberEatsValid === false ? 'border-red-500' : 
                uberEatsValid === true ? 'border-green-500' : 'border-gray-300'
              }`}
            />
            <div className="flex items-center mt-1">
              {uberEatsValid === true && (
                <span className="text-xs text-green-600 flex items-center">
                  ✅ URL Uber Eats valide
                </span>
              )}
              {uberEatsValid === false && (
                <span className="text-xs text-red-600 flex items-center">
                  ❌ URL Uber Eats invalide (doit contenir ubereats.com ou uber.com/fr/store)
                </span>
              )}
              {uberEatsValid === null && uberEatsUrl.trim() === '' && (
                <span className="text-xs text-blue-600">
                  Permet aux clients de commander en livraison
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleEnrichment}
            disabled={isLoading || !googleUrl.trim()}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Récupération des informations...
              </>
            ) : (
              '🚀 Lancer l\'enrichissement automatique'
            )}
          </button>
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-blue-800">Récupération des informations...</span>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
              <span className="text-red-800">❌ {error}</span>
          </div>
          <button
              type="button"
            onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Fermer
          </button>
        </div>
      )}

        {/* État de succès */}
        {enrichmentData && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-800">
                ✅ Informations récupérées avec succès !
              </h3>
              <span className="text-sm text-green-600">
                {enrichmentData.name}
              </span>
            </div>
            
            {/* Informations de base compactes */}
            <div className="bg-white p-3 rounded border mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <p><strong>Type:</strong> {enrichmentData.establishmentType}</p>
                <p><strong>Prix:</strong> {'€'.repeat(enrichmentData.priceLevel)}</p>
                <p><strong>Note:</strong> {enrichmentData.googleRating}/5</p>
                <p><strong>Tags:</strong> {enrichmentData.envieTags.length}</p>
              </div>
            </div>

            {/* Section collapsible pour les détails - Ouverte par défaut après enrichissement */}
            <details className="bg-white rounded border" open={true}>
              <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-900">
                📋 Voir toutes les informations détaillées ({enrichmentData.envieTags.length} commodités générés)
              </summary>
              <div className="p-4 border-t">
                <EnrichmentSections 
                  enrichmentData={enrichmentData} 
                  readOnly={true} 
                />
              </div>
            </details>

            {/* Formulaire hybride pour les informations complémentaires */}
            <div className="mt-6">
              <HybridEnrichmentForm
                initialData={hybridData}
                onChange={setHybridData}
                title="Complétez avec vos informations spécifiques"
              />
            </div>

            {/* Message informatif */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                💡 <strong>Les informations ont été récupérées !</strong> Vérifiez les détails ci-dessus, puis cliquez sur "Continuer" pour les intégrer.
              </p>
              
              {/* Bouton pour continuer */}
              <button
                type="button"
                onClick={() => {
                  if (enrichmentData) {
                    // Combiner les données d'enrichissement automatique et les données hybrides
                    const combinedData = {
                      ...enrichmentData,
                      // Ajouter les données hybrides
                      accessibilityDetails: hybridData.accessibilityDetails,
                      detailedServices: hybridData.detailedServices,
                      clienteleInfo: hybridData.clienteleInfo,
                      detailedPayments: hybridData.detailedPayments,
                      childrenServices: hybridData.childrenServices,
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
        )}

      </div>

    </div>
  );
}