import UnifiedServicesAmbianceManager from '@/components/UnifiedServicesAmbianceManager';
import { convertPaymentMethodsObjectToArray, convertPaymentMethodsArrayToObject } from '@/lib/establishment-form.utils';

interface ServicesStepProps {
  formData: {
    services: string[];
    ambiance: string[];
    informationsPratiques?: string[];
    paymentMethods?: any; // Peut être string[] ou objet {creditCards: true, ...}
    hybridAccessibilityDetails?: any;
    hybridDetailedServices?: any;
    hybridClienteleInfo?: any;
    hybridDetailedPayments?: any;
    hybridChildrenServices?: any;
    hybridParkingInfo?: any;
  };
  isEditMode: boolean;
  onInputChange: (field: string | number | symbol, value: any) => void;
}

export default function ServicesStep({
  formData,
  isEditMode,
  onInputChange
}: ServicesStepProps) {
  // 🔍 DIAGNOSTIC - Logs pour voir les données sources
  console.log('🔍 DIAGNOSTIC - Services:', formData.services);
  console.log('🔍 DIAGNOSTIC - Ambiance:', formData.ambiance);
  console.log('🔍 DIAGNOSTIC - Informations pratiques:', formData.informationsPratiques);
  console.log('🔍 DIAGNOSTIC - Toutes les données hybrides:', {
    hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
    hybridDetailedServices: formData.hybridDetailedServices,
    hybridClienteleInfo: formData.hybridClienteleInfo,
    hybridDetailedPayments: formData.hybridDetailedPayments,
    hybridChildrenServices: formData.hybridChildrenServices,
    hybridParkingInfo: formData.hybridParkingInfo
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Services et ambiance
        </h2>
        <p className="text-gray-600 mt-2">
          {isEditMode 
            ? 'Gérez les services et l\'ambiance de votre établissement'
            : 'Personnalisez les services et l\'ambiance détectés automatiquement'
          }
        </p>
      </div>

      {/* Affichage des données hybrides si elles existent - MASQUÉ */}
      {false && (formData.hybridAccessibilityDetails || formData.hybridDetailedServices || 
        formData.hybridClienteleInfo || formData.hybridDetailedPayments || 
        formData.hybridChildrenServices || formData.hybridParkingInfo) && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
            🌟 Informations détaillées récupérées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {formData.hybridAccessibilityDetails && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">♿ Accessibilité détaillée</h4>
                <p className="text-gray-600">
                  {Object.keys(formData.hybridAccessibilityDetails).length} éléments configurés
                </p>
              </div>
            )}
            {formData.hybridDetailedServices && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">🏪 Services détaillés</h4>
                <p className="text-gray-600">
                  {Object.keys(formData.hybridDetailedServices).length} services configurés
                </p>
              </div>
            )}
            {formData.hybridClienteleInfo && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">👥 Clientèle et inclusivité</h4>
                <p className="text-gray-600">
                  {Object.keys(formData.hybridClienteleInfo).length} informations configurées
                </p>
              </div>
            )}
            {formData.hybridDetailedPayments && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">💳 Moyens de paiement détaillés</h4>
                <p className="text-gray-600">
                  {Object.keys(formData.hybridDetailedPayments).length} moyens configurés
                </p>
              </div>
            )}
            {formData.hybridChildrenServices && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">👶 Services enfants</h4>
                <p className="text-gray-600">
                  {Object.keys(formData.hybridChildrenServices).length} services configurés
                </p>
              </div>
            )}
            {formData.hybridParkingInfo && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">🅿️ Informations parking</h4>
                <p className="text-gray-600">
                  {Object.keys(formData.hybridParkingInfo).length} options configurées
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-orange-700 mt-3">
            💡 Ces informations détaillées ont été récupérées lors de l'enrichissement et seront intégrées à votre établissement.
          </p>
        </div>
      )}

      <UnifiedServicesAmbianceManager
        services={formData.services || []}
        ambiance={formData.ambiance || []}
        informationsPratiques={formData.informationsPratiques || []}
        paymentMethods={
          // ✅ CORRECTION : Garder le format tableau, convertir l'objet si nécessaire
          formData.paymentMethods 
            ? (Array.isArray(formData.paymentMethods) 
                ? formData.paymentMethods 
                : convertPaymentMethodsObjectToArray(formData.paymentMethods))
            : []
        }
        onServicesChange={(services) => onInputChange('services', services)}
        onAmbianceChange={(ambiance) => onInputChange('ambiance', ambiance)}
        onInformationsPratiquesChange={(informationsPratiques) => onInputChange('informationsPratiques', informationsPratiques)}
        onPaymentMethodsChange={(paymentMethodsArray) => {
          // ✅ CORRECTION : Sauvegarder directement le tableau, sans conversion
          console.log('💾 SAUVEGARDE - Moyens de paiement (tableau):', paymentMethodsArray);
          // ✅ Vérifier qu'on ne perd pas les items existants
          console.log('💾 VÉRIFICATION - Nombre d\'items:', paymentMethodsArray.length);
          console.log('💾 VÉRIFICATION - Détail des items:', paymentMethodsArray);
          onInputChange('paymentMethods', paymentMethodsArray);
        }}
        isEditMode={isEditMode}
        establishmentType="restaurant" // TODO: Récupérer le type d'établissement depuis les données
      />
    </div>
  );
}
