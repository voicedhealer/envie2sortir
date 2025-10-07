'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ClickAnalyticsDashboard from '@/components/analytics/ClickAnalyticsDashboard';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
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
  }, [session, status, router]);

  if (status === 'loading' || loading) {
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
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  Analytics de votre établissement
                </h1>
                <p className="text-gray-600 mt-1">
                  Découvrez comment vos clients interagissent avec votre page
                </p>
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

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClickAnalyticsDashboard 
          establishmentId={establishmentId} 
          period="30d"
        />
      </div>
    </div>
  );
}
