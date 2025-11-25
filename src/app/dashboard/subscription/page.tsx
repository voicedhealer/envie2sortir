'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Icons } from '@/components/Icons';

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    planType?: 'monthly' | 'annual';
    scheduledChange?: {
      newPriceId: string;
      effectiveDate: string;
      planType: 'monthly' | 'annual';
    } | null;
  } | null;
  plan: 'FREE' | 'PREMIUM';
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      
      // Redirection automatique vers le dashboard après 5 secondes
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(retryTimer);
        clearTimeout(redirectTimer);
      };
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Le paiement a été annulé. Vous pouvez réessayer à tout moment.');
    }
  }, [searchParams, router]);

  const loadSubscription = async () => {
    try {
      setError(null); // Réinitialiser l'erreur avant de charger
      const url = searchParams.get('success') === 'true' 
        ? '/api/stripe/subscription?success=true'
        : '/api/stripe/subscription';
      const response = await fetch(url);
      
      if (!response.ok) {
        // Si on vient de Stripe avec success, ne pas afficher d'erreur immédiatement
        if (searchParams.get('success') === 'true') {
          console.log('Webhook en cours de traitement, réessai dans quelques secondes...');
          return;
        }
        throw new Error('Erreur lors du chargement de l\'abonnement');
      }
      const data = await response.json();
      
      // Si on vient de Stripe et que le webhook est en cours, attendre un peu
      if (data.fromStripeSuccess && !data.subscription) {
        console.log('Webhook en cours de traitement, réessai dans quelques secondes...');
        // Ne pas mettre à jour l'état, juste attendre
        return;
      }
      
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

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    
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

  const handleChangeToAnnual = async () => {
    try {
      setChangingPlan(true);
      setError(null);

      const response = await fetch('/api/stripe/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPlanType: 'annual' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du changement de plan');
      }

      const result = await response.json();
      alert(`✅ ${result.message}`);
      await loadSubscription();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setChangingPlan(false);
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
  const hasActiveSubscription = subscription?.subscription?.status === 'active' || subscription?.subscription?.status === 'trialing';

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
          <div className="mb-6 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h2 className="text-3xl font-bold text-green-900 mb-3">
                Paiement réussi !
              </h2>
              <div className="bg-white rounded-lg p-6 mb-4 inline-block">
                <p className="text-green-800 text-xl font-semibold mb-2">
                  Votre abonnement Premium est activé
                </p>
                {subscription?.subscription?.planType && (
                  <p className="text-gray-700 text-lg">
                    {subscription.subscription.planType === 'annual' 
                      ? '305€/an (25,42€/mois)' 
                      : '29,90€/mois'}
                  </p>
                )}
              </div>
              <p className="text-green-700 text-base mb-4">
                Vous pouvez maintenant profiter de toutes les fonctionnalités Premium !
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span>Redirection automatique vers votre dashboard dans quelques secondes...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Si on vient d'un paiement réussi, ne pas afficher les options d'abonnement */}
          {searchParams.get('success') === 'true' ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bienvenue dans Premium !
                </h3>
                <p className="text-gray-600 mb-6">
                  Votre abonnement est maintenant actif. Vous allez être redirigé vers votre dashboard professionnel.
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff751f]"></div>
                  <p className="text-sm text-gray-500">
                    Redirection en cours...
                  </p>
                </div>
              </div>
            </div>
          ) : !isPremium ? (
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
                  <p className="text-gray-600 mt-1">
                    {subscription?.subscription?.planType === 'annual' 
                      ? '305€/an (25,42€/mois)' 
                      : '29,90€/mois'}
                  </p>
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

                  {/* Message d'annulation programmée - Prioritaire et visible */}
                  {subscription.subscription.cancelAtPeriodEnd && (
                    <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-orange-900 font-bold text-base mb-1">
                            Annulation prévue le {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-orange-800 text-sm mb-3">
                            Votre abonnement Premium restera actif jusqu'au{' '}
                            <span className="font-semibold">
                              {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                            </span>.
                            Après cette date, votre compte repassera automatiquement en plan Basic (Gratuit).
                          </p>
                          <button
                            onClick={handleReactivate}
                            disabled={reactivating}
                            className="bg-[#ff751f] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#ff8a3d] transition-colors disabled:opacity-50"
                          >
                            {reactivating ? 'Réactivation...' : 'Réactiver l\'abonnement'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message si un changement est programmé (mais pas d'annulation) */}
                  {subscription.subscription.scheduledChange && !subscription.subscription.cancelAtPeriodEnd && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-semibold mb-2">
                        📅 Changement programmé
                      </p>
                      <p className="text-blue-700 text-sm">
                        Votre abonnement passera au plan{' '}
                        <span className="font-semibold">
                          {subscription.subscription.scheduledChange.planType === 'annual' 
                            ? 'Annuel (305€/an)' 
                            : 'Mensuel (29,90€/mois)'}
                        </span>{' '}
                        le {new Date(subscription.subscription.scheduledChange.effectiveDate).toLocaleDateString('fr-FR')}.
                      </p>
                    </div>
                  )}

                  {/* Bouton pour passer à l'annuel si abonnement mensuel */}
                  {subscription.subscription.planType === 'monthly' && !subscription.subscription.scheduledChange && !subscription.subscription.cancelAtPeriodEnd && (
                    <div className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-green-800 font-semibold mb-2">
                            💰 Économisez avec le plan annuel !
                          </p>
                          <p className="text-green-700 text-sm mb-3">
                            Passez au plan annuel et économisez 15% (53,80€/an). Le changement prendra effet à la fin de votre période mensuelle actuelle.
                          </p>
                          <ul className="text-xs text-green-600 space-y-1 mb-3">
                            <li>✓ Prix : <span className="font-semibold">305€/an</span> au lieu de 358,80€</li>
                            <li>✓ Soit <span className="font-semibold">25,42€/mois</span> au lieu de 29,90€</li>
                            <li>✓ Changement automatique le {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}</li>
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={handleChangeToAnnual}
                        disabled={changingPlan}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {changingPlan ? 'Programmation...' : 'Passer au plan annuel'}
                      </button>
                    </div>
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

              {/* Bouton d'annulation en bas de page */}
              {isPremium && 
               hasActiveSubscription && 
               subscription?.subscription &&
               !subscription.subscription.cancelAtPeriodEnd && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleCancel}
                    disabled={canceling}
                    className="bg-transparent text-red-600 border-2 border-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {canceling ? 'Annulation...' : 'Annuler l\'abonnement'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Nous sommes désolés de vous voir arrêter votre plan Premium
                </h2>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>

              {/* Message principal avec bouton messagerie */}
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Voulez-vous nous en parler ?
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      router.push('/dashboard/messagerie');
                    }}
                    className="bg-[#ff751f] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#ff8a3d] transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Rejoindre la messagerie
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Votre abonnement restera actif jusqu'au{' '}
                  {subscription?.subscription?.currentPeriodEnd 
                    ? new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'la fin de la période en cours'
                  }.
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-orange-800 font-semibold mb-2">
                    ⚠️ Attention : En passant au plan gratuit, vous perdrez :
                  </p>
                </div>
              </div>

              {/* Liste des fonctionnalités perdues */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Effet Papillon :</span> Vous ne pourrez plus ajouter que 1 photo au lieu de 5
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Badge Premium :</span> Votre établissement perdra son badge Premium et sa mise en avant visuelle
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Événements :</span> Vous ne pourrez plus créer d'événements temporaires pour promouvoir votre établissement
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Bons Plans :</span> Vous ne pourrez plus publier de bons plans quotidiens pour attirer plus de clients
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Visibilité :</span> Votre établissement ne sera plus mis en avant prioritairement dans les résultats de recherche
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Analytics :</span> Vous perdrez l'accès aux statistiques avancées et au profil détaillé de vos visiteurs
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <div>
                      <span className="font-semibold text-gray-900">Support :</span> Vous n'aurez plus accès au support client prioritaire et dédié
                    </div>
                  </li>
                </ul>
              </div>

              {/* Message de rassurance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Bon à savoir :</strong> Vous pourrez réactiver votre abonnement Premium à tout moment depuis cette page, sans perdre vos données.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Conserver mon abonnement
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={canceling}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {canceling ? 'Annulation...' : 'Oui, annuler mon abonnement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff751f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}

