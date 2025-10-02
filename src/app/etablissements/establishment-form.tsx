"use client";

import { useEstablishmentForm } from '@/hooks/useEstablishmentForm';
import { EstablishmentFormProps, FormStep } from '@/types/establishment-form.types';
import { convertPaymentMethodsObjectToArray } from '@/lib/establishment-form.utils';
import AccountStep from '@/components/forms/steps/AccountStep';
import ProfessionalStep from '@/components/forms/steps/ProfessionalStep';
import EnrichmentStepWrapper from '@/components/forms/steps/EnrichmentStep';
import EstablishmentStep from '@/components/forms/steps/EstablishmentStep';
import ServicesStep from '@/components/forms/steps/ServicesStep';
import TagsStep from '@/components/forms/steps/TagsStep';
import SubscriptionStep from '@/components/forms/steps/SubscriptionStep';
import SocialStep from '@/components/forms/steps/SocialStep';
import SummaryStepWrapper from '@/components/forms/steps/SummaryStep';

export default function ProfessionalRegistrationForm({ establishment, isEditMode = false }: EstablishmentFormProps) {
  const {
    // États
    currentStep,
    formData,
    errors,
    isSubmitting,
    phoneVerification,
    showPhoneModal,
    enrichmentData,
    siretVerification,
    
    // Actions
    handleInputChange,
    handleAddressValidation,
    handlePhoneVerificationSuccess,
    handleClosePhoneModal,
    handleEnrichmentComplete,
    handleTagsChange,
    handleEnvieTagsGenerated,
    validateStep,
    nextStep,
    prevStep,
    handleSubmit,
    handleEnrichmentDataChange,
    setShowPhoneModal,
    setCurrentStep
  } = useEstablishmentForm({ establishment, isEditMode });

  /**
   * Composant de rendu dynamique pour chaque étape du formulaire professionnel.
   * Affiche le contenu correspondant à l'étape courante, gère la validation front, 
   * et permet d'adapter facilement les contenus pour chaque logique métier.
   */
  const renderStep = () => {
    switch (currentStep) {
      // === Étape 0 : Création de compte ===
      case 0:
        return (
          <AccountStep
            formData={{
              accountFirstName: formData.accountFirstName,
              accountLastName: formData.accountLastName,
              accountEmail: formData.accountEmail,
              accountPassword: formData.accountPassword,
              accountPasswordConfirm: formData.accountPasswordConfirm,
              accountPhone: formData.accountPhone
            }}
            errors={errors}
            phoneVerification={phoneVerification}
            showPhoneModal={showPhoneModal}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
            onPhoneVerificationSuccess={handlePhoneVerificationSuccess}
            onClosePhoneModal={handleClosePhoneModal}
            onSetShowPhoneModal={setShowPhoneModal}
          />
        );

      // === Étape 1 : Informations professionnelles et vérification SIRET ===
      case 1:
        return (
          <ProfessionalStep
            formData={{
              siret: formData.siret,
              accountFirstName: formData.accountFirstName,
              accountLastName: formData.accountLastName,
              accountEmail: formData.accountEmail,
              accountPhone: formData.accountPhone
            }}
            errors={errors}
            siretVerification={siretVerification}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

      // === Étape 2 : Informations de l'établissement ===
      case 2:
        return (
          <EnrichmentStepWrapper
            onEnrichmentComplete={handleEnrichmentComplete}
            onSkip={() => {
              console.log('Enrichissement ignoré par l\'utilisateur');
              nextStep();
            }}
            onEnrichmentDataChange={handleEnrichmentDataChange}
          />
        );

      // === Étape 3 : Informations sur l'établissement ===
      case 3:
        return (
          <EstablishmentStep
            formData={{
              establishmentName: formData.establishmentName,
              description: formData.description,
              address: formData.address,
              hours: formData.hours,
              activities: formData.activities,
              phone: formData.phone,
              whatsappPhone: formData.whatsappPhone,
              messengerUrl: formData.messengerUrl,
              email: formData.email
            }}
            errors={errors}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
            onAddressValidationChange={handleAddressValidation}
          />
        );

      // === Étape 4 : Services & Ambiances Dynamiques ===
      case 4:
        return (
          <ServicesStep
            formData={{
              services: formData.services,
              ambiance: formData.ambiance,
              hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
              hybridDetailedServices: formData.hybridDetailedServices,
              hybridClienteleInfo: formData.hybridClienteleInfo,
              hybridDetailedPayments: formData.hybridDetailedPayments,
              hybridChildrenServices: formData.hybridChildrenServices
            }}
            isEditMode={isEditMode}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

      // === Étape 5 : Tags & Mots-clés ===
      case 5:
        return (
          <TagsStep
            formData={{
              tags: formData.tags,
              activities: formData.activities
            }}
            errors={errors}
            onTagsChange={handleTagsChange}
            onEnvieTagsGenerated={handleEnvieTagsGenerated}
          />
        );

      // === Étape 6 : Sélection de l'abonnement ===
      case 6:
        return (
          <SubscriptionStep
            formData={{
              subscriptionPlan: formData.subscriptionPlan
            }}
            errors={errors}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

      // === Étape 7 : Réseaux sociaux (mode création et édition) ===
      case 7:
        return (
          <SocialStep
            formData={{
              website: formData.website,
              instagram: formData.instagram,
              facebook: formData.facebook,
              tiktok: formData.tiktok,
              youtube: formData.youtube,
              priceMin: formData.priceMin,
              priceMax: formData.priceMax
            }}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

      // === Étape 8 : Récapitulatif final ===
      case 8:
        return (
          <SummaryStepWrapper
            formData={{
              establishmentName: formData.establishmentName,
              description: formData.description,
              address: formData.address,
              activities: formData.activities,
              hours: formData.hours,
              services: formData.services,
              ambiance: formData.ambiance,
              paymentMethods: convertPaymentMethodsObjectToArray(formData.paymentMethods),
              tags: formData.tags,
              phone: formData.phone,
              email: formData.email,
              website: formData.website,
              instagram: formData.instagram,
              facebook: formData.facebook,
              tiktok: formData.tiktok,
              youtube: formData.youtube,
              accountPhone: formData.accountPhone,
              accountEmail: formData.accountEmail,
              // Données d'enrichissement
              theForkLink: formData.theForkLink,
              uberEatsLink: formData.uberEatsLink,
              informationsPratiques: formData.informationsPratiques,
              envieTags: formData.envieTags,
              // Données d'enrichissement hybride
              hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
              hybridDetailedServices: formData.hybridDetailedServices,
              hybridClienteleInfo: formData.hybridClienteleInfo,
              hybridDetailedPayments: formData.hybridDetailedPayments,
              hybridChildrenServices: formData.hybridChildrenServices
            }}
            isEditMode={isEditMode}
            onEdit={(step) => {
              setCurrentStep(step as FormStep);
            }}
          />
        );

      // Sécurité fallback si étape inconnue
      default:
        return <div>Erreur technique : étape inconnue.</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => {
            const stepIndex = stepNumber - 1; // Convertir 1-9 en 0-8
            const isActive = stepNumber === currentStep; // Étape actuelle
            const isCompleted = stepNumber < currentStep; // Étapes complétées
            return (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  isActive || isCompleted
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={isEditMode ? currentStep === 2 : currentStep === 0}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => {
                // Si on est à l'étape 2 (enrichissement) et qu'on a des données enrichies,
                // les transmettre avant de passer à l'étape suivante
                if (currentStep === 2 && enrichmentData && enrichmentData.name) {
                  console.log('🔄 Transmission des données d\'enrichissement via bouton Suivant');
                  handleEnrichmentComplete(enrichmentData);
                } else {
                  nextStep();
                }
              }}
              disabled={currentStep === 0 && !phoneVerification.isVerified}
              className={`px-6 py-2 rounded-lg transition-all ${
                currentStep === 0 && !phoneVerification.isVerified
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === 0 && !phoneVerification.isVerified ? 'Validez votre téléphone' : 'Suivant'}
            </button>
          ) : currentStep === 8 ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {isEditMode ? "Sauvegarder les modifications" : "Créer l'établissement"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (isEditMode ? 'Modification en cours...' : 'Inscription en cours...') 
                : (isEditMode ? 'Sauvegarder les modifications' : 'Finaliser l\'inscription')
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
