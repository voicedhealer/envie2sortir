"use client";

import { useState } from 'react';

export default function TestUrlDebugPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testUrl = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🔍 Test URL:', url);
      
      const response = await fetch('/api/resolve-google-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      
      console.log('📊 Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        setError(`Erreur ${response.status}: ${errorData.error || 'Inconnue'}`);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Résultat:', data);
      setResult(data);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Debug URL Google Maps</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URL Google Maps à tester :</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.google.com/maps/place/..."
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        
        <button
          onClick={testUrl}
          disabled={isLoading || !url.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Test en cours...' : 'Tester URL'}
        </button>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">❌ Erreur</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-semibold">✅ Succès</h3>
          <pre className="text-green-700 text-sm mt-2 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">📋 URLs de test :</h3>
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setUrl('https://www.google.com/maps/place/Restaurant+Test/@48.8566,2.3522,17z')}
            className="block text-blue-600 hover:underline"
          >
            URL avec coordonnées seulement
          </button>
          <button
            onClick={() => setUrl('https://www.google.com/maps/place/Le+Comptoir+du+7ème/@48.8566,2.3522,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!8m2!3d48.8566!4d2.3522!16s%2Fg%2F11c0w8wr9r')}
            className="block text-blue-600 hover:underline"
          >
            URL avec Place ID complet
          </button>
          <button
            onClick={() => setUrl('https://maps.google.com/maps/place/Test/@48.8566,2.3522,17z')}
            className="block text-blue-600 hover:underline"
          >
            URL maps.google.com
          </button>
        </div>
      </div>
    </div>
  );
}
