import { Icons } from '@/components/Icons';
import { SiretVerification } from '@/types/establishment-form.types';

interface ProfessionalStepProps {
  formData: {
    siret: string;
    accountFirstName: string;
    accountLastName: string;
    accountEmail: string;
    accountPhone: string;
  };
  errors: Record<string, string>;
  siretVerification: SiretVerification;
  onInputChange: (field: string | number | symbol, value: any) => void;
}

export default function ProfessionalStep({
  formData,
  errors,
  siretVerification,
  onInputChange
}: ProfessionalStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Vérification professionnelle
        </h2>
        <p className="text-gray-600 mt-2">
          Nous devons vérifier votre statut professionnel pour valider votre inscription
        </p>
      </div>
      
      {/* Champ SIRET + indication du statut de vérification */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Numéro SIRET * <Icons.Info />
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.siret}
            onChange={(e) => onInputChange('siret', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.siret ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="14 chiffres (ex: 12345678901234)"
            maxLength={14}
          />
          <div className="absolute right-3 top-3">
            {siretVerification.status === 'loading' && <Icons.Spinner />}
            {siretVerification.status === 'valid' && <Icons.Check />}
            {siretVerification.status === 'invalid' && <Icons.X />}
          </div>
        </div>
        {/* Feedback de vérification */}
        {siretVerification.status === 'valid' && siretVerification.data && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Entreprise vérifiée: {siretVerification.data.denomination}
            </p>
          </div>
        )}
        {errors.siret && <p className="text-red-500 text-sm mt-1">{errors.siret}</p>}
      </div>

      {/* Informations du responsable (pré-remplies depuis l'étape 0) */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Responsable de l'établissement
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Prénom :</span>
            <span className="ml-2 text-gray-900">{formData.accountFirstName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Nom :</span>
            <span className="ml-2 text-gray-900">{formData.accountLastName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email :</span>
            <span className="ml-2 text-gray-900">{formData.accountEmail}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Téléphone :</span>
            <span className="ml-2 text-gray-900">{formData.accountPhone || 'Non renseigné'}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ces informations ont été saisies lors de la création de votre compte.
        </p>
      </div>
    </div>
  );
}
