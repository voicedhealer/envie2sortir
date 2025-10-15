'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, Target, BarChart3, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface LearningStats {
  totalPatterns: number;
  correctedPatterns: number;
  accuracy: number;
  mostCommonTypes: Array<{ type: string; count: number }>;
}

interface LearningPattern {
  id: string;
  name: string;
  detectedType: string;
  correctedType?: string;
  googleTypes: string[];
  keywords: string[];
  confidence: number;
  isCorrected: boolean;
  correctedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface TypeOption {
  value: string;
  label: string;
}

export default function LearningDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPattern, setEditingPattern] = useState<string | null>(null);
  const [correctedType, setCorrectedType] = useState<string>('');

  // Options de types d'établissements
  const typeOptions: TypeOption[] = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'bar', label: 'Bar' },
    { value: 'cafe', label: 'Café' },
    { value: 'parc_loisir_indoor', label: 'Parc de loisirs indoor' },
    { value: 'bowling', label: 'Bowling' },
    { value: 'escape_game', label: 'Escape Game' },
    { value: 'karaoke', label: 'Karaoké' },
    { value: 'cinema', label: 'Cinéma' },
    { value: 'theatre', label: 'Théâtre' },
    { value: 'club', label: 'Club/Discothèque' },
    { value: 'sport', label: 'Sport' },
    { value: 'wellness', label: 'Bien-être/Spa' },
    { value: 'other', label: 'Autre' }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth?error=AccessDenied');
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/auth?error=AccessDenied');
      return;
    }

    fetchLearningData();
  }, [session, status, router]);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques
      const statsResponse = await fetch('/api/admin/learning/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Récupérer les patterns récents
      const patternsResponse = await fetch('/api/admin/learning/patterns');
      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();
        setPatterns(patternsData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectType = async (patternId: string, patternName: string) => {
    if (!correctedType) return;

    try {
      const response = await fetch('/api/admin/learning/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patternId,
          patternName,
          correctedType,
          correctedBy: session?.user?.email || 'admin'
        }),
      });

      if (response.ok) {
        // Recharger les données
        await fetchLearningData();
        setEditingPattern(null);
        setCorrectedType('');
      } else {
        setError('Erreur lors de la correction du type');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePattern = async (patternId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pattern d\'apprentissage ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/learning/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patternId }),
      });

      if (response.ok) {
        // Recharger les données
        await fetchLearningData();
      } else {
        setError('Erreur lors de la suppression du pattern');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 text-orange-500 mr-3" />
            Intelligence d'Apprentissage
          </h1>
          <p className="text-gray-600 mt-2">
            Analyse des patterns d'apprentissage et de la performance du système
          </p>
        </div>

        {/* Statistiques globales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Patterns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatterns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Patterns Corrigés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.correctedPatterns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Précision</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.accuracy * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Types Uniques</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.mostCommonTypes.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Types les plus courants */}
        {stats && stats.mostCommonTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Types d'établissements les plus courants
            </h3>
            <div className="space-y-3">
              {stats.mostCommonTypes.slice(0, 10).map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{type.type}</span>
                  </div>
                  <span className="text-sm text-gray-500">{type.count} occurrences</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns récents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 text-purple-600 mr-2" />
              Patterns d'Apprentissage Récents
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Détecté
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Corrigé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confiance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patterns.map((pattern) => (
                  <tr key={pattern.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pattern.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {pattern.detectedType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pattern.isCorrected ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {pattern.correctedType}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${Math.round(pattern.confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(pattern.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pattern.isCorrected ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Corrigé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pattern.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!pattern.isCorrected && (
                        <div className="flex space-x-2">
                          {editingPattern === pattern.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={correctedType}
                                onChange={(e) => setCorrectedType(e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="">Sélectionner...</option>
                                {typeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleCorrectType(pattern.id, pattern.name)}
                                disabled={!correctedType}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-gray-300"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPattern(null);
                                  setCorrectedType('');
                                }}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingPattern(pattern.id)}
                                className="text-orange-600 hover:text-orange-900 text-xs bg-orange-50 px-2 py-1 rounded"
                              >
                                ✏️ Corriger
                              </button>
                              <button
                                onClick={() => handleDeletePattern(pattern.id)}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      {pattern.isCorrected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✓ Corrigé
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={fetchLearningData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            🔄 Actualiser
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Retour Admin
          </button>
        </div>
      </div>
    </div>
  );
}
