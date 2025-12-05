import SummaryStep from '@/components/forms/SummaryStep';
import { convertPaymentMethodsObjectToArray } from '@/lib/establishment-form.utils';
import { FormStep } from '@/types/establishment-form.types';

interface SummaryStepProps {
  formData: {
    establishmentName: string;
    description: string;
    address: {
      street: string;
      postalCode: string;
      city: string;
    };
    activities: string[];
    hours: any;
    services: string[];
    ambiance: string[];
    paymentMethods?: any;
    tags: string[];
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    accountFirstName?: string;
    accountLastName?: string;
    accountPhone: string;
    accountEmail: string;
    // Nouvelles données SIRET enrichies
    siret?: string;
    companyName?: string;
    legalStatus?: string;
    siretAddress?: string;
    siretActivity?: string;
    siretCreationDate?: string;
    siretEffectifs?: string;
    // Champs supplémentaires
    whatsappPhone?: string;
    messengerUrl?: string;
    termsAcceptedCGU?: boolean;
    // Données d'enrichissement
    theForkLink?: string;
    uberEatsLink?: string;
    informationsPratiques?: any;
    envieTags?: any;
    // Données d'enrichissement hybride
    hybridAccessibilityDetails?: any;
    hybridDetailedServices?: any;
    hybridClienteleInfo?: any;
    hybridDetailedPayments?: any;
    hybridChildrenServices?: any;
    // Données d'enrichissement
    enrichmentData?: any;
    // Coordonnées GPS
    latitude?: number;
    longitude?: number;
  };
  isEditMode: boolean;
  onEdit: (step: FormStep) => void;
  onInputChange?: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export default function SummaryStepWrapper({
  formData,
  isEditMode,
  onEdit,
  onInputChange,
  errors
}: SummaryStepProps) {
  return (
    <div className="space-y-6">
      <SummaryStep 
        data={{
          establishmentName: formData.establishmentName,
          description: formData.description,
          address: `${formData.address.street}, ${formData.address.postalCode} ${formData.address.city}`,
          activities: formData.activities,
          hours: formData.hours,
          services: formData.services,
          ambiance: formData.ambiance,
          paymentMethods: formData.paymentMethods ? convertPaymentMethodsObjectToArray(formData.paymentMethods) : [],
          tags: formData.tags,
          photos: [],
          phone: formData.phone || '',
          email: formData.email || '',
          whatsappPhone: formData.whatsappPhone,
          messengerUrl: formData.messengerUrl,
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          accountFirstName: formData.accountFirstName,
          accountLastName: formData.accountLastName,
          professionalPhone: formData.accountPhone,
          professionalEmail: formData.accountEmail,
          // Nouvelles données SIRET enrichies
          siret: formData.siret,
          companyName: formData.companyName,
          legalStatus: formData.legalStatus,
          siretAddress: formData.siretAddress,
          siretActivity: formData.siretActivity,
          siretCreationDate: formData.siretCreationDate,
          siretEffectifs: formData.siretEffectifs,
          // Données d'enrichissement
          theForkLink: formData.theForkLink,
          uberEatsLink: formData.uberEatsLink,
          informationsPratiques: formData.informationsPratiques,
          envieTags: formData.envieTags,
          smartEnrichmentData: formData.enrichmentData,
          // Données d'enrichissement manuel
          hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
          hybridDetailedServices: formData.hybridDetailedServices,
          hybridClienteleInfo: formData.hybridClienteleInfo,
          hybridDetailedPayments: formData.hybridDetailedPayments,
          hybridChildrenServices: formData.hybridChildrenServices
        }}
        onEdit={(step) => {
          onEdit(step as FormStep);
        }}
      />
      
      {/* Conditions d'utilisation (seulement en mode création) */}
      {!isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              id="acceptCGU"
              name="acceptCGU"
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
              checked={formData.termsAcceptedCGU || false}
              onChange={(e) => {
                const newValue = e.target.checked;
                console.log('🔘 Checkbox CGU changée:', newValue);
                onInputChange?.('termsAcceptedCGU', newValue);
              }}
              required 
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              J'accepte les{' '}
              <a href="/conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                Conditions Générales d'Utilisation (CGU)
              </a>
              {' '}de la plateforme{' '}
              <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                et la politique de confidentialité
              </a>
            </span>
          </label>
          {errors?.termsAcceptedCGU && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
              <span>⚠️</span>
              {errors.termsAcceptedCGU}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
