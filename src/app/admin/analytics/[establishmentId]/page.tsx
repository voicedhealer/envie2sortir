'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Building2, TrendingUp, Users, Eye } from 'lucide-react';
import ClickAnalyticsDashboard from '@/components/analytics/ClickAnalyticsDashboard';

interface EstablishmentDetails {
  id: string;
  name: string;
  slug: string;
  totalClicks: number;
  topElement: string;
  topElementClicks: number;
  lastActivity: string;
}

export default function EstablishmentAnalyticsPage({ params }: { params: Promise<{ establishmentId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [establishment, setEstablishment] = useState<EstablishmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Déballer les params avec React.use()
  const { establishmentId } = use(params);

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

    const fetchEstablishmentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/analytics/establishments`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch establishments');
        }
        
        const establishments = await response.json();
        const establishmentData = establishments.find((est: EstablishmentDetails) => est.id === establishmentId);
        
        if (!establishmentData) {
          throw new Error('Establishment not found');
        }
        
        setEstablishment(establishmentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentDetails();
  }, [session, status, router, establishmentId]);

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
            Erreur
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/analytics')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour aux analytics
          </button>
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Établissement non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            L'établissement demandé n'existe pas ou n'a pas de données analytics.
          </p>
          <button
            onClick={() => router.push('/admin/analytics')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour aux analytics
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/analytics')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Retour
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                    Analytics - {establishment.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Détails des interactions pour {establishment.slug}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  Données en temps réel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total interactions</p>
                <p className="text-2xl font-bold text-gray-900">{establishment.totalClicks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Élément populaire</p>
                <p className="text-lg font-bold text-gray-900">
                  {establishment.topElement} ({establishment.topElementClicks})
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
                <p className="text-sm font-medium text-gray-600">Dernière activité</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(establishment.lastActivity).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard détaillé */}
        <ClickAnalyticsDashboard 
          establishmentId={establishment.id} 
          period="30d"
        />
      </div>
    </div>
  );
}
