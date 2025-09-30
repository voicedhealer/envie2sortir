import { SUBSCRIPTION_PLANS } from '@/types/establishment-form.types';
import { Icons } from '@/components/Icons';

interface SubscriptionStepProps {
  formData: {
    subscriptionPlan: 'free' | 'premium';
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
        <h2 className="text-2xl font-bold text-gray-900">Choisissez votre plan</h2>
        <p className="text-gray-600 mt-2">
          Sélectionnez le plan qui correspond le mieux à vos besoins
        </p>
      </div>
      
      {/* Sélection du plan */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.subscriptionPlan === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onInputChange('subscriptionPlan', key)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{plan.label}</h3>
              <span className="text-lg font-bold text-blue-600">{plan.price}</span>
            </div>
            <ul className="text-sm space-y-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <Icons.Check />
                  <span className="ml-2">{feature}</span>
                </li>
              ))}
            </ul>
            {key === 'premium' && (
              <div className="mt-2">
                <Icons.Star />
                <span className="text-sm text-gray-600 ml-1">Recommandé</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Vous pourrez ajouter vos photos après l'inscription depuis votre espace professionnel.
          {formData.subscriptionPlan === 'premium' 
            ? ' Avec le plan Premium, vous pourrez ajouter jusqu\'à 10 photos.'
            : ' Avec le plan Gratuit, vous pourrez ajouter 1 photo.'
          }
        </p>
      </div>
      
      {errors.subscriptionPlan && (
        <p className="text-red-500 text-sm mt-1">{errors.subscriptionPlan}</p>
      )}
    </div>
  );
}
