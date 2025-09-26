"use client";

import { useEffect, useState } from "react";
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchAllData();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
    try {
      const response = await fetch("/api/monitoring/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
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

      {/* Métriques système */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mémoire */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Mémoire</p>
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

          {/* CPU */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">CPU</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.cpu.usage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">Utilisation</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                metrics.cpu.usage > 80 ? 'bg-red-100' : 
                metrics.cpu.usage > 60 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <span className={`text-lg ${
                  metrics.cpu.usage > 80 ? 'text-red-600' : 
                  metrics.cpu.usage > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  ⚡
                </span>
              </div>
            </div>
          </div>

          {/* API Requests */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Requêtes API</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.api.totalRequests.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  Moyenne: {metrics.api.avgResponseTime}ms
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg text-blue-600">📡</span>
              </div>
            </div>
          </div>

          {/* Taux d'erreur */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Taux d'erreur</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.api.errorRate.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-400">
                  {metrics.security.blockedRequests} bloquées
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                metrics.api.errorRate > 5 ? 'bg-red-100' : 
                metrics.api.errorRate > 2 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <span className={`text-lg ${
                  metrics.api.errorRate > 5 ? 'text-red-600' : 
                  metrics.api.errorRate > 2 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  🚨
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Établissements en attente */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            </div>
          </div>
        </div>

        {/* Établissements actifs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            </div>
          </div>
        </div>
      </div>

      {/* Dernières inscriptions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Dernières inscriptions
          </h3>
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
                      {establishment.owner.firstName} {establishment.owner.lastName}
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
              Aucune inscription récente
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/api/monitoring/metrics"
            target="_blank"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
          >
            Métriques JSON
          </Link>
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
