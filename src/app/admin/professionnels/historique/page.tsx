"use client";

import { useState, useEffect, useRef } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  History, 
  TrendingUp, 
  Calendar,
  Download,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/lib/fake-toast';

interface HistorySnapshot {
  id: string;
  date: string;
  timestamp: string;
  overview: {
    totalEstablishments: number;
    premiumCount: number;
    freeCount: number;
    conversionRate: number;
  };
  newEstablishments: {
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  revenue: {
    currentMonth: number;
    lastMonth: number;
    growth: number;
    monthly: any[];
    weekly: any[];
  };
  monthlyEvolution: any[];
  weeklyEvolution: any[];
  topCategories: any[];
}

interface HistoryData {
  history: HistorySnapshot[];
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  total: number;
}

export default function ProfessionalsHistoryPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '180' | '365'>('365');
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'revenue' | 'categories'>('overview');
  const hasRedirectedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (sessionLoading) return;
    
    if (!session && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/auth');
      return;
    }

    if (session && session.user?.role !== 'admin' && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/dashboard');
      return;
    }
  }, [sessionLoading, session, router]);

  const fetchHistory = async (days: string = selectedPeriod) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/professionals-stats/history?days=${days}`);
      
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement de l\'historique');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionLoading) return;
    if (!session || session.user?.role !== 'admin') return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    fetchHistory();
  }, [session, sessionLoading, selectedPeriod]);

  const handleSaveSnapshot = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/professionals-stats/save-snapshot', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Snapshot sauvegardé avec succès');
        // Rafraîchir l'historique
        await fetchHistory();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la sauvegarde du snapshot');
    } finally {
      setSaving(false);
    }
  };

  const handlePeriodChange = (period: '30' | '90' | '180' | '365') => {
    setSelectedPeriod(period);
    hasFetchedRef.current = false;
    fetchHistory(period);
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!historyData || historyData.history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun historique disponible</h2>
            <p className="text-gray-600 mb-6">
              Aucun snapshot de statistiques n'a été sauvegardé pour le moment.
            </p>
            <button
              onClick={handleSaveSnapshot}
              disabled={saving}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer le premier snapshot
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const overviewData = historyData.history.map(snapshot => ({
    date: new Date(snapshot.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    total: snapshot.overview.totalEstablishments,
    premium: snapshot.overview.premiumCount,
    free: snapshot.overview.freeCount,
    conversionRate: snapshot.overview.conversionRate
  }));

  const revenueData = historyData.history.map(snapshot => ({
    date: new Date(snapshot.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    revenue: snapshot.revenue.currentMonth,
    growth: snapshot.revenue.growth
  }));

  const newEstablishmentsData = historyData.history.map(snapshot => ({
    date: new Date(snapshot.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    thisMonth: snapshot.newEstablishments.thisMonth,
    thisWeek: snapshot.newEstablishments.thisWeek,
    growth: snapshot.newEstablishments.growth
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <History className="w-8 h-8 text-orange-500 mr-3" />
                Historique des Statistiques
              </h1>
              <p className="text-gray-600 mt-2">
                Consultation et analyse des statistiques professionnelles sur le temps
              </p>
            </div>
            <button
              onClick={handleSaveSnapshot}
              disabled={saving}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder snapshot
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Période :</span>
            <div className="flex gap-2">
              {(['30', '90', '180', '365'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period === '30' ? '30 jours' : period === '90' ? '3 mois' : period === '180' ? '6 mois' : '1 an'}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-auto">
              {historyData.total} snapshot{historyData.total > 1 ? 's' : ''} disponible{historyData.total > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('evolution')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'evolution'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Évolution
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'revenue'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recettes
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Catégories
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Évolution du total d'établissements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du nombre d'établissements</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" strokeWidth={2} />
                    <Line type="monotone" dataKey="premium" stroke="#ff751f" name="Premium" strokeWidth={2} />
                    <Line type="monotone" dataKey="free" stroke="#9ca3af" name="Free" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Taux de conversion */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du taux de conversion</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="conversionRate" stroke="#10b981" name="Taux de conversion (%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="space-y-6">
            {/* Nouveaux établissements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux établissements par mois</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={newEstablishmentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="thisMonth" fill="#3b82f6" name="Nouveaux ce mois" />
                    <Bar dataKey="thisWeek" fill="#10b981" name="Nouveaux cette semaine" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Évolution des recettes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des recettes mensuelles</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Recettes (€)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Croissance des recettes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des recettes (%)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="growth" fill="#10b981" name="Croissance (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des catégories</h3>
            <p className="text-gray-600 mb-4">
              Les catégories les plus présentes sont enregistrées dans chaque snapshot. 
              Consultez les snapshots individuels pour voir les détails.
            </p>
            <div className="space-y-2">
              {historyData.history.slice(0, 10).map((snapshot, index) => (
                <div key={snapshot.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {new Date(snapshot.date).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="text-sm text-gray-500">
                      {snapshot.topCategories.length} catégories enregistrées
                    </span>
                  </div>
                  {snapshot.topCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {snapshot.topCategories.slice(0, 5).map((cat: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {cat.name} ({cat.count})
                        </span>
                      ))}
                      {snapshot.topCategories.length > 5 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                          +{snapshot.topCategories.length - 5} autres
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

