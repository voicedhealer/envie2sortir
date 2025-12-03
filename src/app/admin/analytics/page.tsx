'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Eye, Building2, Clock, Calendar, Smartphone, Monitor, Target } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface EstablishmentAnalytics {
  id: string;
  name: string;
  slug: string;
  totalClicks: number;
  topElement: string;
  topElementClicks: number;
  lastActivity: string;
}

interface VisitStats {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  overview: {
    totalClicks: number;
    totalSearches: number;
    uniqueVisits: number;
    totalVisits: number;
    passageRate: number;
    conversionRate: number;
    conversionClicks: number;
  };
  visitsByHour: Array<{ hour: number; count: number; label: string }>;
  visitsByDayOfWeek: Array<{ day: string; count: number }>;
  timeSlots: {
    'Matin (6h-12h)': number;
    'Après-midi (12h-18h)': number;
    'Soirée (18h-22h)': number;
    'Nuit (22h-6h)': number;
  };
  deviceBreakdown: {
    mobile: {
      clicks: number;
      searches: number;
      total: number;
      percentage: number;
    };
    web: {
      clicks: number;
      searches: number;
      total: number;
      percentage: number;
    };
  };
}

export default function AdminAnalyticsPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [establishments, setEstablishments] = useState<EstablishmentAnalytics[]>([]);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'establishments' | 'visits'>('establishments');
  const hasRedirectedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Vérification d'authentification (séparée du fetch)
  useEffect(() => {
    if (sessionLoading) return;
    
    // Éviter les redirections multiples
    if (!session && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/auth');
      return;
    }

    // Vérifier que l'utilisateur est admin
    if (session && session.user?.role !== 'admin' && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/dashboard');
      return;
    }
  }, [sessionLoading, session, router]);

  // Fetch des données (une seule fois quand la session est prête)
  useEffect(() => {
    if (sessionLoading) return;
    if (!session || session.user?.role !== 'admin') return;
    if (hasFetchedRef.current) return;

    const fetchData = async () => {
      try {
        hasFetchedRef.current = true;
        setLoading(true);
        
        // Récupérer les données des établissements
        const establishmentsResponse = await fetch('/api/admin/analytics/establishments');
        if (establishmentsResponse.ok) {
          const establishmentsData = await establishmentsResponse.json();
          setEstablishments(establishmentsData);
        }
        
        // Récupérer les statistiques de visite
        const visitsResponse = await fetch('/api/admin/analytics/visits?days=30');
        if (visitsResponse.ok) {
          const visitsData = await visitsResponse.json();
          setVisitStats(visitsData);
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        hasFetchedRef.current = false; // Permettre de réessayer en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, session?.user?.id, session?.user?.role]); // Utiliser les valeurs primitives

  if (sessionLoading || loading) {
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
                {/* Espace réservé pour d'autres éléments futurs */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('establishments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'establishments'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Établissements
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'visits'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistiques de Visite
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'establishments' && (
          <>
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

            {/* Tableau des établissements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails par établissement
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* En-têtes du tableau */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Établissement
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total clics
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Élément populaire
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière activité
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  {/* Corps du tableau */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {establishments.map((establishment) => (
                      <tr key={establishment.id} className="hover:bg-gray-50">
                        {/* Nom de l'établissement */}
                        <td className="px-6 py-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {establishment.name}
                            </h4>
                          </div>
                        </td>
                        
                        {/* Total clics */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {establishment.totalClicks}
                          </span>
                        </td>
                        
                        {/* Élément populaire */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {establishment.topElement}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({establishment.topElementClicks} clics)
                            </span>
                          </div>
                        </td>
                        
                        {/* Dernière activité */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-900">
                            {new Date(establishment.lastActivity).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => router.push(`/admin/analytics/${establishment.id}`)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </>)}

        {activeTab === 'visits' && visitStats && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Visites uniques</p>
                    <p className="text-2xl font-bold text-gray-900">{visitStats.overview.uniqueVisits}</p>
                    <p className="text-xs text-gray-500 mt-1">Sur {visitStats.period.days} jours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux de passage</p>
                    <p className="text-2xl font-bold text-gray-900">{visitStats.overview.passageRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">{visitStats.overview.totalClicks} interactions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux de conversion</p>
                    <p className="text-2xl font-bold text-gray-900">{visitStats.overview.conversionRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">{visitStats.overview.conversionClicks} conversions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total interactions</p>
                    <p className="text-2xl font-bold text-gray-900">{visitStats.overview.totalClicks + visitStats.overview.totalSearches}</p>
                    <p className="text-xs text-gray-500 mt-1">Clics + Recherches</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Répartition Mobile vs Web */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition Mobile vs Web</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-700">Mobile</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{visitStats.deviceBreakdown.mobile.percentage}%</span>
                  </div>
                  <p className="text-sm text-gray-600">{visitStats.deviceBreakdown.mobile.total} interactions</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${visitStats.deviceBreakdown.mobile.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Monitor className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-gray-700">Web</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{visitStats.deviceBreakdown.web.percentage}%</span>
                  </div>
                  <p className="text-sm text-gray-600">{visitStats.deviceBreakdown.web.total} interactions</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${visitStats.deviceBreakdown.web.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires de visite */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Horaires de visite
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitStats.visitsByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff751f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Jours de visite */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Jours de visite
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitStats.visitsByDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Périodes de la journée */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par période de la journée</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(visitStats.timeSlots).map(([period, count]) => (
                  <div key={period} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">{period}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 mt-1">interactions</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="bg-gradient-to-r from-orange-50 to-white rounded-lg shadow-sm border border-orange-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>Période analysée :</strong> {new Date(visitStats.period.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} au {new Date(visitStats.period.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p>
                  <strong>Visites uniques :</strong> {visitStats.overview.uniqueVisits} établissements visités sur {visitStats.period.days} jours
                </p>
                <p>
                  <strong>Taux de passage :</strong> {visitStats.overview.passageRate}% (ratio visites uniques / total interactions)
                </p>
                <p>
                  <strong>Taux de conversion :</strong> {visitStats.overview.conversionRate}% ({visitStats.overview.conversionClicks} actions de contact sur {visitStats.overview.totalClicks} clics)
                </p>
                <p>
                  <strong>Répartition des appareils :</strong> {visitStats.deviceBreakdown.mobile.percentage}% mobile ({visitStats.deviceBreakdown.mobile.total} interactions) vs {visitStats.deviceBreakdown.web.percentage}% web ({visitStats.deviceBreakdown.web.total} interactions)
                </p>
                <p>
                  <strong>Période la plus active :</strong> {Object.entries(visitStats.timeSlots).sort(([,a], [,b]) => b - a)[0]?.[0]} avec {Object.entries(visitStats.timeSlots).sort(([,a], [,b]) => b - a)[0]?.[1]} interactions
                </p>
                <p>
                  <strong>Jour le plus actif :</strong> {visitStats.visitsByDayOfWeek.sort((a, b) => b.count - a.count)[0]?.day} avec {visitStats.visitsByDayOfWeek.sort((a, b) => b.count - a.count)[0]?.count} interactions
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visits' && !visitStats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune donnée de visite disponible
            </h3>
            <p className="text-gray-600">
              Les statistiques de visite seront disponibles une fois que des interactions auront été enregistrées.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
