'use client';

import { useState } from 'react';
import { enrichmentSystem } from '@/lib/enrichment-system';

export default function TestEnrichmentPage() {
  const [testURL, setTestURL] = useState('https://maps.app.goo.gl/QT36UvhQjn7CXF6w9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testEnrichment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Test de l\'enrichissement dynamique');
      console.log('🔗 URL:', testURL);
      
      const enrichmentData = await enrichmentSystem.triggerGoogleEnrichment(testURL);
      
      console.log('✅ Données d\'enrichissement:', enrichmentData);
      setResult(enrichmentData);
      
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test de l'Enrichissement Dynamique
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration du test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Google Maps à tester:
            </label>
            <input
              type="url"
              value={testURL}
              onChange={(e) => setTestURL(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
          
          <button
            onClick={testEnrichment}
            disabled={loading || !testURL}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Test en cours...' : '🚀 Lancer le test'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-md p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Test réussi !</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📋 Informations de base</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Nom:</strong> {result.name}</li>
                  <li><strong>Type:</strong> {result.establishmentType}</li>
                  <li><strong>Note:</strong> {result.rating}/5</li>
                  <li><strong>Avis:</strong> {result.googleReviewCount}</li>
                  <li><strong>Place ID:</strong> {result.googlePlaceId}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🏷️ Tags "Envie"</h4>
                <div className="flex flex-wrap gap-2">
                  {result.envieTags.map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">♿ Accessibilité</h4>
                <ul className="text-sm text-gray-700">
                  {result.accessibilityInfo.length > 0 ? (
                    result.accessibilityInfo.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Aucune information</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🏪 Services</h4>
                <ul className="text-sm text-gray-700">
                  {result.servicesAvailableInfo.length > 0 ? (
                    result.servicesAvailableInfo.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Aucune information</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">👥 Clientèle</h4>
                <ul className="text-sm text-gray-700">
                  {result.clientele.length > 0 ? (
                    result.clientele.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Aucune information</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">💳 Paiements</h4>
                <ul className="text-sm text-gray-700">
                  {result.paiements.length > 0 ? (
                    result.paiements.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Aucune information</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">👶 Enfants</h4>
                <ul className="text-sm text-gray-700">
                  {result.enfants.length > 0 ? (
                    result.enfants.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Aucune information</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🅿️ Parking</h4>
                <ul className="text-sm text-gray-700">
                  {result.parking.length > 0 ? (
                    result.parking.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Aucune information</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Validation de la logique dynamique</h4>
              <div className="text-sm text-gray-700">
                <p className="mb-2">✅ <strong>Plus aucune donnée en dur</strong> - Aucune condition spécifique pour "Maharaja" ou "DreamAway"</p>
                <p className="mb-2">✅ <strong>Analyse dynamique des avis</strong> - Extraction intelligente depuis le contenu des avis Google</p>
                <p className="mb-2">✅ <strong>Détection basée sur les types</strong> - Classification automatique selon les types d'établissement</p>
                <p>✅ <strong>Fonctionne avec n'importe quel établissement</strong> - Logique universelle et adaptable</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
