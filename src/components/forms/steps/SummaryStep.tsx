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
}

export default function SummaryStepWrapper({
  formData,
  isEditMode,
  onEdit
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
          accountFirstName: formData.accountFirstName,
          accountLastName: formData.accountLastName,
          professionalPhone: formData.accountPhone,
          professionalEmail: formData.accountEmail,
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
        <div className="text-sm text-gray-600">
          <label className="flex items-start space-x-2">
            <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" required />
            <span>
              J'accepte les{' '}
              <a href="/conditions" className="text-blue-600 underline">
                conditions générales d'utilisation
              </a>
              {' '}et la{' '}
              <a href="/politique-confidentialite" className="text-blue-600 underline">
                politique de confidentialité
              </a>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
