import { SUBSCRIPTION_PLANS } from '@/types/establishment-form.types';
import { Icons } from '@/components/Icons';

interface SubscriptionStepProps {
  formData: {
    subscriptionPlan: 'free' | 'premium';
    subscriptionPlanType?: 'monthly' | 'annual';
  };
  errors: Record<string, string>;
  onInputChange: (field: string | number | symbol, value: any) => void;
}

export default function SubscriptionStep({
  formData,
  errors,
  onInputChange
}: SubscriptionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Choisissez votre plan d'abonnement</h2>
        <p className="text-gray-600 mt-3 text-lg">
          Boostez votre visibilité et attirez plus de clients
        </p>
      </div>
      
      {/* Sélection du plan */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const isSelected = formData.subscriptionPlan === key;
          const isPremium = key === 'premium';
          
          return (
            <div
              key={key}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                isSelected
                  ? isPremium 
                    ? 'border-[#ff751f] bg-gradient-to-br from-orange-50 to-white shadow-xl' 
                    : 'border-gray-400 bg-gray-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => onInputChange('subscriptionPlan', key)}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isPremium 
                      ? 'bg-[#ff751f] text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{plan.label}</h3>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isPremium ? 'text-[#ff751f]' : 'text-gray-700'}`}>
                    {plan.price}
                  </div>
                  {!isPremium && <div className="text-xs text-gray-500">Pour toujours</div>}
                </div>
              </div>

              {/* Savings pour Premium */}
              {isPremium && 'savings' in plan && plan.savings && plan.savings.trim() && (
                <div className="mb-4 p-2 bg-[#ff751f] bg-opacity-10 rounded-lg border border-[#ff751f] border-opacity-30">
                  <p className="text-sm font-semibold text-white text-center">
                    ✨ {plan.savings}
                  </p>
                </div>
              )}

              <ul className="space-y-3 mb-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className={`mt-0.5 ${isPremium ? 'text-[#ff751f]' : 'text-gray-500'}`}>
                      <Icons.Check />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Bouton de sélection */}
              <button
                type="button"
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  isSelected
                    ? isPremium
                      ? 'bg-[#ff751f] text-white'
                      : 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSelected ? '✓ Plan sélectionné' : 'Choisir ce plan'}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Sélection mensuel/annuel pour le plan Premium */}
      {formData.subscriptionPlan === 'premium' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Choisissez votre mode de paiement
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              onClick={() => onInputChange('subscriptionPlanType', 'monthly')}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.subscriptionPlanType === 'monthly'
                  ? 'border-[#ff751f] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Paiement Mensuel</h4>
                {formData.subscriptionPlanType === 'monthly' && (
                  <span className="text-[#ff751f]">✓</span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">29,90€</p>
              <p className="text-sm text-gray-600">par mois</p>
              <p className="text-xs text-gray-500 mt-2">Renouvelable automatiquement</p>
            </div>
            
            <div
              onClick={() => onInputChange('subscriptionPlanType', 'annual')}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                formData.subscriptionPlanType === 'annual'
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
                <h4 className="font-semibold text-gray-900">Paiement Annuel</h4>
                {formData.subscriptionPlanType === 'annual' && (
                  <span className="text-[#ff751f]">✓</span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">305€</p>
              <p className="text-sm text-gray-600">par an (25,42€/mois)</p>
              <p className="text-xs text-gray-500 mt-2">Renouvelable automatiquement</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Note informative avec icône */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📸</div>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-blue-900">À propos des photos :</strong> Vous pourrez ajouter vos photos après l'inscription depuis votre espace professionnel.
              {formData.subscriptionPlan === 'premium' 
                ? ' Avec le plan Premium, ajoutez jusqu\'à 5 photos. La photo principale sera mise en avant en couleur, accompagnée des 4 autres en noir et blanc. Vos visiteurs découvriront le reste en survolant avec leur souris (effet Papillon 🦋).'
                : ' Avec le plan Basic, vous pourrez ajouter 1 photo pour votre établissement.'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Checkbox d'acceptation des CGV */}
      {formData.subscriptionPlan === 'premium' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptCGV"
              name="acceptCGV"
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="acceptCGV" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
              J'accepte les{' '}
              <a href="/cgv" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500 underline">
                Conditions Générales de Vente (CGV)
              </a>
              {' '}et les{' '}
              <a href="/conditions" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500 underline">
                Conditions Générales d'Utilisation (CGU)
              </a>
            </label>
          </div>
        </div>
      )}
      
      {/* Message d'erreur */}
      {errors.subscriptionPlan && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
          <span>⚠️</span>
          {errors.subscriptionPlan}
        </p>
      )}
      {errors.subscriptionPlanType && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
          <span>⚠️</span>
          {errors.subscriptionPlanType}
        </p>
      )}
    </div>
  );
}
