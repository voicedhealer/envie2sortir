import OrganizedServicesAmbianceManager from '@/components/OrganizedServicesAmbianceManager';

interface ServicesStepProps {
  formData: {
    services: string[];
    ambiance: string[];
    informationsPratiques?: string[];
    hybridAccessibilityDetails?: any;
    hybridDetailedServices?: any;
    hybridClienteleInfo?: any;
    hybridDetailedPayments?: any;
    hybridChildrenServices?: any;
  };
  isEditMode: boolean;
  onInputChange: (field: string | number | symbol, value: any) => void;
}

export default function ServicesStep({
  formData,
  isEditMode,
  onInputChange
}: ServicesStepProps) {
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

      {/* Affichage des données hybrides si elles existent */}
      {(formData.hybridAccessibilityDetails || formData.hybridDetailedServices || 
        formData.hybridClienteleInfo || formData.hybridDetailedPayments || 
        formData.hybridChildrenServices) && (
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
          </div>
          <p className="text-sm text-orange-700 mt-3">
            💡 Ces informations détaillées ont été récupérées lors de l'enrichissement et seront intégrées à votre établissement.
          </p>
        </div>
      )}

      <OrganizedServicesAmbianceManager
        services={(formData.services || []).filter(service => {
          const serviceLower = service.toLowerCase();
          // Exclure les moyens de paiement des services
          return !serviceLower.includes('carte') && 
                 !serviceLower.includes('paiement') && 
                 !serviceLower.includes('nfc') && 
                 !serviceLower.includes('pluxee') && 
                 !serviceLower.includes('titre') &&
                 !serviceLower.includes('crédit') &&
                 !serviceLower.includes('débit');
        })}
        ambiance={formData.ambiance || []}
        informationsPratiques={formData.informationsPratiques || []}
        onServicesChange={(services) => onInputChange('services', services)}
        onAmbianceChange={(ambiance) => onInputChange('ambiance', ambiance)}
        onInformationsPratiquesChange={(informationsPratiques) => onInputChange('informationsPratiques', informationsPratiques)}
        isEditMode={isEditMode}
      />
    </div>
  );
}
