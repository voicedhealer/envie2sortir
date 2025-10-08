'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Users, AlertCircle } from 'lucide-react';

interface SearchAnalyticsData {
  period: string;
  startDate: string;
  totalSearches: number;
  topSearches: Array<{
    searchTerm: string;
    searchCount: number;
    clickCount: number;
    conversionRate: number;
    topClickedEstablishments: Array<{
      establishmentId: string;
      establishmentName: string;
      clicks: number;
    }>;
  }>;
  searchesWithoutResults: Array<{
    searchTerm: string;
    count: number;
  }>;
}

export default function AdminRecherchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchSearchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/search?period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search analytics');
        }
        
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchAnalytics();
  }, [session, status, router, period]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Search className="w-8 h-8 mr-3" />
                  Analytics de Recherche
                </h1>
                <p className="text-purple-100 mt-2">
                  Analyse des termes "envie de :" et leur impact sur l'engagement
                </p>
              </div>
              
              {/* Sélecteur de période */}
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-white text-purple-600'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-gray-600">
              Aucune recherche n'a encore été enregistrée.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Search className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total recherches</p>
                    <p className="text-3xl font-bold text-gray-900">{data.totalSearches}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux de conversion moyen</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {data.topSearches.length > 0 ? 
                        Math.round(data.topSearches.reduce((sum, search) => sum + search.conversionRate, 0) / data.topSearches.length) : 0}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recherches sans résultats</p>
                    <p className="text-3xl font-bold text-gray-900">{data.searchesWithoutResults.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top recherches */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  🔝 Top des recherches populaires
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Les termes les plus recherchés et leur performance de conversion
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terme de recherche
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recherches
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clics
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Établissements cliqués
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topSearches.slice(0, 20).map((search, index) => (
                      <tr key={search.searchTerm} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mx-auto">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">"{search.searchTerm}"</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-semibold text-gray-900">{search.searchCount}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-semibold text-gray-900">{search.clickCount}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            search.conversionRate >= 50 ? 'bg-green-100 text-green-800' :
                            search.conversionRate >= 25 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {search.conversionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {search.topClickedEstablishments.slice(0, 3).map((establishment) => (
                              <span key={establishment.establishmentId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {establishment.establishmentName} ({establishment.clicks})
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Opportunités - Recherches sans résultats */}
            {data.searchesWithoutResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                  💡 Opportunités - Recherches sans résultats
                </h3>
                <div className="mb-4 text-sm text-gray-600">
                  <p>Ces termes sont recherchés mais n'ont pas de résultats. Des opportunités d'amélioration !</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.searchesWithoutResults.map((search) => (
                    <div key={search.searchTerm} className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-orange-900">"{search.searchTerm}"</div>
                        <div className="text-sm font-semibold text-orange-600">{search.count}×</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

