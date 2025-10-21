"use client";

import { useState } from 'react';
import { Trash2, Download, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ImagesManagementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCleanup = async (type: 'orphaned' | 'old', daysOld?: number) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/cleanup-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          daysOld: daysOld || 30
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur lors du nettoyage'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Images
          </h1>
          <p className="text-gray-600 mt-1">
            Nettoyage et optimisation des fichiers uploadés
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">143</div>
              <div className="text-sm text-blue-800">Fichiers totaux</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">149 MB</div>
              <div className="text-sm text-orange-800">Espace utilisé</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-800">Fichiers orphelins</div>
            </div>
          </div>

          {/* Actions de nettoyage */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Actions de Nettoyage
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Nettoyer les fichiers orphelins
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Supprime les images qui ne sont plus référencées en base de données
                </p>
                <button
                  onClick={() => handleCleanup('orphaned')}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Nettoyer les orphelins
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Nettoyer les anciens fichiers
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Supprime les fichiers plus anciens que 30 jours
                </p>
                <button
                  onClick={() => handleCleanup('old', 30)}
                  disabled={isLoading}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Nettoyer les anciens
                </button>
              </div>
            </div>
          </div>

          {/* Résultat */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h3 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Nettoyage réussi' : 'Erreur lors du nettoyage'}
                </h3>
              </div>
              
              {result.success ? (
                <div className="text-green-700">
                  <p>{result.message}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>Fichiers supprimés: <strong>{result.deletedCount}</strong></div>
                    <div>Espace libéré: <strong>{(result.freedSpace / 1024 / 1024).toFixed(2)} MB</strong></div>
                  </div>
                </div>
              ) : (
                <p className="text-red-700">{result.error}</p>
              )}
            </div>
          )}

          {/* Recommandations */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              💡 Recommandations
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Exécutez le nettoyage des orphelins une fois par semaine</li>
              <li>• Configurez un nettoyage automatique des anciens fichiers</li>
              <li>• Considérez l'utilisation d'un CDN pour les images</li>
              <li>• Implémentez la compression automatique des images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

