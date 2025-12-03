"use client";

import { useState, useEffect, useRef } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
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
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Euro, 
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ProfessionalsStats {
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
  monthlyEvolution: Array<{
    month: string;
    count: number;
    premium: number;
    free: number;
  }>;
  weeklyEvolution: Array<{
    week: string;
    count: number;
    premium: number;
    free: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  revenue: {
    monthly: Array<{
      month: string;
      revenue: number;
      premiumCount: number;
    }>;
    weekly: Array<{
      week: string;
      revenue: number;
      premiumCount: number;
    }>;
    currentMonth: number;
    lastMonth: number;
    growth: number;
  };
  lastUpdate: string;
}

const COLORS = ['#ff751f', '#ff1fa9', '#ff3a3a', '#10b981', '#3b82f6', '#f59e0b'];

export default function ProfessionalsStatsPage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [stats, setStats] = useState<ProfessionalsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (sessionLoading) return;
    if (!session || session.user?.role !== 'admin') return;
    if (hasFetchedRef.current) return;

    const fetchStats = async () => {
      try {
        hasFetchedRef.current = true;
        setLoading(true);
        const response = await fetch('/api/admin/professionals-stats');
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session, sessionLoading]);

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

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    );
  }

  // Données pour le graphique en camembert (Premium vs Free)
  const subscriptionData = [
    { name: 'Premium', value: stats.overview.premiumCount, color: '#ff751f' },
    { name: 'Free', value: stats.overview.freeCount, color: '#9ca3af' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 text-orange-500 mr-3" />
            Statistiques Professionnelles
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble comptable et analytique des établissements
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Dernière mise à jour : {new Date(stats.lastUpdate).toLocaleString('fr-FR')}
          </p>
        </div>

        {/* Cartes de résumé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total établissements</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalEstablishments}</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Premium</p>
                <p className="text-2xl font-semibold text-orange-600">{stats.overview.premiumCount}</p>
                <p className="text-xs text-gray-400">{stats.overview.conversionRate}% de conversion</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Nouveaux ce mois</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.newEstablishments.thisMonth}</p>
                <div className="flex items-center text-xs mt-1">
                  {stats.newEstablishments.growth >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={stats.newEstablishments.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(stats.newEstablishments.growth).toFixed(1)}% vs mois dernier
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recettes ce mois</p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.revenue.currentMonth.toFixed(2)} €
                </p>
                <div className="flex items-center text-xs mt-1">
                  {stats.revenue.growth >= 0 ? (
                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={stats.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(stats.revenue.growth).toFixed(1)}% vs mois dernier
                  </span>
                </div>
              </div>
              <Euro className="w-8 h-8 text-green-500" />
            </div>
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
            {/* Graphique Premium vs Free */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition Premium vs Free</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-700">Premium</span>
                    <span className="text-2xl font-bold text-orange-600">{stats.overview.premiumCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Free</span>
                    <span className="text-2xl font-bold text-gray-600">{stats.overview.freeCount}</span>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Taux de conversion</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.overview.conversionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques hebdomadaires */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux établissements cette semaine</h3>
              <div className="text-3xl font-bold text-gray-900">{stats.newEstablishments.thisWeek}</div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.newEstablishments.thisWeek > 0 
                  ? `+${stats.newEstablishments.thisWeek} établissement${stats.newEstablishments.thisWeek > 1 ? 's' : ''} cette semaine`
                  : 'Aucun nouvel établissement cette semaine'
                }
              </p>
            </div>
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="space-y-6">
            {/* Évolution mensuelle */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="premium" fill="#ff751f" name="Premium" />
                    <Bar dataKey="free" fill="#9ca3af" name="Free" />
                    <Bar dataKey="count" fill="#3b82f6" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Évolution hebdomadaire */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution hebdomadaire (12 dernières semaines)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="premium" stroke="#ff751f" name="Premium" strokeWidth={2} />
                    <Line type="monotone" dataKey="free" stroke="#9ca3af" name="Free" strokeWidth={2} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Recettes mensuelles */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recettes mensuelles (12 derniers mois)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Recettes (€)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recettes hebdomadaires */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recettes hebdomadaires (12 dernières semaines)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenue.weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
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

            {/* Résumé des recettes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Recettes ce mois</h4>
                <p className="text-3xl font-bold text-green-600">{stats.revenue.currentMonth.toFixed(2)} €</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Recettes mois dernier</h4>
                <p className="text-3xl font-bold text-gray-600">{stats.revenue.lastMonth.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 des catégories</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff751f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Liste des catégories */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des catégories</h3>
              <div className="space-y-2">
                {stats.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-700">{category.count}</span>
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

