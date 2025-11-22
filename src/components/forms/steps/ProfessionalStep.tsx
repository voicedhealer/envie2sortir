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
    // Nouvelles données SIRET enrichies
    companyName: string;
    legalStatus: string;
    siretAddress: string;
    siretActivity: string;
    siretCreationDate: string;
    siretEffectifs: string;
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

  // État pour afficher le formulaire SIRET enrichi
  const [showSiretForm, setShowSiretForm] = useState(false);
  const [siretDataUsed, setSiretDataUsed] = useState(false);

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
            data-testid="form-siret"
            value={formData.siret}
            onChange={(e) => {
              // Nettoyer automatiquement les espaces lors de la saisie
              const cleanedValue = e.target.value.replace(/\s/g, '');
              onInputChange('siret', cleanedValue);
            }}
            onPaste={(e) => {
              // Gérer le copier-coller en nettoyant les espaces
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              const cleanedText = pastedText.replace(/\s/g, '').slice(0, 14);
              onInputChange('siret', cleanedText);
            }}
            className={`w-full px-3 py-2 ${formData.siret ? 'pr-20' : 'pr-12'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.siret || siretExistsCheck.exists ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="14 chiffres (ex: 12345678901234 ou 840 467 682 00018)"
            maxLength={14}
          />
          {/* Bouton pour réinitialiser le SIRET */}
          {formData.siret && (
            <button
              type="button"
              onClick={() => {
                onInputChange('siret', '');
                // Réinitialiser aussi les données INSEE si présentes
                onInputChange('companyName', '');
                onInputChange('legalStatus', '');
                onInputChange('siretAddress', '');
                onInputChange('siretActivity', '');
                onInputChange('siretCreationDate', '');
                onInputChange('siretEffectifs', '');
              }}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
              title="Effacer le SIRET"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
          <div className="absolute right-3 top-3">
            {(siretVerification.status === 'loading' || siretExistsCheck.checking || inseeLoading) && <Icons.Spinner />}
            {(siretVerification.status === 'valid' || (inseeResult?.isValid && !siretExistsCheck.exists)) && <Icons.Check className="text-green-600" />}
            {(siretVerification.status === 'invalid' || siretExistsCheck.exists || (inseeError && !inseeLoading)) && <Icons.X className="text-red-500" />}
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
        

        {/* ✓ Entreprise vérifiée par l'INSEE */}
        {inseeResult?.isValid && inseeResult.data && !siretExistsCheck.exists && !siretDataUsed && (
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
                    <p><strong>Activité :</strong> {inseeResult.data.activityLabel} ({inseeResult.data.activityCode})</p>
                  )}
                  {inseeResult.data.creationDate && (
                    <p><strong>Créée le :</strong> {new Date(inseeResult.data.creationDate).toLocaleDateString('fr-FR')}</p>
                  )}
                  {inseeResult.data.effectifTranche && (
                    <p><strong>Effectifs :</strong> Tranche {inseeResult.data.effectifTranche}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Pré-remplir les champs avec les données INSEE enrichies
                    if (inseeResult.data) {
                      onInputChange('companyName', inseeResult.data.companyName);
                      onInputChange('legalStatus', inseeResult.data.legalStatusLabel);
                      onInputChange('siretAddress', inseeResult.data.address);
                      onInputChange('siretActivity', inseeResult.data.activityLabel);
                      onInputChange('siretCreationDate', inseeResult.data.creationDate);
                      onInputChange('siretEffectifs', inseeResult.data.effectifTranche || '');
                    }
                    // Afficher le formulaire SIRET et masquer l'encadré vert
                    setShowSiretForm(true);
                    setSiretDataUsed(true);
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

        {/* Message de confirmation après utilisation des données INSEE */}
        {siretDataUsed && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 text-lg">✓</span>
              <p className="text-sm text-blue-800">
                Données INSEE utilisées. Veuillez vérifier et compléter le formulaire ci-dessous.
              </p>
            </div>
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

      {/* Formulaire SIRET enrichi */}
      {showSiretForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Informations de l'entreprise
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numéro SIRET */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro SIRET *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => {
                    // Nettoyer automatiquement les espaces lors de la saisie
                    const cleanedValue = e.target.value.replace(/\s/g, '');
                    onInputChange('siret', cleanedValue);
                  }}
                  onPaste={(e) => {
                    // Gérer le copier-coller en nettoyant les espaces
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    const cleanedText = pastedText.replace(/\s/g, '').slice(0, 14);
                    onInputChange('siret', cleanedText);
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  maxLength={14}
                  placeholder="14 chiffres (ex: 840 467 682 00018)"
                />
                {formData.siret && (
                  <button
                    type="button"
                    onClick={() => {
                      onInputChange('siret', '');
                      // Réinitialiser les données INSEE
                      onInputChange('companyName', '');
                      onInputChange('legalStatus', '');
                      onInputChange('siretAddress', '');
                      onInputChange('siretActivity', '');
                      onInputChange('siretCreationDate', '');
                      onInputChange('siretEffectifs', '');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                    title="Effacer le SIRET"
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Numéro SIRET vérifié par l'INSEE</p>
            </div>

            {/* Raison sociale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison sociale *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => onInputChange('companyName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom de l'entreprise"
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

                   {/* Forme juridique */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Forme juridique *
                     </label>
                     <input
                       type="text"
                       value={formData.legalStatus}
                       onChange={(e) => onInputChange('legalStatus', e.target.value)}
                       className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                         errors.legalStatus ? 'border-red-500' : 'border-gray-300'
                       }`}
                       placeholder="Ex: SARL, SAS, Auto-entrepreneur..."
                     />
                     {errors.legalStatus && <p className="text-red-500 text-sm mt-1">{errors.legalStatus}</p>}
                     {!formData.legalStatus && (
                       <p className="text-orange-600 text-xs mt-1">
                         ℹ️ Si la forme juridique n'a pas été trouvée automatiquement, veuillez la renseigner manuellement
                       </p>
                     )}
                   </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={formData.siretAddress}
                onChange={(e) => onInputChange('siretAddress', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.siretAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adresse complète de l'entreprise"
              />
              {errors.siretAddress && <p className="text-red-500 text-sm mt-1">{errors.siretAddress}</p>}
            </div>

            {/* Activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activité *
              </label>
              <input
                type="text"
                value={formData.siretActivity}
                onChange={(e) => onInputChange('siretActivity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.siretActivity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Activité principale de l'entreprise"
              />
              {errors.siretActivity && <p className="text-red-500 text-sm mt-1">{errors.siretActivity}</p>}
            </div>

            {/* Date de création */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de création *
              </label>
              <input
                type="date"
                value={formData.siretCreationDate}
                onChange={(e) => onInputChange('siretCreationDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.siretCreationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.siretCreationDate && <p className="text-red-500 text-sm mt-1">{errors.siretCreationDate}</p>}
            </div>

            {/* Effectifs (optionnel) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effectifs (optionnel)*
              </label>
              <input
                type="text"
                value={formData.siretEffectifs}
                onChange={(e) => onInputChange('siretEffectifs', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Tranche 42, 10-20 salariés..."
              />
              <p className="text-xs text-gray-500 mt-1">*Information optionnelle sur les effectifs</p>
            </div>
          </div>

          {/* Message de confirmation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <p className="text-sm text-blue-800">
                Veuillez vérifier et compléter les informations ci-dessus avant de continuer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
