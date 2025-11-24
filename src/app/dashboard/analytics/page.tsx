'use client';

import { useState, useEffect } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import ClickAnalyticsDashboard from '@/components/analytics/ClickAnalyticsDashboard';
import DetailedAnalyticsDashboard from '@/components/analytics/DetailedAnalyticsDashboard';
import { BarChart3, TrendingUp, Users, Eye, Lock } from 'lucide-react';

export default function AnalyticsPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const isPremium = session?.user?.subscription === 'PREMIUM' || session?.user?.role === 'admin';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    
    if (!session) {
      router.push('/auth');
      return;
    }

    // Récupérer l'ID de l'établissement du pro
    const fetchEstablishmentId = async () => {
      try {
        const response = await fetch('/api/professional/establishment');
        if (response.ok) {
          const data = await response.json();
          setEstablishmentId(data.id);
        }
      } catch (error) {
        console.error('Error fetching establishment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentId();
  }, [session, sessionLoading, router]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!establishmentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Aucun établissement trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez d'abord créer un établissement pour voir les statistiques.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour au dashboard
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
                  {isPremium ? (
                    <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  ) : (
                    <Lock className="w-6 h-6 text-orange-600 mr-3" />
                  )}
                  Analytics de votre établissement
                </h1>
                <p className="text-gray-600 mt-1">
                  {isPremium 
                    ? 'Découvrez comment vos clients interagissent avec votre page'
                    : "Fonctionnalité réservée au plan Premium. Accédez à vos statistiques globales depuis la Vue d'ensemble."}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Toggle entre vue d'ensemble et vue détaillée */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'overview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Vue d'ensemble
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    disabled={!isPremium}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : (isPremium ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed')
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Vue détaillée
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  Données en temps réel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPremium ? (
          viewMode === 'overview' ? (
            <ClickAnalyticsDashboard 
              establishmentId={establishmentId} 
              period="30d"
            />
          ) : (
            <DetailedAnalyticsDashboard 
              establishmentId={establishmentId} 
              period="30d"
            />
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Premium</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-4">
              Les Analytics détaillés sont réservés au plan Premium. Depuis votre tableau de bord, l'onglet « Vue d'ensemble » affiche vos statistiques globales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
