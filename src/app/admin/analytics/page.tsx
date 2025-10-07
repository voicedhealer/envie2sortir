'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Eye, Building2 } from 'lucide-react';

interface EstablishmentAnalytics {
  id: string;
  name: string;
  slug: string;
  totalClicks: number;
  topElement: string;
  topElementClicks: number;
  lastActivity: string;
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [establishments, setEstablishments] = useState<EstablishmentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const fetchEstablishmentsAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics/establishments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        setEstablishments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentsAnalytics();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  Analytics - Tous les établissements
                </h1>
                <p className="text-gray-600 mt-1">
                  Vue d'ensemble des interactions sur toutes les pages publiques
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  {establishments.length} établissements
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {establishments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-gray-600">
              Aucune interaction n'a encore été enregistrée.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Établissements</p>
                    <p className="text-2xl font-bold text-gray-900">{establishments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total interactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {establishments.reduce((sum, est) => sum + est.totalClicks, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Moyenne par établissement</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(establishments.reduce((sum, est) => sum + est.totalClicks, 0) / establishments.length)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Eye className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Plus actif</p>
                    <p className="text-lg font-bold text-gray-900">
                      {establishments.length > 0 ? Math.max(...establishments.map(est => est.totalClicks)) : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des établissements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails par établissement
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {establishments.map((establishment) => (
                  <div key={establishment.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {establishment.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              /{establishment.slug}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Total clics</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {establishment.totalClicks}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Élément populaire</p>
                          <p className="text-sm font-medium text-gray-900">
                            {establishment.topElement} ({establishment.topElementClicks})
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Dernière activité</p>
                          <p className="text-sm text-gray-900">
                            {new Date(establishment.lastActivity).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <div>
                          <button
                            onClick={() => router.push(`/admin/analytics/${establishment.id}`)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
