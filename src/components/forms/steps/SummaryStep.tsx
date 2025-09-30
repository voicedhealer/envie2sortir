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
    accountPhone: string;
    accountEmail: string;
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
          photos: [], // Les photos sont maintenant ajoutées sur la page pro
          phone: formData.phone || '',
          email: formData.email || '',
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          // Ajout des contacts professionnels pour le résumé
          professionalPhone: formData.accountPhone,
          professionalEmail: formData.accountEmail,
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
