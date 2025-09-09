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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
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
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble des établissements et demandes
        </p>
      </div>

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
                    href={`/admin/demandes/${establishment.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir détails →
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
        <div className="flex space-x-4">
          <Link
            href="/admin/demandes"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Voir toutes les demandes
          </Link>
          <button
            onClick={fetchDashboardStats}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}
