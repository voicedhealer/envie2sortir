"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudflareMetricsCharts from '@/components/admin/CloudflareMetricsCharts';
import { CloudflareDetailedMetrics } from '@/lib/cloudflare-api';

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
  redisConfigured?: boolean; // Indique si Redis est configuré (même si non actif)
  overall: boolean;
}

interface RealtimeMetrics {
  cloudflare: CloudflareDetailedMetrics | null;
  railway: {
    cpu: number;
    memory: number;
    network: {
      ingress: number;
      egress: number;
    };
    uptime: number;
    lastUpdate: string;
  } | null;
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
    timestamp: string;
  };
}

interface SecurityEvents {
  events: Array<{
    id: string;
    type: string;
    ip_address: string;
    user_agent?: string;
    email?: string;
    details?: any;
    created_at: string;
  }>;
  stats: {
    last24h: {
      failed_login: number;
      blocked_request: number;
      suspicious_activity: number;
      rate_limit_exceeded: number;
    };
    total: number;
  };
  topIPs: Array<{
    ip: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    }
  }, []);

  const fetchSystemMetrics = useCallback(async () => {
    // Vérifier que la session est toujours valide
    if (!session || session.user?.role !== 'admin' || loading) {
      return;
    }

    try {
      const response = await fetch("/api/admin/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.system);
        // ✅ CORRECTION : Log seulement si les données ont changé pour éviter le spam
        // console.log("Métriques système chargées:", data);
      } else if (response.status === 401 || response.status === 403) {
        console.log('⚠️ [AdminPage] Session expirée, arrêt des requêtes métriques');
        return;
      }
    } catch (error) {
      console.error("❌ [AdminPage] Erreur lors du chargement des métriques:", error);
    }
  }, [session, loading]);

  const fetchHealthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/monitoring/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du statut:", error);
    }
  }, []);

  const fetchRealtimeMetrics = useCallback(async () => {
    if (!session || session.user?.role !== 'admin' || loading) {
      return;
    }

    // Créer un AbortController pour gérer le timeout manuellement
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

    try {
      const response = await fetch("/api/admin/realtime-metrics", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setRealtimeMetrics(data);
      } else {
        // Logger l'erreur mais ne pas bloquer l'interface
        console.warn("Erreur lors du chargement des métriques temps réel:", response.status, response.statusText);
        // Ne pas définir realtimeMetrics à null pour garder les anciennes valeurs
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Gérer spécifiquement les erreurs de timeout ou de réseau
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn("Timeout lors du chargement des métriques temps réel (30s) - la route API prend trop de temps");
        } else if (error.message.includes('Failed to fetch')) {
          console.warn("Erreur réseau lors du chargement des métriques temps réel - la route API peut être indisponible");
        } else {
          console.error("Erreur lors du chargement des métriques temps réel:", error.message);
        }
      } else {
        console.error("Erreur lors du chargement des métriques temps réel:", error);
      }
      // Ne pas définir realtimeMetrics à null pour garder les anciennes valeurs
    }
  }, [session, loading]);

  const fetchSecurityEvents = useCallback(async () => {
    if (!session || session.user?.role !== 'admin' || loading) {
      return;
    }

    try {
      const response = await fetch("/api/admin/security-events?limit=10");
      if (response.ok) {
        const data = await response.json();
        setSecurityEvents(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements de sécurité:", error);
    }
  }, [session, loading]);

  const [configStatus, setConfigStatus] = useState<any>(null);
  
  const fetchConfigStatus = useCallback(async () => {
    if (!session || session.user?.role !== 'admin' || loading) {
      return;
    }

    try {
      const response = await fetch("/api/admin/check-config");
      if (response.ok) {
        const data = await response.json();
        setConfigStatus(data);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la configuration:", error);
    }
  }, [session, loading]);

  // ✅ CORRECTION : Utiliser useRef pour stocker les callbacks et éviter les re-créations
  const fetchDashboardStatsRef = useRef(fetchDashboardStats);
  const fetchSystemMetricsRef = useRef(fetchSystemMetrics);
  const fetchHealthStatusRef = useRef(fetchHealthStatus);
  const fetchRealtimeMetricsRef = useRef(fetchRealtimeMetrics);
  const fetchSecurityEventsRef = useRef(fetchSecurityEvents);
  const fetchConfigStatusRef = useRef(fetchConfigStatus);
  const sessionRef = useRef(session);
  const loadingRef = useRef(loading);

  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    fetchDashboardStatsRef.current = fetchDashboardStats;
    fetchSystemMetricsRef.current = fetchSystemMetrics;
    fetchHealthStatusRef.current = fetchHealthStatus;
    fetchRealtimeMetricsRef.current = fetchRealtimeMetrics;
    fetchSecurityEventsRef.current = fetchSecurityEvents;
    fetchConfigStatusRef.current = fetchConfigStatus;
    sessionRef.current = session;
    loadingRef.current = loading;
  }, [session, loading, fetchDashboardStats, fetchSystemMetrics, fetchHealthStatus, fetchRealtimeMetrics, fetchSecurityEvents, fetchConfigStatus]);

  const fetchAllData = useCallback(async () => {
    // ✅ CORRECTION : Éviter les appels multiples simultanés
    if (isFetchingRef.current) {
      console.log('⏸️ [AdminPage] fetchAllData déjà en cours, skip');
      return;
    }

    // Vérifier que la session est toujours valide avant de faire les requêtes
    const currentSession = sessionRef.current;
    const currentLoading = loadingRef.current;
    
    if (!currentSession || currentSession.user?.role !== 'admin' || currentLoading) {
      console.log('⏸️ [AdminPage] Session invalide, skip fetchAllData', {
        hasSession: !!currentSession,
        role: currentSession?.user?.role,
        loading: currentLoading
      });
      setIsLoading(false);
      return;
    }

    isFetchingRef.current = true;
    // Ne pas mettre setIsLoading(true) pour les rafraîchissements automatiques
    // pour éviter de masquer l'interface
    if (!hasInitializedRef.current) {
      setIsLoading(true);
    }
    
    console.log('🔄 [AdminPage] Début du chargement des données admin...');

    try {
      await Promise.all([
        fetchDashboardStatsRef.current(),
        fetchSystemMetricsRef.current(),
        fetchHealthStatusRef.current(),
        fetchRealtimeMetricsRef.current(),
        fetchSecurityEventsRef.current(),
        fetchConfigStatusRef.current()
      ]);
      setLastUpdate(new Date());
      setIsLoading(false);
      console.log('✅ [AdminPage] Toutes les données chargées');
    } catch (error) {
      console.error("❌ [AdminPage] Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // ✅ CORRECTION : Pas de dépendances pour éviter les re-créations

  // Vérifier l'authentification admin
  useEffect(() => {
    // ✅ CORRECTION : Attendre que le chargement soit terminé
    if (loading) return; // En cours de chargement
    
    // ✅ CORRECTION : Vérifier la session avec un petit délai pour laisser le temps
    // à la session de se synchroniser après la redirection
    const checkAuth = setTimeout(() => {
      if (!session || session.user?.role !== 'admin') {
        console.log('🚫 [AdminPage] Accès refusé, redirection vers /auth', {
          hasSession: !!session,
          role: session?.user?.role,
          loading
        });
        router.push('/auth?error=AccessDenied');
        return;
      }
      
      // Ne faire le fetch initial qu'une seule fois
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        fetchAllData();
      }
    }, 200); // Petit délai pour laisser la session se synchroniser
    
    // Actualiser toutes les 30 secondes (seulement si admin)
    let interval: NodeJS.Timeout | null = null;
    if (session && session.user?.role === 'admin' && !loading) {
      interval = setInterval(() => {
        // Utiliser la ref pour éviter les dépendances
        const currentSession = sessionRef.current;
        if (currentSession && currentSession.user?.role === 'admin') {
          fetchAllData();
        }
      }, 30000);
    }
    
    return () => {
      clearTimeout(checkAuth);
      if (interval) clearInterval(interval);
    };
  }, [session, loading, router]); // ✅ CORRECTION : fetchAllData retiré des dépendances

  // Afficher un loader pendant la vérification de l'authentification
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  // Si pas de session ou pas admin, ne rien afficher (redirection en cours)
  if (!session || session.user?.role !== 'admin') {
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

      {/* Vérification de la configuration */}
      {configStatus && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚙️ État de la Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Cloudflare */}
            <div className={`p-4 rounded-lg border ${
              configStatus.config.cloudflare.configured 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">☁️</span>
                <h4 className="font-semibold text-gray-900">Cloudflare</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className={configStatus.config.cloudflare.hasToken ? 'text-green-600' : 'text-red-600'}>
                  {configStatus.config.cloudflare.hasToken ? '✅' : '❌'} Token: {configStatus.config.cloudflare.hasToken ? 'Configuré' : 'Manquant'}
                </div>
                <div className={configStatus.config.cloudflare.hasZoneId ? 'text-green-600' : 'text-red-600'}>
                  {configStatus.config.cloudflare.hasZoneId ? '✅' : '❌'} Zone ID: {configStatus.config.cloudflare.hasZoneId ? 'Configuré' : 'Manquant'}
                </div>
              </div>
            </div>

            {/* Railway */}
            <div className={`p-4 rounded-lg border ${
              configStatus.config.railway.configured 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🚂</span>
                <h4 className="font-semibold text-gray-900">Railway</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className={configStatus.config.railway.hasToken ? 'text-green-600' : 'text-red-600'}>
                  {configStatus.config.railway.hasToken ? '✅' : '❌'} Token: {configStatus.config.railway.hasToken ? 'Configuré' : 'Manquant'}
                </div>
                <div className={configStatus.config.railway.hasProjectId ? 'text-green-600' : 'text-red-600'}>
                  {configStatus.config.railway.hasProjectId ? '✅' : '❌'} Project ID: {configStatus.config.railway.hasProjectId ? 'Configuré' : 'Manquant'}
                </div>
              </div>
            </div>

            {/* Table Security Events */}
            <div className={`p-4 rounded-lg border ${
              configStatus.securityTable.exists 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🔒</span>
                <h4 className="font-semibold text-gray-900">Table Sécurité</h4>
              </div>
              <div className={`text-sm ${configStatus.securityTable.exists ? 'text-green-600' : 'text-red-600'}`}>
                {configStatus.securityTable.status}
              </div>
            </div>
          </div>

          {/* Recommandations */}
          {configStatus.recommendations && configStatus.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">📋 Recommandations :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {configStatus.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Status de santé système */}
      {health && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🏥 Status de Santé du Système
          </h3>
          <div className={`grid grid-cols-1 gap-4 ${health.redisConfigured ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            <div className={`p-4 rounded-lg ${health.database ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${health.database ? 'bg-green-500' : 'bg-red-500'} mr-3`}></div>
                <span className="font-medium">Base de données</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {health.database ? '✅ Opérationnelle' : '❌ Erreur'}
              </div>
            </div>
            {health.redisConfigured && (
              <div className={`p-4 rounded-lg ${health.redis ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${health.redis ? 'bg-green-500' : 'bg-yellow-500'} mr-3`}></div>
                  <span className="font-medium">Cache Redis</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {health.redis ? '✅ Actif' : '⚠️ Non configuré'}
                </div>
              </div>
            )}
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

      {/* Métriques Temps Réel */}
      {realtimeMetrics && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⚡ Métriques Temps Réel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cloudflare - Résumé */}
            {realtimeMetrics.cloudflare ? (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">☁️</span>
                  <h4 className="font-semibold text-gray-900">Cloudflare</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requêtes (7j)</span>
                    <span className="font-medium">{realtimeMetrics.cloudflare.requests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bande passante</span>
                    <span className="font-medium">{(realtimeMetrics.cloudflare.bandwidth / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Erreurs</span>
                    <span className="font-medium text-red-600">{realtimeMetrics.cloudflare.errors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache Hit Rate</span>
                    <span className="font-medium">{realtimeMetrics.cloudflare.cacheHitRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">☁️</span>
                  <h4 className="font-semibold text-gray-500">Cloudflare</h4>
                </div>
                <p className="text-sm text-gray-400">Non configuré</p>
              </div>
            )}

            {/* Railway */}
            {realtimeMetrics.railway ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">🚂</span>
                  <h4 className="font-semibold text-gray-900">Railway</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPU</span>
                    <span className="font-medium">{realtimeMetrics.railway.cpu.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mémoire</span>
                    <span className="font-medium">{realtimeMetrics.railway.memory.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium">{Math.round(realtimeMetrics.railway.uptime / 3600)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Réseau (ingress)</span>
                    <span className="font-medium">{(realtimeMetrics.railway.network.ingress / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">🚂</span>
                  <h4 className="font-semibold text-gray-500">Railway</h4>
                </div>
                <p className="text-sm text-gray-400">Non configuré</p>
              </div>
            )}

            {/* Système Node.js */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">💻</span>
                <h4 className="font-semibold text-gray-900">Système Node.js</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mémoire</span>
                  <span className="font-medium">{realtimeMetrics.system.memory.percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilisée</span>
                  <span className="font-medium">{realtimeMetrics.system.memory.used} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">{Math.round(realtimeMetrics.system.uptime / 3600)}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métriques Cloudflare Détaillées avec Graphiques */}
      {realtimeMetrics?.cloudflare && realtimeMetrics.cloudflare.dailyData && realtimeMetrics.cloudflare.dailyData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              📊 Métriques Cloudflare Détaillées
            </h3>
            <div className="text-sm text-gray-500">
              Dernière mise à jour: {new Date(realtimeMetrics.cloudflare.lastUpdate).toLocaleTimeString('fr-FR')}
            </div>
          </div>
          
          {/* Métriques de base en cartes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Requêtes (7j)</p>
              <p className="text-2xl font-bold text-gray-900">{realtimeMetrics.cloudflare.requests.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Bande passante</p>
              <p className="text-2xl font-bold text-gray-900">{(realtimeMetrics.cloudflare.bandwidth / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">{realtimeMetrics.cloudflare.cacheHitRate.toFixed(1)}%</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600 mb-1">Erreurs</p>
              <p className="text-2xl font-bold text-red-600">{realtimeMetrics.cloudflare.errors}</p>
            </div>
          </div>
          
          {/* Graphiques */}
          <CloudflareMetricsCharts metrics={realtimeMetrics.cloudflare} />
        </div>
      )}

      {/* Données de Sécurité */}
      {securityEvents && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔒 Données de Sécurité
          </h3>
          
          {/* Statistiques des 24 dernières heures */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Événements (24h)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-xs text-gray-600 mb-1">Connexions échouées</div>
                <div className="text-2xl font-bold text-red-600">{securityEvents.stats.last24h.failed_login}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-xs text-gray-600 mb-1">Requêtes bloquées</div>
                <div className="text-2xl font-bold text-orange-600">{securityEvents.stats.last24h.blocked_request}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-xs text-gray-600 mb-1">Activité suspecte</div>
                <div className="text-2xl font-bold text-yellow-600">{securityEvents.stats.last24h.suspicious_activity}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-xs text-gray-600 mb-1">Rate limit</div>
                <div className="text-2xl font-bold text-purple-600">{securityEvents.stats.last24h.rate_limit_exceeded}</div>
              </div>
            </div>
          </div>

          {/* Top IPs */}
          {securityEvents.topIPs.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Top IPs (24h)</h4>
              <div className="space-y-2">
                {securityEvents.topIPs.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-mono text-gray-700">{item.ip}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count} événements</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Derniers événements */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Derniers événements</h4>
            {securityEvents.events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {securityEvents.events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.type === 'failed_login' ? 'bg-red-100 text-red-800' :
                            event.type === 'blocked_request' ? 'bg-orange-100 text-orange-800' :
                            event.type === 'suspicious_activity' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-700">{event.ip_address}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{event.email || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(event.created_at).toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucun événement récent</p>
            )}
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
    </div>
  );
}
