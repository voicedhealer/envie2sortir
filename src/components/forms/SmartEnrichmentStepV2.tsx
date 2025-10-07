"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { EnrichmentData, enrichmentSystem } from '@/lib/enrichment-system';
import { smartEnrichmentServiceV2, EnrichmentSuggestions } from '@/lib/smart-enrichment-service-v2';

interface SmartEnrichmentStepV2Props {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  isVisible: boolean;
  onEnrichmentDataChange?: (data: EnrichmentData | null) => void;
  establishmentType: string;
}

export default function SmartEnrichmentStepV2({
  onEnrichmentComplete,
  onSkip,
  isVisible,
  onEnrichmentDataChange,
  establishmentType,
}: SmartEnrichmentStepV2Props) {
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState('');
  const [theForkUrl, setTheForkUrl] = useState('');
  const [uberEatsUrl, setUberEatsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [smartData, setSmartData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestions | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Validation des URLs
  const validateUrl = (url: string, type: 'google' | 'thefork' | 'ubereats'): string | null => {
    if (!url.trim()) return null;
    
    try {
      const urlObj = new URL(url);
      
      switch (type) {
        case 'google':
          if (!urlObj.hostname.includes('google.com') && !urlObj.hostname.includes('goo.gl')) {
            return 'Veuillez saisir une URL Google Maps valide';
          }
          break;
        case 'thefork':
          if (!urlObj.hostname.includes('thefork.fr') && !urlObj.hostname.includes('thefork.com')) {
            return 'Veuillez saisir une URL TheFork valide';
          }
          break;
        case 'ubereats':
          if (!urlObj.hostname.includes('ubereats.com')) {
            return 'Veuillez saisir une URL Uber Eats valide';
          }
          break;
      }
      
      return null;
    } catch {
      return 'URL invalide';
    }
  };

  const handleEnrichment = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Validation de l'URL Google
      const googleError = validateUrl(googleBusinessUrl, 'google');
      if (googleError) {
        setError(googleError);
        setIsLoading(false);
        return;
      }

      // Validation des URLs optionnelles
      const theForkError = validateUrl(theForkUrl, 'thefork');
      if (theForkError) {
        setError(theForkError);
        setIsLoading(false);
        return;
      }

      const uberEatsError = validateUrl(uberEatsUrl, 'ubereats');
      if (uberEatsError) {
        setError(uberEatsError);
        setIsLoading(false);
        return;
      }

      // Appel réel à l'API Google
      console.log('🚀 Lancement de l\'enrichissement Google avec:', googleBusinessUrl);
      const googleData = await enrichmentSystem.triggerGoogleEnrichment(googleBusinessUrl);
      
      // Ajouter les URLs optionnelles
      const finalData: EnrichmentData = {
        ...googleData,
        theForkLink: theForkUrl.trim() || googleData.theForkLink,
        uberEatsLink: uberEatsUrl.trim() || googleData.uberEatsLink
      };

      setEnrichmentData(finalData);
      
      // Générer les suggestions intelligentes avec détection automatique du type
      const smartSuggestions = smartEnrichmentServiceV2.analyzeEnrichmentGaps(finalData);
      setSuggestions(smartSuggestions);
      
      // Créer les données intelligentes avec détection automatique du type
      const smartEnrichmentData = smartEnrichmentServiceV2.combineEnrichmentData(finalData, {});
      setSmartData(smartEnrichmentData);
      
      // Notifier le composant parent des nouvelles données
      if (onEnrichmentDataChange) {
        onEnrichmentDataChange(finalData);
      }

      setShowSuggestions(true);
    } catch (err) {
      console.error('Erreur enrichissement:', err);
      setError(`Erreur lors de l'enrichissement: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
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

  const createManualDataFromSuggestions = (selected: Record<string, boolean>, suggestions: EnrichmentSuggestions) => {
    const manualData: any = {};
    
    Object.entries(selected).forEach(([key, isSelected]) => {
      if (isSelected) {
        const [category, value] = key.split('-');
        if (!manualData[category]) {
          manualData[category] = [];
        }
        manualData[category].push(value);
      }
    });
    
    return manualData;
  };

  const handleContinue = () => {
    if (!enrichmentData || !smartData) return;

    // Créer les données manuelles basées sur les suggestions sélectionnées
    const manualData = suggestions ? createManualDataFromSuggestions(selectedSuggestions, suggestions) : {};
    
    // Combiner avec les données intelligentes
    const finalSmartData = smartEnrichmentServiceV2.combineEnrichmentData(enrichmentData, manualData);
    
    // Valider la cohérence
    const validation = smartEnrichmentServiceV2.validateEnrichmentConsistency(finalSmartData);
    
    if (!validation.isValid) {
      setError(`Données incohérentes: ${validation.warnings.join(', ')}`);
      return;
    }

    // Créer les données d'enrichissement finales avec les suggestions manuelles
    const enrichedDataWithManual = {
      ...enrichmentData,
      // Ajouter les données d'enrichissement manuel basées sur les suggestions
      accessibilityDetails: manualData.accessibility ? manualData.accessibility.join(', ') : enrichmentData.accessibilityDetails,
      detailedServices: manualData.services ? manualData.services.join(', ') : enrichmentData.detailedServices,
      clienteleInfo: manualData.clientele ? manualData.clientele.join(', ') : enrichmentData.clienteleInfo,
      detailedPayments: manualData.payments ? manualData.payments.join(', ') : enrichmentData.detailedPayments,
      childrenServices: manualData.children ? manualData.children.join(', ') : enrichmentData.childrenServices,
      parkingInfo: manualData.parking ? manualData.parking.join(', ') : enrichmentData.parkingInfo,
      // Ajouter les données de santé et sécurité
      healthOptions: manualData.health ? manualData.health : enrichmentData.healthOptions,
      // Ajouter les données de parking
      parkingOptions: manualData.parking ? manualData.parking : enrichmentData.parkingOptions,
    };

    // Continuer avec les données finales incluant les suggestions manuelles
    onEnrichmentComplete(enrichedDataWithManual);
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Ajoutez votre lien Google Maps pour récupérer automatiquement vos informations et recevoir des suggestions personnalisées.
        </p>
      </div>

      {/* Formulaire de saisie */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="google_business_url">
              🔗 Lien Google Maps de votre établissement
            </label>
            <input
              type="url"
              id="google_business_url"
              value={googleBusinessUrl}
              onChange={(e) => setGoogleBusinessUrl(e.target.value)}
              placeholder="https://goo.gl/maps/votre-etablissement"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Copiez-collez l'URL de votre établissement depuis Google Maps ou Google My Business
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="thefork_url">
              🍴 Lien TheFork (recommandé)
            </label>
            <input
              type="url"
              id="thefork_url"
              value={theForkUrl}
              onChange={(e) => setTheForkUrl(e.target.value)}
              placeholder="https://www.thefork.fr/restaurant/votre-restaurant"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border-gray-300"
            />
            <div className="flex items-center mt-1">
              {theForkUrl && (
                <div className="flex items-center">
                  {validateUrl(theForkUrl, 'thefork') ? (
                    <span className="text-red-500 text-xs flex items-center">
                      <span className="mr-1">❌</span>
                      {validateUrl(theForkUrl, 'thefork')}
                    </span>
                  ) : (
                    <span className="text-green-500 text-xs flex items-center">
                      <span className="mr-1">✅</span>
                      URL TheFork valide
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="ubereats_url">
              🚗 Lien Uber Eats (recommandé)
            </label>
            <input
              type="url"
              id="ubereats_url"
              value={uberEatsUrl}
              onChange={(e) => setUberEatsUrl(e.target.value)}
              placeholder="https://www.ubereats.com/fr/store/votre-restaurant"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border-gray-300"
            />
            <div className="flex items-center mt-1">
              {uberEatsUrl && (
                <div className="flex items-center">
                  {validateUrl(uberEatsUrl, 'ubereats') ? (
                    <span className="text-red-500 text-xs flex items-center">
                      <span className="mr-1">❌</span>
                      {validateUrl(uberEatsUrl, 'ubereats')}
                    </span>
                  ) : (
                    <span className="text-green-500 text-xs flex items-center">
                      <span className="mr-1">✅</span>
                      URL Uber Eats valide
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleEnrichment}
            disabled={!googleBusinessUrl.trim() || isLoading}
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
              '🚀 Lancer l\'enrichissement intelligent'
            )}
          </button>
        </div>
      </div>

      {/* Résultats de l'enrichissement */}
      {showSuggestions && enrichmentData && smartData && suggestions && (
        <div className="space-y-6">
          {/* Données récupérées automatiquement par Google */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="text-xl mr-2">✅</span>
              Informations récupérées automatiquement par Google
            </h3>
            
            {/* Métadonnées de base */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
              <div>
                <strong>Nom:</strong> {enrichmentData?.name}
              </div>
              <div>
                <strong>Type:</strong> 
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {enrichmentData?.establishmentType || smartData?.establishmentType}
                  {enrichmentData?.establishmentType && enrichmentData.establishmentType !== 'autre' && (
                    <span className="ml-1 text-green-600">✓ Détecté</span>
                  )}
                </span>
              </div>
              <div>
                <strong>Note:</strong> {enrichmentData?.googleRating}/5
              </div>
              <div>
                <strong>Confiance:</strong> {Math.round(smartData.enrichmentMetadata.googleConfidence * 100)}%
              </div>
            </div>

            {/* Données détaillées récupérées par Google */}
            <div className="space-y-4">
              {/* Services récupérés */}
              {enrichmentData?.servicesArray && enrichmentData.servicesArray.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">🛠️</span>
                    Services récupérés par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.servicesArray.map((service, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Moyens de paiement récupérés */}
              {enrichmentData?.paymentMethodsArray && enrichmentData.paymentMethodsArray.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">💳</span>
                    Moyens de paiement récupérés par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.paymentMethodsArray.map((payment, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {payment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessibilité récupérée */}
              {enrichmentData?.accessibilityInfo && enrichmentData.accessibilityInfo.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">♿</span>
                    Accessibilité récupérée par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.accessibilityInfo.map((access, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {access}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spécialités récupérées */}
              {enrichmentData?.specialties && enrichmentData.specialties.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">⭐</span>
                    Spécialités récupérées par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.specialties.map((specialty, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambiance récupérée */}
              {enrichmentData?.atmosphere && enrichmentData.atmosphere.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">🎭</span>
                    Ambiance récupérée par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.atmosphere.map((ambiance, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {ambiance}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations pratiques récupérées */}
              {enrichmentData?.practicalInfo && enrichmentData.practicalInfo.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    Informations pratiques récupérées par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.practicalInfo.map((info, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {info}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientèle récupérée */}
              {enrichmentData?.populairePour && enrichmentData.populairePour.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <span className="mr-2">👥</span>
                    Clientèle récupérée par Google
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.populairePour.map((clientele, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {clientele}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions intelligentes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="text-xl mr-2">💡</span>
              Suggestions personnalisées pour votre {smartData?.establishmentType || establishmentType}
            </h3>
            
            {/* Recommandations */}
            {suggestions.recommended.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-blue-900 mb-3">🔵 Recommandé</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.recommended.map((suggestion: any, index: number) => {
                    const suggestionKey = `${suggestion.category}-${suggestion.value}`;
                    const isHealth = suggestion.category === 'health';
                    const isParking = suggestion.category === 'parking';
                    const isWarning = suggestion.type === 'warning';
                    const isSolution = suggestion.type === 'solution';
                    
                    return (
                      <label key={index} className={`flex items-center space-x-3 p-3 rounded border hover:bg-gray-50 cursor-pointer ${
                        isHealth && isWarning ? 'bg-red-50 border-red-200' :
                        isHealth && isSolution ? 'bg-green-50 border-green-200' :
                        isParking ? 'bg-blue-50 border-blue-200' :
                        'bg-white border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedSuggestions[suggestionKey] || false}
                          onChange={(e) => handleSuggestionToggle(suggestionKey, e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <span className={`font-medium ${
                            isHealth && isWarning ? 'text-red-800' :
                            isHealth && isSolution ? 'text-green-800' :
                            isParking ? 'text-blue-800' :
                            'text-gray-900'
                          }`}>
                            {suggestion.value}
                          </span>
                          <p className={`text-xs ${
                            isHealth && isWarning ? 'text-red-600' :
                            isHealth && isSolution ? 'text-green-600' :
                            isParking ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {suggestion.reason}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${
                          isHealth && isWarning ? 'text-red-600' :
                          isHealth && isSolution ? 'text-green-600' :
                          isParking ? 'text-blue-600' :
                          'text-blue-600'
                        }`}>
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optionnel */}
            {suggestions.optional.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 mb-3">⚪ Optionnel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.optional.map((suggestion: any, index: number) => {
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

          {/* Actions */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">Prêt à continuer ?</h3>
                <p className="text-sm text-orange-700">
                  {Object.values(selectedSuggestions).filter(Boolean).length} suggestions sélectionnées
                </p>
              </div>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
              >
                ✅ Continuer avec ces informations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton Skip */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Passer cette étape
        </button>
      </div>
    </div>
  );
}