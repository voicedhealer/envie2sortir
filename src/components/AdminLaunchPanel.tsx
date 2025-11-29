'use client';

import { useState, useEffect } from 'react';
import { Loader2, Rocket, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { formatLaunchDate, isLaunchActive, getDaysUntilLaunch } from '@/lib/launch';
import type { LaunchActivationResult } from '@/types/waitlist';

/**
 * Composant AdminLaunchPanel
 * Panel d'administration pour activer le lancement officiel
 */
export default function AdminLaunchPanel() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationResult, setActivationResult] = useState<LaunchActivationResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Charger le nombre de pros en waitlist
  useEffect(() => {
    loadWaitlistCount();
  }, []);

  const loadWaitlistCount = async () => {
    try {
      setIsLoading(true);
      // TODO: Créer une route API pour récupérer le count
      // Pour l'instant, on peut utiliser une route existante ou créer une nouvelle
      const res = await fetch('/api/admin/waitlist/count');
      if (res.ok) {
        const data = await res.json();
        setWaitlistCount(data.count || 0);
      }
    } catch (error) {
      console.error('Erreur chargement waitlist count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    setActivationResult(null);

    try {
      const res = await fetch('/api/admin/launch-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: LaunchActivationResult = await res.json();

      setActivationResult(data);

      if (data.success) {
        // Recharger le count
        await loadWaitlistCount();
        // Fermer le modal
        setShowConfirmModal(false);
      }
    } catch (error: any) {
      setActivationResult({
        success: false,
        error: error.message || 'Erreur lors de l\'activation',
        count: 0,
        errors: [],
      });
    } finally {
      setIsActivating(false);
    }
  };

  const launchDate = formatLaunchDate();
  const daysUntilLaunch = getDaysUntilLaunch();
  const launchActive = isLaunchActive();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#ff751f]/20 via-[#ff1fa9]/20 to-[#ff3a3a]/20 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="text-[#ff751f] w-6 h-6" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff751f] to-[#ff1fa9]">
            Activation du lancement
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Date de lancement</p>
            <p className="text-lg font-semibold text-white">{launchDate}</p>
          </div>

          <div className="bg-black/40 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Jours restants</p>
            <p className="text-lg font-semibold text-white">
              {launchActive ? 'Lancé' : `${daysUntilLaunch} jour${daysUntilLaunch > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="bg-black/40 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Professionnels en waitlist</p>
            {isLoading ? (
              <Loader2 className="animate-spin text-[#ff751f] w-5 h-5" />
            ) : (
              <p className="text-lg font-semibold text-white">{waitlistCount ?? '...'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bouton d'activation */}
      {!launchActive && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Activer le lancement officiel
              </h3>
              <p className="text-sm text-gray-400">
                Cette action va créer les abonnements Stripe pour tous les professionnels en waitlist
                et les convertir en premium.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isActivating || (waitlistCount !== null && waitlistCount === 0)}
              className="bg-gradient-to-r from-[#ff751f] to-[#ff1fa9] hover:from-[#ff751f]/80 hover:to-[#ff1fa9]/80 text-white font-semibold rounded-lg px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff751f]/20"
            >
              {isActivating ? (
                <>
                  <Loader2 className="animate-spin inline mr-2" size={18} />
                  Activation...
                </>
              ) : (
                'Activer le lancement'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Résultat de l'activation */}
      {activationResult && (
        <div
          className={`p-6 rounded-xl border ${
            activationResult.success
              ? 'bg-green-500/20 border-green-500/50'
              : 'bg-red-500/20 border-red-500/50'
          }`}
        >
          <div className="flex items-start gap-3">
            {activationResult.success ? (
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold mb-2 ${
                  activationResult.success ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {activationResult.success
                  ? `✅ ${activationResult.count} professionnel(s) activé(s) avec succès`
                  : '❌ Erreur lors de l\'activation'}
              </h3>

              {activationResult.error && (
                <p className="text-sm text-red-300 mb-2">{activationResult.error}</p>
              )}

              {activationResult.errors && activationResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-red-300 mb-2">Erreurs :</p>
                  <ul className="space-y-1">
                    {activationResult.errors.map((err, idx) => (
                      <li key={idx} className="text-sm text-red-400">
                        • {err.professionalId}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activationResult.activatedProfessionals &&
                activationResult.activatedProfessionals.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-green-300 mb-2">
                      Professionnels activés :
                    </p>
                    <ul className="space-y-1">
                      {activationResult.activatedProfessionals.map((pro, idx) => (
                        <li key={idx} className="text-sm text-green-400">
                          • {pro.email} {pro.establishmentName && `(${pro.establishmentName})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-[#ff751f] w-6 h-6" />
              <h3 className="text-xl font-semibold text-white">Confirmer l'activation</h3>
            </div>

            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir activer le lancement officiel ? Cette action va :
            </p>

            <ul className="list-disc list-inside text-sm text-gray-400 mb-6 space-y-2">
              <li>Créer les abonnements Stripe pour {waitlistCount} professionnel(s)</li>
              <li>Convertir tous les WAITLIST_BETA en PREMIUM</li>
              <li>Démarrer la facturation automatique</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isActivating}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg px-4 py-2 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="flex-1 bg-gradient-to-r from-[#ff751f] to-[#ff1fa9] hover:from-[#ff751f]/80 hover:to-[#ff1fa9]/80 text-white font-semibold rounded-lg px-4 py-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Activation...
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

