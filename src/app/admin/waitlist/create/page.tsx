"use client";

import { useState, useEffect } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { useEstablishmentForm } from '@/hooks/useEstablishmentForm';
import { FormStep } from '@/types/establishment-form.types';
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
import { Loader2, ArrowLeft, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function AdminWaitlistCreatePage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProfessionalId, setCreatedProfessionalId] = useState<string | null>(null);

  // Tous les hooks doivent être appelés avant les conditions de retour
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    submitError,
    phoneVerification,
    showPhoneModal,
    enrichmentData,
    siretVerification,
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
    handleEnrichmentDataChange,
    setShowPhoneModal,
    setCurrentStep,
    submitProgress
  } = useEstablishmentForm({ establishment: null, isEditMode: false });

  // Redirection si pas admin (dans useEffect pour éviter l'erreur de rendu)
  useEffect(() => {
    if (!loading && (!session || session.user?.role !== 'admin')) {
      router.push('/auth?error=AccessDenied');
    }
  }, [session, loading, router]);

  // Vérifier l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  // Fonction de soumission personnalisée pour la waitlist
  const handleWaitlistSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const formDataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'photos') {
        if (Array.isArray(value)) {
          (value as File[]).forEach((photo, index) => {
            formDataToSend.append(`photo_${index}`, photo);
          });
        }
      } else if (key === 'hours') {
        formDataToSend.append(key, JSON.stringify(value));
      } else if (key === 'address') {
        const addressData = value as any;
        const fullAddress = `${addressData.street}, ${addressData.postalCode} ${addressData.city}`;
        formDataToSend.append('address', fullAddress);
        
        if (addressData.latitude !== undefined) {
          formDataToSend.append('latitude', addressData.latitude.toString());
        }
        if (addressData.longitude !== undefined) {
          formDataToSend.append('longitude', addressData.longitude.toString());
        }
      } else if (key.startsWith('hybrid') && typeof value === 'object' && value !== null) {
        formDataToSend.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        formDataToSend.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formDataToSend.append(key, value.toString());
      }
    });

    // Ajouter le flag waitlist
    formDataToSend.append('waitlist', 'true');
    
    // Ajouter le flag de vérification SMS
    if (phoneVerification.isVerified) {
      formDataToSend.append('smsVerified', 'true');
    }

    try {
      const response = await fetch('/api/admin/waitlist/create-full', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      // ✅ NOUVEAU : Si un plan premium est choisi et qu'une URL Stripe est retournée, rediriger
      if (result.checkoutUrl && result.chosenPlan === 'premium') {
        console.log('💳 [Waitlist Create] Redirection vers Stripe Checkout:', result.checkoutUrl);
        // Rediriger vers Stripe pour collecter la méthode de paiement
        window.location.href = result.checkoutUrl;
        return; // Ne pas afficher le message de succès, la redirection va se faire
      }

      setCreatedProfessionalId(result.professionalId);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Erreur création waitlist:', error);
      alert(error.message || 'Erreur lors de la création');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
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

      case 1:
        return (
          <ProfessionalStep
            formData={{
              siret: formData.siret,
              accountFirstName: formData.accountFirstName,
              accountLastName: formData.accountLastName,
              accountEmail: formData.accountEmail,
              accountPhone: formData.accountPhone,
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

      case 2:
        return (
          <EnrichmentStepWrapper
            onEnrichmentComplete={handleEnrichmentComplete}
            onSkip={() => nextStep()}
            onEnrichmentDataChange={handleEnrichmentDataChange}
          />
        );

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
            isEditMode={false}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

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

      case 6:
        return (
          <SubscriptionStep
            formData={{
              subscriptionPlan: formData.subscriptionPlan,
              subscriptionPlanType: formData.subscriptionPlanType
            }}
            errors={errors}
            onInputChange={(field: string | number | symbol, value: any) => handleInputChange(field as string, value)}
          />
        );

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
              accountFirstName: formData.accountFirstName,
              accountLastName: formData.accountLastName,
              accountPhone: formData.accountPhone,
              accountEmail: formData.accountEmail,
              siret: formData.siret,
              companyName: formData.companyName,
              legalStatus: formData.legalStatus,
              siretAddress: formData.siretAddress,
              siretActivity: formData.siretActivity,
              siretCreationDate: formData.siretCreationDate,
              siretEffectifs: formData.siretEffectifs,
              termsAccepted: formData.termsAccepted,
              enrichmentData: enrichmentData,
              theForkLink: formData.theForkLink,
              uberEatsLink: formData.uberEatsLink,
              informationsPratiques: formData.informationsPratiques,
              envieTags: formData.envieTags,
              hybridAccessibilityDetails: formData.hybridAccessibilityDetails,
              hybridDetailedServices: formData.hybridDetailedServices,
              hybridClienteleInfo: formData.hybridClienteleInfo,
              hybridDetailedPayments: formData.hybridDetailedPayments,
              hybridChildrenServices: formData.hybridChildrenServices,
              latitude: formData.address?.latitude,
              longitude: formData.address?.longitude
            }}
            isEditMode={false}
            onEdit={(step) => {
              setCurrentStep(step as FormStep);
            }}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );

      default:
        return <div>Erreur technique : étape inconnue.</div>;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <Rocket className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Professionnel créé en waitlist !</h2>
          <p className="text-gray-600 mb-6">
            Le professionnel a été ajouté avec succès à la waitlist Premium.
          </p>
          <div className="flex gap-3">
            <Link
              href="/admin/waitlist"
              className="flex-1 px-4 py-2 bg-[#ff751f] text-white rounded-lg hover:bg-[#ff751f]/80 transition-colors"
            >
              Retour à la waitlist
            </Link>
            <button
              onClick={() => {
                setShowSuccess(false);
                // Réinitialiser le formulaire
                window.location.reload();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Créer un autre
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/admin/waitlist"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-[#ff751f]" />
                Créer un professionnel en waitlist
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Formulaire complet avec toutes les étapes
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => {
              const stepIndex = stepNumber - 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              return (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                    isActive || isCompleted
                      ? 'bg-[#ff751f] text-white'
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
              className="bg-[#ff751f] h-2 rounded-full transition-all duration-300"
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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div data-testid={`form-step-${currentStep}`}>
            {renderStep()}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 2 && enrichmentData && enrichmentData.name) {
                    handleEnrichmentComplete(enrichmentData);
                  } else {
                    nextStep();
                  }
                }}
                disabled={currentStep === 0 && !phoneVerification.isVerified}
                className={`px-6 py-2 rounded-lg transition-all ${
                  currentStep === 0 && !phoneVerification.isVerified
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#ff751f] text-white hover:bg-[#ff751f]/80'
                }`}
              >
                {currentStep === 0 && !phoneVerification.isVerified ? 'Validez votre téléphone' : 'Suivant'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWaitlistSubmit}
                disabled={isSubmitting || !phoneVerification.isVerified}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (submitProgress || 'Création en cours...')
                  : 'Créer en waitlist'
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

