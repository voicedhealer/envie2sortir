import { Icons } from '@/components/Icons';
import { isValidFrenchPhone, getPhoneFieldState, isValidPassword } from '@/lib/establishment-form.utils';
import PhoneVerificationModal from '@/components/forms/PhoneVerificationModal';
import { useEffect, useRef, useState } from 'react';

interface AccountStepProps {
  formData: {
    accountFirstName: string;
    accountLastName: string;
    accountEmail: string;
    accountPassword: string;
    accountPasswordConfirm: string;
    accountPhone: string;
  };
  errors: Record<string, string>;
  phoneVerification: {
    isVerified: boolean;
    isSending: boolean;
    verificationCode: string;
    error: string;
  };
  showPhoneModal: boolean;
  onInputChange: (field: string | number | symbol, value: any) => void;
  onPhoneVerificationSuccess: () => void;
  onClosePhoneModal: () => void;
  onSetShowPhoneModal: (show: boolean) => void;
}

export default function AccountStep({
  formData,
  errors,
  phoneVerification,
  showPhoneModal,
  onInputChange,
  onPhoneVerificationSuccess,
  onClosePhoneModal,
  onSetShowPhoneModal
}: AccountStepProps) {
  // Déterminer l'état visuel du champ téléphone
  const phoneState = getPhoneFieldState(formData.accountPhone || '', phoneVerification.isVerified);
  const autoValidationTriggered = useRef(false);
  
  // État pour la validation du mot de passe en temps réel
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: false, errors: [] });
  
  // État pour la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // Auto-validation du téléphone quand il devient valide
  useEffect(() => {
    if (phoneState.state === 'valid' && !phoneVerification.isVerified && !phoneVerification.isSending && !autoValidationTriggered.current) {
      autoValidationTriggered.current = true;
      console.log('📱 Auto-validation du téléphone déclenchée:', formData.accountPhone);
      onInputChange('autoVerifyPhone', true);
    } else if (phoneState.state !== 'valid') {
      autoValidationTriggered.current = false;
    }
  }, [phoneState.state, phoneVerification.isVerified, phoneVerification.isSending, formData.accountPhone, onInputChange]);

  // Validation du mot de passe en temps réel
  useEffect(() => {
    if (formData.accountPassword) {
      const validation = isValidPassword(formData.accountPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [formData.accountPassword]);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Création de votre compte PRO
        </h2>
        <p className="text-gray-600 mt-2">
          Créez votre compte professionnel pour gérer votre établissement
        </p>
      </div>
      
      {/* Prénom et Nom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.accountFirstName}
            onChange={(e) => onInputChange('accountFirstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Votre prénom"
          />
          {errors.accountFirstName && (
            <p className="text-red-500 text-sm mt-1">{errors.accountFirstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={formData.accountLastName}
            onChange={(e) => onInputChange('accountLastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Votre nom"
          />
          {errors.accountLastName && (
            <p className="text-red-500 text-sm mt-1">{errors.accountLastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email professionnel * <span className="text-xs text-gray-500 ml-1">(email qui sera utilisé pour la connexion)</span>
        </label>
        <input
          type="email"
          value={formData.accountEmail}
          onChange={(e) => onInputChange('accountEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="votre.email@exemple.com"
        />
        {errors.accountEmail && (
          <p className="text-red-500 text-sm mt-1">{errors.accountEmail}</p>
        )}
      </div>

      {/* Téléphone professionnel - OBLIGATOIRE pour vérification Twilio */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Téléphone professionnel * 
          <span className="text-xs text-gray-500 ml-1">(pour vérification Twilio)</span>
          {phoneState.state === 'invalid' && (
            <span className="text-xs text-red-500 ml-2 font-semibold">
              ⚠️ Validation requise
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="tel"
            value={formData.accountPhone || ''}
            disabled={phoneState.disabled}
            onChange={(e) => {
              const phone = e.target.value;
              onInputChange('accountPhone', phone);
              
              // Si le numéro change et qu'il était précédemment vérifié, 
              // on doit notifier le parent pour reset l'état de vérification
              if (phoneVerification.isVerified && phone !== formData.accountPhone) {
                onInputChange('resetPhoneVerification', true);
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${phoneState.className} ${
              phoneState.disabled ? 'cursor-not-allowed opacity-75' : ''
            }`}
            placeholder="06 12 34 56 78 (mobile uniquement)"
          />
          {phoneState.state === 'verified' && (
            <div className="absolute right-3 top-3">
              <Icons.Check />
            </div>
          )}
        </div>
        {errors.accountPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.accountPhone}</p>
        )}
        {phoneState.state === 'verified' ? (
          <p className="text-xs text-green-600 mt-1 flex items-center">
            {phoneState.message}
          </p>
        ) : phoneState.state === 'valid' ? (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800 flex items-center">
                <span className="mr-2">📱</span>
                <span className="font-medium">{phoneState.message}</span>
              </p>
              {!phoneVerification.isVerified && (
                <button
                  type="button"
                  onClick={() => onInputChange('autoVerifyPhone', true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  Envoyer le SMS
                </button>
              )}
            </div>
          </div>
        ) : phoneState.state === 'invalid' ? (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              <span className="mr-2">⚠️</span>
              <span className="font-medium">{phoneState.message}</span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            {phoneState.message}
          </p>
        )}
        {errors.phoneVerification && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            ⚠️ {errors.phoneVerification}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Mot de passe *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.accountPassword}
            onChange={(e) => onInputChange('accountPassword', e.target.value)}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              formData.accountPassword 
                ? passwordValidation.isValid 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder="Ex: MonMotDePasse123!"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
          </button>
        </div>
        
        {/* Critères de sécurité en temps réel */}
        {formData.accountPassword && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Critères de sécurité :</p>
            <div className="space-y-1">
              <div className={`flex items-center text-xs ${formData.accountPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{formData.accountPassword.length >= 8 ? '✓' : '✗'}</span>
                Au moins 8 caractères
              </div>
              <div className={`flex items-center text-xs ${(formData.accountPassword.match(/\d/g) || []).length >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{(formData.accountPassword.match(/\d/g) || []).length >= 2 ? '✓' : '✗'}</span>
                Au moins 2 chiffres
              </div>
              <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.accountPassword) ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{/[A-Z]/.test(formData.accountPassword) ? '✓' : '✗'}</span>
                Au moins une majuscule
              </div>
              <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.accountPassword) ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.accountPassword) ? '✓' : '✗'}</span>
                Au moins un caractère spécial
              </div>
            </div>
          </div>
        )}
        
        {errors.accountPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.accountPassword}</p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Confirmer le mot de passe *
        </label>
        <div className="relative">
          <input
            type={showPasswordConfirm ? "text" : "password"}
            value={formData.accountPasswordConfirm}
            onChange={(e) => onInputChange('accountPasswordConfirm', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Répétez votre mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPasswordConfirm ? <Icons.EyeOff /> : <Icons.Eye />}
          </button>
        </div>
        {errors.accountPasswordConfirm && (
          <p className="text-red-500 text-sm mt-1">{errors.accountPasswordConfirm}</p>
        )}
      </div>

      {/* Modal de vérification téléphone */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={onClosePhoneModal}
        phoneNumber={formData.accountPhone || ''}
        onVerificationSuccess={onPhoneVerificationSuccess}
      />
    </div>
  );
}
