"use client";

import { useState, useEffect } from 'react';
import { EnrichmentData, enrichmentSystem } from '@/lib/enrichment-system';
import { smartEnrichmentService, SmartEnrichmentData, EnrichmentSuggestions } from '@/lib/smart-enrichment-service';
import EnrichmentSections from '@/components/EnrichmentSections';

interface SmartEnrichmentStepProps {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  isVisible: boolean;
  onEnrichmentDataChange?: (data: EnrichmentData | null) => void;
  establishmentType?: string;
}

export default function SmartEnrichmentStep({ 
  onEnrichmentComplete, 
  onSkip, 
  isVisible, 
  onEnrichmentDataChange,
  establishmentType = 'restaurant'
}: SmartEnrichmentStepProps) {
  const [googleUrl, setGoogleUrl] = useState('');
  const [theForkUrl, setTheForkUrl] = useState('');
  const [uberEatsUrl, setUberEatsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [smartData, setSmartData] = useState<SmartEnrichmentData | null>(null);
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theForkValid, setTheForkValid] = useState<boolean | null>(null);
  const [uberEatsValid, setUberEatsValid] = useState<boolean | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});

  // Réinitialiser l'état quand le composant devient visible
  useEffect(() => {
    if (isVisible) {
      setGoogleUrl('');
      setTheForkUrl('');
      setUberEatsUrl('');
      setEnrichmentData(null);
      setSmartData(null);
      setSuggestions(null);
      setError(null);
      setTheForkValid(null);
      setUberEatsValid(null);
      setSelectedSuggestions({});
      
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
      
      // Générer les suggestions intelligentes
      const smartSuggestions = smartEnrichmentService.analyzeEnrichmentGaps(finalData, establishmentType);
      setSuggestions(smartSuggestions);
      
      // Créer les données intelligentes
      const smartEnrichmentData = smartEnrichmentService.combineEnrichmentData(finalData, {}, establishmentType);
      setSmartData(smartEnrichmentData);
      
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

  const handleSuggestionToggle = (suggestionKey: string, checked: boolean) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [suggestionKey]: checked
    }));
  };

  const handleContinue = () => {
    if (!enrichmentData || !smartData) return;

    // Créer les données manuelles basées sur les suggestions sélectionnées
    const manualData = createManualDataFromSuggestions(selectedSuggestions, suggestions);
    
    // Combiner avec les données intelligentes
    const finalSmartData = smartEnrichmentService.combineEnrichmentData(enrichmentData, manualData, establishmentType);
    
    // Valider la cohérence
    const validation = smartEnrichmentService.validateEnrichmentConsistency(finalSmartData);
    
    if (!validation.isValid) {
      setError(`Données incohérentes: ${validation.warnings.join(', ')}`);
      return;
    }

    // Convertir en format EnrichmentData pour la compatibilité
    const finalEnrichmentData: EnrichmentData = {
      ...enrichmentData,
      accessibilityDetails: manualData.accessibilityDetails,
      detailedServices: manualData.detailedServices,
      clienteleInfo: manualData.clienteleInfo,
      detailedPayments: manualData.detailedPayments,
      childrenServices: manualData.childrenServices,
      parkingInfo: manualData.parkingInfo
    };

    onEnrichmentComplete(finalEnrichmentData);
  };

  // Validation URL TheFork
  const validateTheForkUrl = async (url: string) => {
    if (!url.trim()) {
      setTheForkValid(null);
      return;
    }

    const isTheForkUrl = url.includes('lafourchette.com') || url.includes('thefork.com') || url.includes('thefork.fr');
    
    if (!isTheForkUrl) {
      setTheForkValid(false);
      return;
    }

    try {
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

    const isUberEatsUrl = url.includes('ubereats.com') || url.includes('uber.com/fr/store');
    
    if (!isUberEatsUrl) {
      setUberEatsValid(false);
      return;
    }

    try {
      setUberEatsValid(true);
    } catch (e) {
      setUberEatsValid(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Enrichissement intelligent
        </h2>
        <p className="text-gray-600">
          Ajoutez votre lien Google Maps pour récupérer automatiquement vos informations et recevoir des suggestions personnalisées.
        </p>
      </div>

      {/* Formulaire de saisie */}
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
                  ❌ URL TheFork invalide
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
                  ❌ URL Uber Eats invalide
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
                Analyse en cours...
              </>
            ) : (
              '🚀 Lancer l\'enrichissement intelligent'
            )}
          </button>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            <span className="text-blue-800">Récupération et analyse des informations...</span>
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

      {/* Résultats de l'enrichissement intelligent */}
      {smartData && suggestions && (
        <div className="space-y-6">
          {/* Données récupérées automatiquement */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="text-xl mr-2">✅</span>
              Informations récupérées automatiquement
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Nom:</strong> {enrichmentData?.name}
              </div>
              <div>
                <strong>Type:</strong> {enrichmentData?.establishmentType}
              </div>
              <div>
                <strong>Note:</strong> {enrichmentData?.googleRating}/5
              </div>
              <div>
                <strong>Confiance:</strong> {Math.round(smartData.enrichmentMetadata.googleConfidence * 100)}%
              </div>
            </div>
          </div>

          {/* Suggestions intelligentes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="text-xl mr-2">💡</span>
              Suggestions personnalisées pour votre {establishmentType}
            </h3>
            
            {/* Recommandations */}
            {suggestions.recommended.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-blue-900 mb-3">🔵 Recommandé</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.recommended.map((suggestion, index) => {
                    const suggestionKey = `${suggestion.category}-${suggestion.value}`;
                    return (
                      <label key={index} className="flex items-center space-x-3 p-3 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions[suggestionKey] || false}
                          onChange={(e) => handleSuggestionToggle(suggestionKey, e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium">{suggestion.value}</span>
                          <p className="text-xs text-gray-600">{suggestion.reason}</p>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Options supplémentaires */}
            {suggestions.optional.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 mb-3">⚪ Optionnel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.optional.map((suggestion, index) => {
                    const suggestionKey = `${suggestion.category}-${suggestion.value}`;
                    return (
                      <label key={index} className="flex items-center space-x-3 p-3 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions[suggestionKey] || false}
                          onChange={(e) => handleSuggestionToggle(suggestionKey, e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium">{suggestion.value}</span>
                          <p className="text-xs text-gray-600">{suggestion.reason}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Données déjà trouvées */}
          {suggestions.alreadyFound.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">✅</span>
                Déjà récupéré de Google
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.alreadyFound.map((item, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {item.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bouton de continuation */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">
                  Prêt à continuer ?
                </h3>
                <p className="text-sm text-orange-700">
                  {Object.values(selectedSuggestions).filter(Boolean).length} suggestions sélectionnées
                </p>
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
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

// Fonction utilitaire pour créer les données manuelles
function createManualDataFromSuggestions(
  selectedSuggestions: Record<string, boolean>, 
  suggestions: EnrichmentSuggestions | null
): any {
  if (!suggestions) return {};

  const manualData: any = {
    accessibilityDetails: {},
    detailedServices: {},
    clienteleInfo: {},
    detailedPayments: {},
    childrenServices: {},
    parkingInfo: {}
  };

  // Grouper les suggestions sélectionnées par catégorie
  const allSuggestions = [...suggestions.recommended, ...suggestions.optional];
  
  allSuggestions.forEach(suggestion => {
    const suggestionKey = `${suggestion.category}-${suggestion.value}`;
    if (selectedSuggestions[suggestionKey]) {
      const category = suggestion.category;
      if (manualData[category]) {
        manualData[category][suggestion.value] = true;
      }
    }
  });

  return manualData;
}
