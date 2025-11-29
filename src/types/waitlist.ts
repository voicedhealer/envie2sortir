/**
 * Types TypeScript pour le système de waitlist premium
 */

export type ProfessionalStatus = 'FREE' | 'PREMIUM' | 'WAITLIST_BETA';

/**
 * Données requises pour rejoindre la waitlist
 */
export interface WaitlistJoinRequest {
  email: string;
  firstName: string;
  lastName: string;
  establishmentName: string;
  phone: string;
  siret: string;
  companyName: string;
  legalStatus: string;
  password: string;
}

/**
 * Réponse après inscription à la waitlist
 */
export interface WaitlistJoinResponse {
  success: boolean;
  message: string;
  professionalId?: string;
  error?: string;
}

/**
 * Statut de la waitlist pour un professionnel
 */
export interface WaitlistStatusResponse {
  status: ProfessionalStatus;
  daysUntilLaunch: number;
  premiumActivationDate: string | null;
  message: string;
  isLaunchActive: boolean;
  timeUntilLaunch?: {
    days: number;
    hours: number;
    minutes: number;
  };
}

/**
 * Résultat de l'activation du lancement par l'admin
 */
export interface LaunchActivationResult {
  success: boolean;
  count: number;
  errors: Array<{
    professionalId: string;
    error: string;
  }>;
  activatedProfessionals?: Array<{
    professionalId: string;
    email: string;
    establishmentName?: string;
  }>;
}

/**
 * Données pour créer un log de changement de statut
 */
export interface SubscriptionLogData {
  professionalId: string;
  oldStatus: ProfessionalStatus | null;
  newStatus: ProfessionalStatus;
  reason: 'waitlist_join' | 'launch_activation' | 'payment_success' | 'admin_activation' | 'subscription_cancelled' | 'other';
}

