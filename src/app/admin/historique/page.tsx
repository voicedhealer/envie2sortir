"use client";

import { useState, useEffect } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';

interface AdminAction {
  id: string;
  action: string;
  reason: string | null;
  previousStatus: string | null;
  newStatus: string | null;
  createdAt: string;
  admin: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  establishment: {
    name: string;
    slug: string;
  };
}

export default function AdminHistoriquePage() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (sessionLoading) return;
    
    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    
    loadActions();
  }, [page, session, sessionLoading, router]);

  // Redirection si pas admin
  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  const loadActions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/actions?page=${page}&limit=20`);
      
      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      setActions(data.actions);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'REJECT':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'PENDING':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'DELETE':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'APPROVE': return 'Approuvé';
      case 'REJECT': return 'Rejeté';
      case 'PENDING': return 'Remis en attente';
      case 'DELETE': return 'Supprimé';
      case 'RESTORE': return 'Restauré';
      case 'UPDATE': return 'Mis à jour';
      default: return action;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approuvé</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejeté</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>En attente</span>;
      case 'deleted':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Supprimé</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadActions}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historique des actions</h1>
          <p className="mt-2 text-gray-600">
            Traçabilité complète de toutes les actions administratives
          </p>
        </div>

        {/* Actions List */}
        <div className="bg-white shadow rounded-lg">
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune action enregistrée</h3>
              <p className="text-gray-500">L'historique des actions administratives apparaîtra ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {actions.map((action) => (
                <div key={action.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {getActionIcon(action.action)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {getActionLabel(action.action)} - {action.establishment.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Par {action.admin.firstName} {action.admin.lastName} ({action.admin.email})
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(action.createdAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4">
                        {action.previousStatus && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">De:</span>
                            {getStatusBadge(action.previousStatus)}
                          </div>
                        )}
                        {action.newStatus && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Vers:</span>
                            {getStatusBadge(action.newStatus)}
                          </div>
                        )}
                      </div>
                      
                      {action.reason && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Raison:</strong> {action.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-orange-50 border border-orange-200 rounded-md">
                Page {page} sur {totalPages}
              </span>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
