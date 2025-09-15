"use client";

import { useState, useEffect } from 'react';
import { EnrichmentData, enrichmentSystem } from '@/lib/enrichment-system';
import EnrichmentSections from '@/components/EnrichmentSections';

interface EnrichmentStepProps {
  onEnrichmentComplete: (data: EnrichmentData) => void;
  onSkip: () => void;
  isVisible: boolean;
}

export default function EnrichmentStep({ onEnrichmentComplete, onSkip, isVisible }: EnrichmentStepProps) {
  const [googleUrl, setGoogleUrl] = useState('');
  const [theForkUrl, setTheForkUrl] = useState('');
  const [uberEatsUrl, setUberEatsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [theForkValid, setTheForkValid] = useState<boolean | null>(null);
  const [uberEatsValid, setUberEatsValid] = useState<boolean | null>(null);

  // Réinitialiser l'état quand le composant devient visible
  useEffect(() => {
    if (isVisible) {
      setGoogleUrl('');
      setTheForkUrl('');
      setUberEatsUrl('');
      setEnrichmentData(null);
      setError(null);
      setShowCustomization(false);
      setCustomTags([]);
      setNewTag('');
      setTheForkValid(null);
      setUberEatsValid(null);
    }
  }, [isVisible]);

  const handleGoogleEnrichment = async () => {
    if (!googleUrl.trim()) {
      setError('Veuillez saisir une URL Google My Business');
      return;
    }

    setIsLoading(true);
    setError(null);
    
      try {
      const data = await enrichmentSystem.triggerGoogleEnrichment(googleUrl);
        setEnrichmentData(data);
      setCustomTags([...data.envieTags]); // Initialiser avec les tags générés
      } catch (err) {
        console.error('Erreur enrichissement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enrichissement');
      } finally {
        setIsLoading(false);
    }
  };

  const handleAcceptEnrichment = () => {
    console.log('Validation de l\'enrichissement avec les données:', enrichmentData);
    
    if (enrichmentData) {
      const finalData = {
        ...enrichmentData,
        envieTags: customTags,
        theForkLink: theForkUrl.trim() || enrichmentData.theForkLink,
        uberEatsLink: uberEatsUrl.trim() || undefined
      };
      console.log('Données finales transmises:', finalData);
      onEnrichmentComplete(finalData);
    } else {
      console.error('Aucune donnée d\'enrichissement disponible');
    }
  };

  const handleCustomizeEnrichment = () => {
    console.log('🎨 handleCustomizeEnrichment appelé');
    setShowCustomization(true);
    console.log('✅ showCustomization défini à true');
  };

  const handleSkipEnrichment = () => {
    onSkip();
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

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      const formattedTag = newTag.trim().toLowerCase().startsWith('envie de') 
        ? newTag.trim() 
        : `Envie de ${newTag.trim().toLowerCase()}`;
        setCustomTags([...customTags, formattedTag]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setCustomTags(customTags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomTag();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          ✨ Enrichissement automatique de votre profil
        </h2>
        <p className="text-gray-600 mt-2">
          Gagnez du temps ! Ajoutez votre lien Google MAPS de votre établissement, pour pré-remplir automatiquement vos informations et optimiser votre visibilité.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="google_business_url" className="block text-sm font-medium mb-2">
              🔗 Lien Google My Business
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
                <span className="text-xs text-gray-500">
                  Permet aux clients de réserver directement une table
                </span>
              )}
            </div>
          </div>

          {/* Champ Uber Eats */}
          <div>
            <label htmlFor="ubereats_url" className="block text-sm font-medium mb-2">
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
                <span className="text-xs text-gray-500">
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
        {enrichmentData && !showCustomization && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              🎯 Informations détectées automatiquement :
          </h3>
          
            <div className="space-y-4">
          {/* Informations de base */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">📋 Informations de base</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>Nom:</strong> {enrichmentData.name}</p>
                <p><strong>Type:</strong> {enrichmentData.establishmentType}</p>
                <p><strong>Gamme de prix:</strong> {'€'.repeat(enrichmentData.priceLevel)}</p>
                  <p><strong>Note:</strong> {enrichmentData.googleRating}/5 ({enrichmentData.googleReviewCount} avis)</p>
                  {enrichmentData.phone && <p><strong>Téléphone:</strong> {enrichmentData.phone}</p>}
                {enrichmentData.website && <p><strong>Site web:</strong> {enrichmentData.website}</p>}
                </div>
            </div>
            
              {/* Tags "envie" générés */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">
                  🏷️ Tags "envie" générés ({enrichmentData.envieTags.length})
                </h4>
              <div className="flex flex-wrap gap-2">
                {enrichmentData.envieTags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
            </div>
          </div>

          {/* Spécialités détectées */}
          {enrichmentData.specialties.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">
                    🍽️ Spécialités détectées ({enrichmentData.specialties.length})
                  </h4>
              <div className="flex flex-wrap gap-2">
                {enrichmentData.specialties.map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

              {/* Suggestion TheFork */}
              {enrichmentData.establishmentType === 'restaurant' && (
                <div className="bg-white p-3 rounded border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-2">🍴 Intégration TheFork suggérée</h4>
                  <p className="text-sm text-gray-600">
                    💡 Ajoutez votre lien TheFork pour permettre les réservations directes !
                  </p>
                  </div>
                )}
              </div>

            {/* Sections détaillées d'enrichissement */}
            <div className="mt-6">
              <EnrichmentSections 
                enrichmentData={enrichmentData} 
                readOnly={true} 
              />
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAcceptEnrichment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Valider ces informations
              </button>
              <button
                type="button"
                onClick={handleCustomizeEnrichment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ✏️ Personnaliser avant validation
              </button>
              <button
                type="button"
                onClick={handleSkipEnrichment}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                ❌ Saisir manuellement
              </button>
            </div>
          </div>
        )}

        {/* Section de personnalisation */}
        {showCustomization && enrichmentData && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🏷️ Personnalisez vos tags "envie"
            </h3>
            
            {/* Tags générés (éditables) */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Tags générés automatiquement :</h4>
              <div className="flex flex-wrap gap-2">
                {customTags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-white px-2 py-1 rounded border">
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ajout de tags personnalisés */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">➕ Ajoutez vos propres tags :</h4>
              <div className="flex gap-2">
              <input
                type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: Envie de manger en terrasse"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
                </div>
              </div>

            {/* Tags populaires suggérés */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">💡 Tags populaires pour votre secteur :</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Envie de terrasse',
                  'Envie de romantique',
                  'Envie de familial',
                  'Envie de groupe',
                  'Envie de décontracté',
                  'Envie de festif'
                ].map((suggestedTag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (!customTags.includes(suggestedTag)) {
                        setCustomTags([...customTags, suggestedTag]);
                      }
                    }}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                  >
                    + {suggestedTag}
                  </button>
                ))}
            </div>
          </div>

            {/* Actions de personnalisation */}
            <div className="flex gap-2">
            <button
                type="button"
              onClick={handleAcceptEnrichment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                ✅ Valider avec ces tags
            </button>
            <button
                type="button"
                onClick={() => setShowCustomization(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                ← Retour
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Bouton pour ignorer l'enrichissement */}
        <div className="text-center">
          <button
          type="button"
          onClick={handleSkipEnrichment}
          className="text-gray-500 hover:text-gray-700 underline"
          >
          Ignorer l'enrichissement et saisir manuellement
          </button>
        </div>
    </div>
  );
}