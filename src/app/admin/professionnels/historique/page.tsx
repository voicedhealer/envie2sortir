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

  // Calculer les métriques de comparaison
  const calculateMetrics = () => {
    if (!historyData || historyData.history.length === 0) {
      return null;
    }

    const sortedHistory = [...historyData.history].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstSnapshot = sortedHistory[0];
    const lastSnapshot = sortedHistory[sortedHistory.length - 1];
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1); // 1er janvier de l'année en cours
    
    // Trouver le snapshot le plus proche de janvier
    const januarySnapshot = sortedHistory.find(s => {
      const snapshotDate = new Date(s.date);
      return snapshotDate >= january;
    }) || firstSnapshot;

    // Calculs depuis janvier
    const establishmentsSinceJanuary = lastSnapshot.overview.totalEstablishments - januarySnapshot.overview.totalEstablishments;
    const premiumSinceJanuary = lastSnapshot.overview.premiumCount - januarySnapshot.overview.premiumCount;
    const revenueSinceJanuary = lastSnapshot.revenue.currentMonth - januarySnapshot.revenue.currentMonth;
    
    // Pourcentages d'évolution depuis janvier
    const establishmentsGrowthSinceJanuary = januarySnapshot.overview.totalEstablishments > 0
      ? ((lastSnapshot.overview.totalEstablishments - januarySnapshot.overview.totalEstablishments) / januarySnapshot.overview.totalEstablishments) * 100
      : 0;
    
    const premiumGrowthSinceJanuary = januarySnapshot.overview.premiumCount > 0
      ? ((lastSnapshot.overview.premiumCount - januarySnapshot.overview.premiumCount) / januarySnapshot.overview.premiumCount) * 100
      : 0;
    
    const revenueGrowthSinceJanuary = januarySnapshot.revenue.currentMonth > 0
      ? ((lastSnapshot.revenue.currentMonth - januarySnapshot.revenue.currentMonth) / januarySnapshot.revenue.currentMonth) * 100
      : 0;

    // Calculs depuis le début de l'historique
    const establishmentsSinceStart = lastSnapshot.overview.totalEstablishments - firstSnapshot.overview.totalEstablishments;
    const premiumSinceStart = lastSnapshot.overview.premiumCount - firstSnapshot.overview.premiumCount;
    const revenueSinceStart = lastSnapshot.revenue.currentMonth - firstSnapshot.revenue.currentMonth;
    
    const establishmentsGrowthSinceStart = firstSnapshot.overview.totalEstablishments > 0
      ? ((lastSnapshot.overview.totalEstablishments - firstSnapshot.overview.totalEstablishments) / firstSnapshot.overview.totalEstablishments) * 100
      : 0;
    
    const premiumGrowthSinceStart = firstSnapshot.overview.premiumCount > 0
      ? ((lastSnapshot.overview.premiumCount - firstSnapshot.overview.premiumCount) / firstSnapshot.overview.premiumCount) * 100
      : 0;
    
    const revenueGrowthSinceStart = firstSnapshot.revenue.currentMonth > 0
      ? ((lastSnapshot.revenue.currentMonth - firstSnapshot.revenue.currentMonth) / firstSnapshot.revenue.currentMonth) * 100
      : 0;

    // Compter le nombre total d'établissements créés (somme des nouveaux établissements)
    const totalNewEstablishments = sortedHistory.reduce((sum, snapshot) => sum + snapshot.newEstablishments.thisMonth, 0);

    return {
      firstSnapshot,
      lastSnapshot,
      januarySnapshot,
      establishmentsSinceJanuary,
      premiumSinceJanuary,
      revenueSinceJanuary,
      establishmentsGrowthSinceJanuary,
      premiumGrowthSinceJanuary,
      revenueGrowthSinceJanuary,
      establishmentsSinceStart,
      premiumSinceStart,
      revenueSinceStart,
      establishmentsGrowthSinceStart,
      premiumGrowthSinceStart,
      revenueGrowthSinceStart,
      totalNewEstablishments
    };
  };

  const metrics = calculateMetrics();

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

        {/* Métriques concrètes */}
        {metrics && (() => {
          const firstDate = new Date(metrics.firstSnapshot.date);
          const lastDate = new Date(metrics.lastSnapshot.date);
          const januaryDate = new Date(metrics.januarySnapshot.date);
          const currentMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Établissements depuis janvier */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Établissements</p>
                    <p className="text-xs text-gray-400">
                      Depuis le {januaryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <TrendingUp className={`w-5 h-5 ${metrics.establishmentsGrowthSinceJanuary >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics.establishmentsSinceJanuary >= 0 ? '+' : ''}{metrics.establishmentsSinceJanuary}
                </p>
                <p className={`text-sm font-medium ${metrics.establishmentsGrowthSinceJanuary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.establishmentsGrowthSinceJanuary >= 0 ? '+' : ''}{metrics.establishmentsGrowthSinceJanuary.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {metrics.lastSnapshot.overview.totalEstablishments} établissements au {lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>

              {/* Premium depuis janvier */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Premium</p>
                    <p className="text-xs text-gray-400">
                      Depuis le {januaryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <TrendingUp className={`w-5 h-5 ${metrics.premiumGrowthSinceJanuary >= 0 ? 'text-orange-500' : 'text-red-500'}`} />
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {metrics.premiumSinceJanuary >= 0 ? '+' : ''}{metrics.premiumSinceJanuary}
                </p>
                <p className={`text-sm font-medium ${metrics.premiumGrowthSinceJanuary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.premiumGrowthSinceJanuary >= 0 ? '+' : ''}{metrics.premiumGrowthSinceJanuary.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {metrics.lastSnapshot.overview.premiumCount} premium au {lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>

              {/* Recettes depuis janvier */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recettes</p>
                    <p className="text-xs text-gray-400">
                      Depuis le {januaryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <TrendingUp className={`w-5 h-5 ${metrics.revenueGrowthSinceJanuary >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {metrics.revenueSinceJanuary >= 0 ? '+' : ''}{metrics.revenueSinceJanuary.toFixed(2)} €
                </p>
                <p className={`text-sm font-medium ${metrics.revenueGrowthSinceJanuary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.revenueGrowthSinceJanuary >= 0 ? '+' : ''}{metrics.revenueGrowthSinceJanuary.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {metrics.lastSnapshot.revenue.currentMonth.toFixed(2)} € en {currentMonth.toLocaleDateString('fr-FR', { month: 'long' })}
                </p>
              </div>

              {/* Total créés sur la période */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total créés</p>
                    <p className="text-xs text-gray-400">
                      Du {firstDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {metrics.totalNewEstablishments}
                </p>
                <p className="text-sm text-gray-600">
                  établissements créés
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  sur {historyData.total} snapshot{historyData.total > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Impact sur le CA - Carte détaillée */}
        {metrics && (() => {
          const firstDate = new Date(metrics.firstSnapshot.date);
          const lastDate = new Date(metrics.lastSnapshot.date);
          const januaryDate = new Date(metrics.januarySnapshot.date);
          const currentMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
          const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
          
          return (
            <div className="bg-gradient-to-r from-orange-50 to-white rounded-lg shadow-sm border border-orange-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact sur le chiffre d'affaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Évolution depuis le {januaryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    (Premier snapshot de {currentMonth.getFullYear()})
                  </p>
                  <p className={`text-2xl font-bold ${metrics.revenueGrowthSinceJanuary >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.revenueGrowthSinceJanuary >= 0 ? '+' : ''}{metrics.revenueGrowthSinceJanuary.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics.revenueSinceJanuary >= 0 ? '+' : ''}{metrics.revenueSinceJanuary.toFixed(2)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Évolution depuis le {firstDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    (Premier snapshot disponible)
                  </p>
                  <p className={`text-2xl font-bold ${metrics.revenueGrowthSinceStart >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.revenueGrowthSinceStart >= 0 ? '+' : ''}{metrics.revenueGrowthSinceStart.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics.revenueSinceStart >= 0 ? '+' : ''}{metrics.revenueSinceStart.toFixed(2)} €
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    CA du {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    (Snapshot du {lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })})
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.lastSnapshot.revenue.currentMonth.toFixed(2)} €
                  </p>
                  <p className={`text-sm font-medium mt-1 ${metrics.lastSnapshot.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.lastSnapshot.revenue.growth >= 0 ? '+' : ''}{metrics.lastSnapshot.revenue.growth.toFixed(1)}% vs {lastMonth.toLocaleDateString('fr-FR', { month: 'long' })}
                  </p>
                </div>
              </div>
              {metrics.totalNewEstablishments > 0 && (
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-sm text-gray-600">
                    <strong>{metrics.totalNewEstablishments} établissements créés</strong> entre le{' '}
                    <strong>{firstDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> et le{' '}
                    <strong>{lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> ont généré une{' '}
                    <strong className={metrics.revenueGrowthSinceStart >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {metrics.revenueGrowthSinceStart >= 0 ? 'augmentation' : 'diminution'}
                    </strong>
                    {' '}du chiffre d'affaires de <strong>{Math.abs(metrics.revenueSinceStart).toFixed(2)} €</strong>
                  </p>
                </div>
              )}
            </div>
          );
        })()}

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

