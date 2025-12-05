"use client";

import { useState, useEffect } from 'react';
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
import ProfessionalWelcomeModal from '@/components/ProfessionalWelcomeModal';
import HelpModal from '@/components/HelpModal';

export default function ProfessionalRegistrationForm({ establishment, isEditMode = false }: EstablishmentFormProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Détecter la première visite de l'espace professionnel
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window !== 'undefined') {
      const hasSeenWelcome = localStorage.getItem('professional-welcome-seen');
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // Vérifier que nous sommes côté client
    if (typeof window !== 'undefined') {
      localStorage.setItem('professional-welcome-seen', 'true');
    }
  };

  const handleShowHelpModal = () => {
    setShowHelpModal(true);
  };

  const handleCloseHelpModal = () => {
    setShowHelpModal(false);
  };

  const {
    // États
    currentStep,
    formData,
    errors,
    isSubmitting,
    submitError,
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
    setCurrentStep,
    submitProgress
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
              accountPhone: formData.accountPhone,
              // Nouvelles données SIRET enrichies
              companyName: formData.companyName,
              legalStatus: formData.legalStatus,
              siretAddress: formData.siretAddress,
              siretActivity: formData.siretActivity,
              siretCreationDate: formData.siretCreationDate,
              siretEffectifs: formData.siretEffectifs
            }}
            errors={errors}
            siretVerification={siretVerification}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

      // === Étape 2 : Enrichissement Google Maps ===
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
              informationsPratiques: formData.informationsPratiques,
              paymentMethods: formData.paymentMethods,
              hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
              hybridDetailedServices: formData.hybridDetailedServices,
              hybridClienteleInfo: formData.hybridClienteleInfo,
              hybridDetailedPayments: formData.hybridDetailedPayments,
              hybridChildrenServices: formData.hybridChildrenServices,
              hybridParkingInfo: formData.hybridParkingInfo
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
      // ❌ En mode édition, cette étape est sautée (ne pas afficher)
      case 6:
        if (isEditMode) {
          // Si on arrive ici en mode édition, rediriger vers l'étape suivante
          // (normalement cela ne devrait pas arriver grâce à nextStep/prevStep)
          return null;
        }
        return (
          <SubscriptionStep
            formData={{
              subscriptionPlan: formData.subscriptionPlan,
              subscriptionPlanType: formData.subscriptionPlanType,
              termsAcceptedCGV: formData.termsAcceptedCGV
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
        // Log pour déboguer les données passées au récapitulatif
        console.log('📋 [establishment-form] Données passées au récapitulatif:', JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          whatsappPhone: formData.whatsappPhone,
          messengerUrl: formData.messengerUrl,
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          accountFirstName: formData.accountFirstName,
          accountLastName: formData.accountLastName,
          accountEmail: formData.accountEmail,
          accountPhone: formData.accountPhone
        }, null, 2));
        
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
              whatsappPhone: formData.whatsappPhone,
              messengerUrl: formData.messengerUrl,
              website: formData.website,
              instagram: formData.instagram,
              facebook: formData.facebook,
              tiktok: formData.tiktok,
              youtube: formData.youtube,
              accountFirstName: formData.accountFirstName,
              accountLastName: formData.accountLastName,
              accountPhone: formData.accountPhone,
              accountEmail: formData.accountEmail,
              // ✅ Ajouter les données professionnelles pour l'affichage
              professionalEmail: formData.accountEmail || formData.email,
              professionalPhone: formData.accountPhone || formData.phone,
              // Nouvelles données SIRET enrichies
              siret: formData.siret,
              companyName: formData.companyName,
              legalStatus: formData.legalStatus,
              siretAddress: formData.siretAddress,
              siretActivity: formData.siretActivity,
              siretCreationDate: formData.siretCreationDate,
              siretEffectifs: formData.siretEffectifs,
              termsAcceptedCGU: formData.termsAcceptedCGU,
              // Données d'enrichissement
              enrichmentData: enrichmentData,
              theForkLink: formData.theForkLink,
              uberEatsLink: formData.uberEatsLink,
              informationsPratiques: formData.informationsPratiques,
              envieTags: formData.envieTags,
              // Données d'enrichissement manuel
              hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
              hybridDetailedServices: formData.hybridDetailedServices,
              hybridClienteleInfo: formData.hybridClienteleInfo,
              hybridDetailedPayments: formData.hybridDetailedPayments,
              hybridChildrenServices: formData.hybridChildrenServices,
              // Coordonnées GPS
              latitude: formData.address?.latitude,
              longitude: formData.address?.longitude
            }}
            isEditMode={isEditMode}
            onEdit={(step) => {
              setCurrentStep(step as FormStep);
            }}
            onInputChange={handleInputChange}
            errors={errors}
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

      {/* Message d'erreur global */}
      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors de la soumission
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {submitError}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8" data-testid="establishment-form">
        {/* Bouton d'aide flottant - sera positionné en bas à droite */}

        <div data-testid={`form-step-${currentStep}`}>
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            data-testid="form-button-previous"
            onClick={prevStep}
            // En mode édition, permettre de revenir jusqu'à l'étape 2 (Enrichissement)
            // mais pas avant (étapes 0 et 1 non nécessaires en édition)
            disabled={isEditMode ? currentStep < 2 : currentStep === 0}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              data-testid="form-button-next"
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
              disabled={
                (currentStep === 0 && !phoneVerification.isVerified) ||
                (currentStep === 6 && !isEditMode && !formData.termsAcceptedCGV)
              }
              className={`px-6 py-2 rounded-lg transition-all ${
                (currentStep === 0 && !phoneVerification.isVerified) ||
                (currentStep === 6 && !isEditMode && !formData.termsAcceptedCGV)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === 0 && !phoneVerification.isVerified 
                ? 'Validez votre téléphone' 
                : currentStep === 6 && !isEditMode && !formData.termsAcceptedCGV
                ? 'Acceptez les CGV pour continuer'
                : 'Suivant'}
            </button>
          ) : currentStep === 8 ? (
            <button
              type="button"
              data-testid="form-button-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || (!isEditMode && !formData.termsAcceptedCGU)}
              className={`px-6 py-2 rounded-lg transition-all ${
                isSubmitting || (!isEditMode && !formData.termsAcceptedCGU)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting 
                ? (submitProgress || (isEditMode ? 'Modification en cours...' : 'Création en cours...'))
                : !isEditMode && !formData.termsAcceptedCGU
                ? 'Acceptez les CGU pour finaliser'
                : (isEditMode ? "Sauvegarder les modifications" : "Créer l'établissement")
              }
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (submitProgress || (isEditMode ? 'Modification en cours...' : 'Inscription en cours...'))
                : (isEditMode ? 'Sauvegarder les modifications' : 'Finaliser l\'inscription')
              }
            </button>
          )}
        </div>
      </div>

      {/* Modal de bienvenue */}
      <ProfessionalWelcomeModal 
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />

      {/* Modal d'aide */}
      <HelpModal 
        isOpen={showHelpModal}
        onClose={handleCloseHelpModal}
        currentStep={currentStep}
      />

      {/* Bouton d'aide flottant */}
      <img
        src="/Perso_aide.png"
        alt="Besoin d'aide ?"
        onClick={handleShowHelpModal}
        className="floating-help-button"
        style={{
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
