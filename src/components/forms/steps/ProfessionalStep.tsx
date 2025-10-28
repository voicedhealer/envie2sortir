import { Icons } from '@/components/Icons';
import { SiretVerification } from '@/types/establishment-form.types';
import { useState, useEffect } from 'react';
import { useSiretVerification } from '@/hooks/useSiretVerification';

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
  const [siretExistsCheck, setSiretExistsCheck] = useState<{
    checking: boolean;
    exists: boolean;
    message: string;
    companyName?: string;
    emailHint?: string;
  }>({
    checking: false,
    exists: false,
    message: ''
  });

  // Hook pour la vérification INSEE
  const { 
    isLoading: inseeLoading, 
    error: inseeError, 
    verificationResult: inseeResult, 
    verifySiret: verifySiretInsee,
    clearError: clearInseeError 
  } = useSiretVerification();

  // Vérifier si le SIRET existe déjà dans la base de données ET vérifier avec l'INSEE
  useEffect(() => {
    const checkSiretExists = async () => {
      const cleanedSiret = formData.siret.replace(/\s/g, '');
      
      // Ne vérifier que si le SIRET a 14 chiffres
      if (cleanedSiret.length !== 14 || !/^\d+$/.test(cleanedSiret)) {
        setSiretExistsCheck({
          checking: false,
          exists: false,
          message: ''
        });
        clearInseeError();
        return;
      }

      setSiretExistsCheck({ checking: true, exists: false, message: '' });

      try {
        // Vérifier si le SIRET existe déjà dans notre base
        const response = await fetch('/api/check-siret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siret: cleanedSiret })
        });

        const data = await response.json();

        if (data.exists) {
          setSiretExistsCheck({
            checking: false,
            exists: true,
            message: data.message,
            companyName: data.companyName,
            emailHint: data.emailHint
          });
        } else {
          setSiretExistsCheck({
            checking: false,
            exists: false,
            message: data.message
          });

          // Si le SIRET n'existe pas dans notre base, vérifier avec l'INSEE
          await verifySiretInsee(cleanedSiret);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du SIRET:', error);
        setSiretExistsCheck({
          checking: false,
          exists: false,
          message: ''
        });
      }
    };

    // Debounce de 500ms pour éviter trop de requêtes
    const timer = setTimeout(checkSiretExists, 500);
    return () => clearTimeout(timer);
  }, [formData.siret, verifySiretInsee, clearInseeError]);

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
              errors.siret || siretExistsCheck.exists ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="14 chiffres (ex: 12345678901234)"
            maxLength={14}
          />
          <div className="absolute right-3 top-3">
            {(siretVerification.status === 'loading' || siretExistsCheck.checking || inseeLoading) && <Icons.Spinner />}
            {(siretVerification.status === 'valid' || (inseeResult?.isValid && !siretExistsCheck.exists)) && <Icons.Check />}
            {(siretVerification.status === 'invalid' || siretExistsCheck.exists || (inseeError && !inseeLoading)) && <Icons.X />}
          </div>
        </div>
        
        {/* ⚠️ SIRET déjà enregistré */}
        {siretExistsCheck.exists && (
          <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-800 mb-2">
              ⚠️ Ce SIRET est déjà enregistré
            </p>
            {siretExistsCheck.companyName && (
              <p className="text-sm text-red-700 mb-1">
                <strong>Entreprise :</strong> {siretExistsCheck.companyName}
              </p>
            )}
            {siretExistsCheck.emailHint && (
              <p className="text-sm text-red-700 mb-2">
                <strong>Email :</strong> {siretExistsCheck.emailHint}
              </p>
            )}
            <p className="text-sm text-red-700">
              Si vous êtes le propriétaire, veuillez{' '}
              <a href="/auth" className="font-semibold underline hover:text-red-900">
                vous connecter à votre compte existant
              </a>.
            </p>
          </div>
        )}
        
        {/* ✓ Entreprise vérifiée (ancien système) */}
        {siretVerification.status === 'valid' && siretVerification.data && !siretExistsCheck.exists && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Entreprise vérifiée: {siretVerification.data.denomination}
            </p>
          </div>
        )}

        {/* ✓ Entreprise vérifiée par l'INSEE */}
        {inseeResult?.isValid && inseeResult.data && !siretExistsCheck.exists && (
          <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-green-600 text-lg">✓</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 mb-2">
                  Entreprise vérifiée par l'INSEE
                </p>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Raison sociale :</strong> {inseeResult.data.companyName}</p>
                  <p><strong>Statut juridique :</strong> {inseeResult.data.legalStatusLabel}</p>
                  <p><strong>Adresse :</strong> {inseeResult.data.address}</p>
                  {inseeResult.data.activityLabel && (
                    <p><strong>Activité :</strong> {inseeResult.data.activityLabel}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Pré-remplir les champs avec les données INSEE
                    if (inseeResult.data) {
                      onInputChange('companyName', inseeResult.data.companyName);
                      onInputChange('legalStatus', inseeResult.data.legalStatus);
                    }
                  }}
                  className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Utiliser ces informations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ❌ Erreur de vérification INSEE */}
        {inseeError && !inseeLoading && !siretExistsCheck.exists && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ {inseeError}
            </p>
          </div>
        )}
        
        {/* ✓ SIRET disponible */}
        {siretExistsCheck.message && !siretExistsCheck.exists && formData.siret.length === 14 && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✓ {siretExistsCheck.message}
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
