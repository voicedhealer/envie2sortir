"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  pendingCount: number;
  activeCount: number;
  recentEstablishments: Array<{
    id: string;
    name: string;
    category: string;
    createdAt: string;
    owner: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  api: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
  };
  security: {
    blockedRequests: number;
    failedLogins: number;
  };
}

interface HealthStatus {
  database: boolean;
  redis: boolean;
  overall: boolean;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Vérifier l'authentification admin
  useEffect(() => {
    if (status === 'loading') return; // En cours de chargement
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth?error=AccessDenied');
      return;
    }
    
    fetchAllData();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [session, status, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    }
  };

  const fetchSystemMetrics = async () => {
    // Vérifier que la session est toujours valide
    if (!session || session.user.role !== 'admin' || status !== 'authenticated') {
      return;
    }

    try {
      const response = await fetch("/api/admin/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.system);
        console.log("Métriques système chargées:", data);
      } else if (response.status === 401 || response.status === 403) {
        console.log('Session expirée, arrêt des requêtes métriques');
        return;
      }
    } catch (error) {
      console.error("Erreur lors du chargement des métriques:", error);
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch("/api/monitoring/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du statut:", error);
    }
  };

  const fetchAllData = async () => {
    // Vérifier que la session est toujours valide avant de faire les requêtes
    if (!session || session.user.role !== 'admin' || status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchSystemMetrics(),
        fetchHealthStatus()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  // Si pas de session ou pas admin, ne rien afficher (redirection en cours)
  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec actualisation automatique */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble des établissements et monitoring système
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <button
            onClick={fetchAllData}
            className="mt-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Actualiser maintenant
          </button>
        </div>
      </div>

      {/* Status de santé système */}
      {health && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🏥 Status de Santé du Système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${health.database ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${health.database ? 'bg-green-500' : 'bg-red-500'} mr-3`}></div>
                <span className="font-medium">Base de données</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {health.database ? '✅ Opérationnelle' : '❌ Erreur'}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${health.redis ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${health.redis ? 'bg-green-500' : 'bg-yellow-500'} mr-3`}></div>
                <span className="font-medium">Cache Redis</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {health.redis ? '✅ Actif' : '⚠️ Non configuré'}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${health.overall ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${health.overall ? 'bg-green-500' : 'bg-red-500'} mr-3`}></div>
                <span className="font-medium">Système global</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {health.overall ? '✅ Opérationnel' : '❌ Problème détecté'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métriques système réelles uniquement */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mémoire - Réelle */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Mémoire Node.js</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.memory.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">
                  {Math.round(metrics.memory.used / 1024 / 1024)} MB / {Math.round(metrics.memory.total / 1024 / 1024)} MB
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                metrics.memory.percentage > 80 ? 'bg-red-100' : 
                metrics.memory.percentage > 60 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <span className={`text-lg ${
                  metrics.memory.percentage > 80 ? 'text-red-600' : 
                  metrics.memory.percentage > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  💾
                </span>
              </div>
            </div>
          </div>

          {/* CPU - Non disponible */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">CPU</p>
                <p className="text-lg font-semibold text-gray-400">
                  Non disponible
                </p>
                <p className="text-xs text-gray-400">Monitoring requis</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg text-gray-400">⚡</span>
              </div>
            </div>
          </div>

          {/* API Requests - Non disponible */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Requêtes API</p>
                <p className="text-lg font-semibold text-gray-400">
                  Non disponible
                </p>
                <p className="text-xs text-gray-400">Monitoring requis</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg text-gray-400">📡</span>
              </div>
            </div>
          </div>

          {/* Taux d'erreur - Non disponible */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Taux d'erreur</p>
                <p className="text-lg font-semibold text-gray-400">
                  Non disponible
                </p>
                <p className="text-xs text-gray-400">Monitoring requis</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg text-gray-400">🚨</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📊 Statistiques des établissements
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Vue d'ensemble du nombre d'établissements selon leur statut d'approbation
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Établissements en attente */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-semibold">
                    {stats?.pendingCount || 0}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  En attente
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.pendingCount || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Établissements en cours de validation
                </p>
              </div>
            </div>
          </div>

          {/* Établissements actifs */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-semibold">
                    {stats?.activeCount || 0}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Actifs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activeCount || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Établissements approuvés et visibles
                </p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {(stats?.pendingCount || 0) + (stats?.activeCount || 0)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(stats?.pendingCount || 0) + (stats?.activeCount || 0)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Nombre total d'établissements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières inscriptions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            📝 Dernières inscriptions d'établissements
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Liste des nouveaux établissements enregistrés récemment
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {stats?.recentEstablishments?.length ? (
            stats.recentEstablishments.map((establishment) => (
              <div
                key={establishment.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {establishment.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Propriétaire : {establishment.owner.firstName} {establishment.owner.lastName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Inscrit le{" "}
                      {new Date(establishment.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/admin/etablissements`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Gérer →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-500">Aucune inscription récente</p>
              <p className="text-sm text-gray-400 mt-1">
                Les nouveaux établissements apparaîtront ici
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patterns d'Apprentissage Récents */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            🧠 Patterns d'Apprentissage Récents
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Détection et correction automatique des types d'activités
          </p>
        </div>
        <div className="p-6">
          {/* Tableau des patterns */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE DÉTECTÉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE CORRIGÉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONFIANCE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Exemples de patterns - à remplacer par des données réelles */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    parc_loisir_indoor
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">95%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    22/10/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">Valider</button>
                      <button className="text-blue-600 hover:text-blue-900">Corriger</button>
                      <button className="text-red-600 hover:text-red-900">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    restaurant
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '91%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">91%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    21/10/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">Valider</button>
                      <button className="text-blue-600 hover:text-blue-900">Corriger</button>
                      <button className="text-red-600 hover:text-red-900">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    escape_game
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">95%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    21/10/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">Valider</button>
                      <button className="text-blue-600 hover:text-blue-900">Corriger</button>
                      <button className="text-red-600 hover:text-red-900">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    other
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">35%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    20/10/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select className="text-sm border border-gray-300 rounded px-2 py-1">
                      <option>Sélectionner...</option>
                      <option>restaurant_general</option>
                      <option>bar_general</option>
                      <option>parc_loisir_indoor</option>
                      <option>escape_game</option>
                      <option>bowling</option>
                      <option>karting</option>
                      <option>laser_game</option>
                      <option>autre</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    bar
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    bar_general
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">92%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Corrigé
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    14/10/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="text-green-600">✅ Corrigé</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dropdown avec toutes les activités disponibles */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              📋 Liste complète des activités disponibles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {/* Bars & Boissons */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🍹 Bars & Boissons</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• bar_ambiance</div>
                  <div>• bar_lounge</div>
                  <div>• bar_cocktails</div>
                  <div>• bar_vins</div>
                  <div>• bar_sports</div>
                  <div>• rooftop_bar</div>
                  <div>• bar_karaoke</div>
                  <div>• bar_bières</div>
                  <div>• bar_jus_smoothies</div>
                  <div>• bar_tapas</div>
                  <div>• bar_plage</div>
                  <div>• bar_rooftop</div>
                  <div>• bar_brasserie</div>
                  <div>• bar_whisky</div>
                  <div>• bar_rhum</div>
                  <div>• bar_gin</div>
                  <div>• bar_tequila</div>
                  <div>• bar_champagne</div>
                  <div>• bar_apéritif</div>
                  <div>• bar_afterwork</div>
                  <div>• bar_brunch</div>
                  <div>• bar_glacé</div>
                  <div>• bar_healthy</div>
                  <div>• bar_vegan</div>
                  <div>• bar_gluten_free</div>
                  <div>• bar_halal</div>
                  <div>• bar_kosher</div>
                  <div>• bar_jeux</div>
                  <div>• pub_traditionnel</div>
                  <div>• brasserie_artisanale</div>
                  <div>• bar_general</div>
                </div>
              </div>

              {/* Restaurants */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🍽️ Restaurants</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• restaurant_gastronomique</div>
                  <div>• restaurant_traditionnel</div>
                  <div>• restaurant_familial</div>
                  <div>• bistrot</div>
                  <div>• restaurant_general</div>
                </div>
              </div>

              {/* Cuisines du monde */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🌍 Cuisines du monde</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• restaurant_italien</div>
                  <div>• restaurant_chinois</div>
                  <div>• restaurant_japonais</div>
                  <div>• restaurant_thai</div>
                  <div>• restaurant_vietnamien</div>
                  <div>• restaurant_coreen</div>
                  <div>• restaurant_asiatique</div>
                  <div>• restaurant_oriental</div>
                  <div>• restaurant_indien</div>
                  <div>• restaurant_libanais</div>
                  <div>• restaurant_turc</div>
                  <div>• restaurant_grec</div>
                  <div>• restaurant_espagnol</div>
                  <div>• restaurant_portugais</div>
                  <div>• restaurant_allemand</div>
                  <div>• restaurant_russe</div>
                  <div>• restaurant_marocain</div>
                  <div>• restaurant_ethiopien</div>
                  <div>• restaurant_brasilien</div>
                  <div>• restaurant_peruvien</div>
                  <div>• restaurant_mexicain</div>
                </div>
              </div>

              {/* Fast Food & Street Food */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🥙 Fast Food</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• kebab</div>
                  <div>• tacos_mexicain</div>
                  <div>• burger</div>
                  <div>• pizzeria</div>
                </div>
              </div>

              {/* Sorties nocturnes */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🎉 Sorties nocturnes</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• discotheque</div>
                  <div>• club_techno</div>
                  <div>• boite_nuit_mainstream</div>
                </div>
              </div>

              {/* Sports & Activités */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🎯 Sports & Activités</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• bowling</div>
                  <div>• billard_americain</div>
                  <div>• billard_francais</div>
                  <div>• roller_indoor</div>
                  <div>• moto_electrique_indoor</div>
                  <div>• futsal</div>
                  <div>• karting</div>
                  <div>• laser_game</div>
                  <div>• vr_experience</div>
                </div>
              </div>

              {/* Escape Games */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🎮 Escape Games</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• escape_game</div>
                  <div>• escape_game_horreur</div>
                  <div>• escape_game_aventure</div>
                  <div>• escape_game_mystere</div>
                  <div>• escape_game_sf</div>
                  <div>• escape_game_fantasy</div>
                  <div>• escape_game_familial</div>
                </div>
              </div>

              {/* Blind Test & Quiz */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🎵 Blind Test & Quiz</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• blind_test</div>
                  <div>• quiz_room</div>
                  <div>• salle_jeux_amis</div>
                  <div>• complexe_multiactivites</div>
                </div>
              </div>

              {/* Enfants & Famille */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">👶 Enfants & Famille</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• trampoline_parc</div>
                  <div>• parc_loisirs_enfants</div>
                  <div>• centre_aquatique</div>
                  <div>• parc_aventure_enfants</div>
                  <div>• ludotheque</div>
                  <div>• centre_loisirs_enfants</div>
                  <div>• ferme_pedagogique</div>
                  <div>• musee_enfants</div>
                  <div>• parc_theme_enfants</div>
                  <div>• centre_sportif_enfants</div>
                  <div>• atelier_creatif_enfants</div>
                  <div>• parc_jeux_interieur</div>
                  <div>• mini_golf</div>
                  <div>• parc_attractions_familial</div>
                  <div>• centre_anniversaires</div>
                  <div>• parc_animalier</div>
                  <div>• parc_plage_enfants</div>
                  <div>• centre_equitation_enfants</div>
                  <div>• parc_skate_enfants</div>
                  <div>• centre_cirque_enfants</div>
                  <div>• parc_loisir_indoor</div>
                </div>
              </div>

              {/* Autres */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">❓ Autres</h5>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>• autre</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/api/monitoring/health"
            target="_blank"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
          >
            Health Check
          </Link>
          <button
            onClick={fetchAllData}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}
