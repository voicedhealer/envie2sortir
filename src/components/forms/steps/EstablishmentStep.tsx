import { ModernActivitiesSelector } from "@/components/ModernActivitiesSelector"; 
import OpeningHoursInput from '@/components/forms/OpeningHoursInput';
import AdresseStep from '@/components/forms/AdresseStep';
import { AddressData } from '@/components/forms/AdresseStep';

interface EstablishmentStepProps {
  formData: {
    establishmentName: string;
    description: string;
    address: AddressData;
    hours: any;
    activities: string[];
    phone?: string;
    whatsappPhone?: string;
    messengerUrl?: string;
    email?: string;
  };
  errors: Record<string, string>;
  onInputChange: (field: string | number | symbol, value: any) => void;
  onAddressValidationChange: (isValid: boolean) => void;
}

export default function EstablishmentStep({
  formData,
  errors,
  onInputChange,
  onAddressValidationChange
}: EstablishmentStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Informations sur l'établissement
        </h2>
        <p className="text-gray-600 mt-2">
          Décrivez votre établissement pour que les clients le trouvent facilement
        </p>
      </div>
      
      {/* Nom commercial */}
      <div>
        <label className="block text-sm font-medium mb-2">Nom de l'établissement *</label>
        <input
          type="text"
          value={formData.establishmentName}
          onChange={(e) => onInputChange('establishmentName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.establishmentName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Le Central Bar"
        />
        {errors.establishmentName && <p className="text-red-500 text-sm mt-1">{errors.establishmentName}</p>}
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description de l'établissement <span className="text-xs text-gray-500 ml-1">(Pensez à aérer votre description pour une meilleure visibilité)</span></label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Décrivez l'ambiance, les spécialités, etc."
        />
      </div>
      
      {/* Adresse de l'établissement */}
      <AdresseStep
        value={formData.address}
        onChange={(address) => onInputChange('address', address)}
        error={errors.address}
        disableAutoGeocode={false}
        onValidationChange={onAddressValidationChange}
      />
      
      {/* Horaires d'ouverture */}
      <OpeningHoursInput 
        value={formData.hours} 
        onChange={(hours) => onInputChange('hours', hours)} 
      />
      
      {/* Activités proposées */}
      <ModernActivitiesSelector
        value={formData.activities}
        onChange={(value) => onInputChange('activities', value)}
        error={errors.activities}
      />
      
      {/* === CONTACT DE L'ÉTABLISSEMENT === */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📞 Contact de l'établissement
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ces informations seront visibles sur la page de l'établissement, elles serviront aux clients pour contacter l'établissement.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="text-orange-500 mr-3 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-orange-900 mb-1">💡 Information importante</h4>
              <p className="text-sm text-orange-800">
                <strong>Recommandé :</strong> Renseignez au minimum le téléphone et l'email de votre établissement. 
                Ces informations apparaîtront dans la fiche récapitulative pour validation par nos équipes.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Téléphone de l'établissement */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Téléphone de l'établissement
              <span className="text-xs text-orange-600 ml-1">(recommandé)</span>
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="04 78 90 12 34"
            />
            <p className="text-xs text-gray-500 mt-1">
              📞 Numéro fixe pour les appels
            </p>
          </div>
          
          {/* WhatsApp de l'établissement */}
          <div>
            <label className="block text-sm font-medium mb-2">
              WhatsApp
              <span className="text-xs text-gray-500 ml-1">(optionnel)</span>
            </label>
            <input
              type="tel"
              value={formData.whatsappPhone || ''}
              onChange={(e) => onInputChange('whatsappPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="06 12 34 56 78"
            />
            <p className="text-xs text-gray-500 mt-1">
              📱 Numéro mobile pour WhatsApp
            </p>
          </div>
          
          {/* Messenger de l'établissement */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Messenger (Facebook)
              <span className="text-xs text-gray-500 ml-1">(optionnel)</span>
            </label>
            <input
              type="url"
              value={formData.messengerUrl || ''}
              onChange={(e) => onInputChange('messengerUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://m.me/votre-page-facebook"
            />
            <p className="text-xs text-gray-500 mt-1">
              💬 Lien vers votre page Facebook Messenger
            </p>
          </div>
          
          {/* Email de l'établissement */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Email de l'établissement
              <span className="text-xs text-orange-600 ml-1">(recommandé)</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="contact@votre-etablissement.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              ✉️ Email visible par les clients
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
