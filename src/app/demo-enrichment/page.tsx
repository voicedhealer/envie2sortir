"use client";

import { useState } from 'react';
import EnrichmentStep from '@/components/forms/EnrichmentStep';
import { EnrichmentData } from '@/lib/enrichment-system';

export default function DemoEnrichmentPage() {
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const handleEnrichmentComplete = (data: EnrichmentData) => {
    console.log('🎯 Données d\'enrichissement reçues:', data);
    setEnrichmentData(data);
    setShowDemo(false);
  };

  const handleSkip = () => {
    console.log('❌ Enrichissement ignoré');
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Démonstration du Système d'Enrichissement
          </h1>
          <p className="text-gray-600 mb-6">
            Testez le système d'enrichissement automatique avec des URLs Google My Business réelles
          </p>
          
          {!showDemo && !enrichmentData && (
            <button
              onClick={() => setShowDemo(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              🎯 Lancer la démonstration
            </button>
          )}
        </div>

        {showDemo && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <EnrichmentStep
              onEnrichmentComplete={handleEnrichmentComplete}
              onSkip={handleSkip}
              isVisible={true}
            />
          </div>
        )}

        {enrichmentData && (
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ✅ Résultat de l'Enrichissement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📋 Informations de base</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Nom:</strong> {enrichmentData.name}</p>
                  <p><strong>Type:</strong> {enrichmentData.establishmentType}</p>
                  <p><strong>Gamme de prix:</strong> {'€'.repeat(enrichmentData.priceLevel)}</p>
                  <p><strong>Note Google:</strong> {enrichmentData.googleRating}/5</p>
                  <p><strong>Nombre d'avis:</strong> {enrichmentData.googleReviewCount}</p>
                  {enrichmentData.phone && <p><strong>Téléphone:</strong> {enrichmentData.phone}</p>}
                  {enrichmentData.website && <p><strong>Site web:</strong> {enrichmentData.website}</p>}
                  {enrichmentData.address && <p><strong>Adresse:</strong> {enrichmentData.address}</p>}
                </div>
              </div>

              {/* Tags "envie" générés */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">🏷️ Tags "envie" générés</h3>
                <div className="flex flex-wrap gap-2">
                  {enrichmentData.envieTags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spécialités détectées */}
              {enrichmentData.specialties.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">🍽️ Spécialités détectées</h3>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.specialties.map((specialty, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambiance */}
              {enrichmentData.atmosphere.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">🎭 Ambiance</h3>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.atmosphere.map((atm, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {atm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessibilité */}
              {enrichmentData.accessibility.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">♿ Accessibilité</h3>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.accessibility.map((acc, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Données techniques */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔧 Données techniques</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Place ID:</strong> {enrichmentData.googlePlaceId}</p>
                <p><strong>URL Google:</strong> {enrichmentData.googleBusinessUrl}</p>
                <p><strong>Horaires:</strong> {enrichmentData.openingHours?.length || 0} jours configurés</p>
                <p><strong>Informations pratiques:</strong> {enrichmentData.practicalInfo?.length || 0} éléments détectés</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  setEnrichmentData(null);
                  setShowDemo(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Nouveau test
              </button>
              <button
                onClick={() => {
                  setEnrichmentData(null);
                  setShowDemo(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                🏠 Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Instructions de test</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Configuration requise:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Configurez votre clé API Google Places dans le fichier .env.local</li>
              <li>Assurez-vous que le serveur Next.js est démarré</li>
            </ul>
            
            <p><strong>2. URLs de test recommandées:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Restaurants français à Paris</li>
              <li>Bars et cafés parisiens</li>
              <li>Établissements avec de bons avis Google</li>
            </ul>
            
            <p><strong>3. Fonctionnalités à tester:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Extraction automatique du Place ID</li>
              <li>Génération des tags "envie"</li>
              <li>Détection des spécialités culinaires</li>
              <li>Personnalisation des tags</li>
              <li>Sauvegarde des données enrichies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
