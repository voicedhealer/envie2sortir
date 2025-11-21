'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icons } from '@/components/Icons';

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
  } | null;
  plan: 'FREE' | 'PREMIUM';
}

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
    
    // Si on vient de Stripe avec success=true, attendre un peu et recharger
    if (searchParams.get('success') === 'true') {
      // Attendre 2 secondes pour laisser le webhook se traiter
      const timer = setTimeout(() => {
        loadSubscription();
      }, 2000);
      
      // Recharger à nouveau après 5 secondes au cas où
      const retryTimer = setTimeout(() => {
        loadSubscription();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(retryTimer);
      };
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Le paiement a été annulé. Vous pouvez réessayer à tout moment.');
    }
  }, [searchParams]);

  const loadSubscription = async () => {
    try {
      setError(null); // Réinitialiser l'erreur avant de charger
      const response = await fetch('/api/stripe/subscription');
      if (!response.ok) {
        // Si on vient de Stripe avec success, ne pas afficher d'erreur immédiatement
        if (searchParams.get('success') === 'true') {
          console.log('Webhook en cours de traitement, réessai dans quelques secondes...');
          return;
        }
        throw new Error('Erreur lors du chargement de l\'abonnement');
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err: any) {
      // Si on vient de Stripe avec success, ne pas afficher l'erreur immédiatement
      if (searchParams.get('success') === 'true') {
        console.log('Webhook en cours de traitement, réessai dans quelques secondes...');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la session de paiement');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période en cours.')) {
      return;
    }

    try {
      setCanceling(true);
      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'annulation');
      }

      await loadSubscription();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setReactivating(true);
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la réactivation');
      }

      await loadSubscription();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff751f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const isPremium = subscription?.plan === 'PREMIUM';
  const hasActiveSubscription = subscription?.subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de l'abonnement</h1>
        </div>

        {searchParams.get('success') === 'true' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✅ Paiement réussi ! Votre abonnement Premium est en cours d'activation...
            </p>
            {loading && (
              <p className="text-green-700 text-sm mt-2">
                Synchronisation en cours, veuillez patienter quelques secondes...
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {!isPremium ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Plan actuel : Basic (Gratuit)
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Passez au plan Premium pour débloquer toutes les fonctionnalités avancées.
              </p>
              
              {/* Sélection du plan */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-[#ff751f] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Plan Mensuel</h3>
                    {selectedPlan === 'monthly' && (
                      <span className="text-[#ff751f]">✓</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">29,90€</p>
                  <p className="text-sm text-gray-600">par mois</p>
                </div>
                
                <div
                  onClick={() => setSelectedPlan('annual')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                    selectedPlan === 'annual'
                      ? 'border-[#ff751f] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="absolute -top-3 right-4">
                    <span className="bg-[#ff751f] text-white text-xs px-2 py-1 rounded-full font-semibold">
                      -15%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Plan Annuel</h3>
                    {selectedPlan === 'annual' && (
                      <span className="text-[#ff751f]">✓</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">305€</p>
                  <p className="text-sm text-gray-600">par an (25,42€/mois)</p>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="bg-[#ff751f] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#ff8a3d] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : `Passer au Premium - ${selectedPlan === 'annual' ? '305€/an' : '29,90€/mois'}`}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Plan Premium
                  </h2>
                  <p className="text-gray-600 mt-1">29,90€/mois</p>
                </div>
                <span className="px-4 py-2 bg-[#ff751f] text-white rounded-full font-semibold">
                  Actif
                </span>
              </div>

              {subscription?.subscription && (
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Période actuelle</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(subscription.subscription.currentPeriodStart).toLocaleDateString('fr-FR')} - {' '}
                      {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {subscription.subscription.cancelAtPeriodEnd ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 font-semibold mb-2">
                        ⚠️ Abonnement annulé
                      </p>
                      <p className="text-orange-700 text-sm mb-4">
                        Votre abonnement restera actif jusqu'au{' '}
                        {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}.
                      </p>
                      <button
                        onClick={handleReactivate}
                        disabled={reactivating}
                        className="bg-[#ff751f] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#ff8a3d] transition-colors disabled:opacity-50"
                      >
                        {reactivating ? 'Réactivation...' : 'Réactiver l\'abonnement'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCancel}
                      disabled={canceling}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {canceling ? 'Annulation...' : 'Annuler l\'abonnement'}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités Premium incluses :</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-5 h-5 text-[#ff751f] mt-0.5" />
                    <span>🦋 Effet Papillon : jusqu'à 5 photos avec découverte progressive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-5 h-5 text-[#ff751f] mt-0.5" />
                    <span>🔥 Badge Premium avec logo flamme tendance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-5 h-5 text-[#ff751f] mt-0.5" />
                    <span>📢 Créez des Événements temporaires</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-5 h-5 text-[#ff751f] mt-0.5" />
                    <span>🎁 Publiez des Bons Plans quotidiens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-5 h-5 text-[#ff751f] mt-0.5" />
                    <span>⭐ Mise en avant prioritaire dans les résultats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.Check className="w-5 h-5 text-[#ff751f] mt-0.5" />
                    <span>📊 Analytics avancées</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

