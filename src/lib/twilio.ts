import twilio from 'twilio';

/**
 * Configuration Twilio
 */
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * Mode test Twilio (utiliser des numéros de test)
 */
const TWILIO_TEST_MODE = process.env.TWILIO_TEST_MODE === 'true' || process.env.NODE_ENV === 'test';

/**
 * Numéros de test Twilio (gratuits, pour les tests)
 * Documentation: https://www.twilio.com/docs/iam/test-credentials
 */
const TWILIO_TEST_NUMBERS = {
  SUCCESS: '+15005550006', // SMS envoyé avec succès
  ERROR: '+15005550007',   // Erreur lors de l'envoi
  INVALID: '+15005550008'  // Numéro invalide
};

/**
 * Vérifie si Twilio est configuré
 */
export function isTwilioConfigured(): boolean {
  return !!(
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    TWILIO_PHONE_NUMBER
  );
}

/**
 * Initialise le client Twilio
 */
function getTwilioClient() {
  if (!isTwilioConfigured()) {
    throw new Error(
      'Twilio n\'est pas configuré. Veuillez définir TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER dans votre fichier .env'
    );
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Normalise un numéro de test Twilio (corrige les erreurs de saisie comme 015005550006 -> 01500555006)
 */
function normalizeTwilioTestNumber(phone: string): string {
  if (!phone) return phone;
  
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // Si c'est un numéro qui commence par 01500555 ou +1500555, normaliser
  // Format français: 01500555XXX (11 chiffres) - corriger si 12 chiffres (015005550006 -> 01500555006)
  if (/^01500555\d{4}$/.test(cleaned)) {
    // Si 12 chiffres, prendre les 11 premiers (015005550006 -> 01500555006)
    return cleaned.substring(0, 11);
  }
  
  // Format international: +1500555XXX (12 caractères) - corriger si 13 caractères
  if (/^\+1500555\d{4}$/.test(cleaned)) {
    return cleaned.substring(0, 12);
  }
  
  // Format sans 0 initial: 1500555XXX (11 chiffres) - corriger si 12 chiffres
  if (/^1500555\d{4}$/.test(cleaned)) {
    return cleaned.substring(0, 11);
  }
  
  return cleaned;
}

/**
 * Formate un numéro de téléphone français pour Twilio
 */
function formatPhoneNumber(phone: string): string {
  // Nettoyer le numéro
  let cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // IMPORTANT: Vérifier d'abord si c'est un numéro de test Twilio AVANT de normaliser
  // pour éviter qu'il soit traité comme un numéro français
  const isTestBeforeNormalize = isTestNumber(cleaned);
  
  // Normaliser les numéros de test Twilio (corriger les erreurs de saisie)
  cleaned = normalizeTwilioTestNumber(cleaned);
  
  // Vérifier si c'est un numéro de test Twilio (format français 01500555006 ou international +15005550006)
  // Les numéros de test Twilio commencent par 01500555 ou +1500555
  if (isTestBeforeNormalize || cleaned.startsWith('01500555') || cleaned.startsWith('+1500555') || cleaned.startsWith('1500555')) {
    // Convertir le format français en format international Twilio
    if (cleaned.startsWith('0')) {
      cleaned = '+' + cleaned.substring(1);
    } else if (cleaned.startsWith('1500555')) {
      // Format sans 0 initial
      cleaned = '+' + cleaned;
    }
    // Si c'est déjà au format international, le retourner tel quel
    console.log(`🧪 [Twilio] Numéro de test détecté, formaté en: ${cleaned}`);
    return cleaned;
  }
  
  // Si c'est déjà un numéro de test Twilio au format international, le retourner tel quel
  if (Object.values(TWILIO_TEST_NUMBERS).includes(cleaned as any)) {
    return cleaned;
  }
  
  // Pour les autres numéros français, appliquer le formatage normal
  // Si commence par 0, remplacer par +33
  if (cleaned.startsWith('0')) {
    cleaned = '+33' + cleaned.substring(1);
  }
  
  // Si ne commence pas par +, ajouter +33
  if (!cleaned.startsWith('+')) {
    cleaned = '+33' + cleaned;
  }
  
  return cleaned;
}

/**
 * Vérifie si un numéro est un numéro de test Twilio
 */
function isTestNumber(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // IMPORTANT: Vérifier AVANT normalisation pour détecter aussi les numéros avec erreurs de saisie
  // Format français: 01500555XXX (11 ou 12 chiffres - avec ou sans erreur de saisie)
  if (/^01500555\d{3,4}$/.test(cleaned)) {
    return true;
  }
  
  // Format international: +1500555XXX (12 ou 13 caractères - avec ou sans erreur de saisie)
  if (/^\+1500555\d{3,4}$/.test(cleaned)) {
    return true;
  }
  
  // Format sans 0 initial: 1500555XXX (11 ou 12 chiffres - avec ou sans erreur de saisie)
  if (/^1500555\d{3,4}$/.test(cleaned)) {
    return true;
  }
  
  const normalized = normalizeTwilioTestNumber(cleaned);
  
  // Vérifier dans la liste exacte
  if (Object.values(TWILIO_TEST_NUMBERS).includes(normalized as any)) {
    return true;
  }
  
  // Vérifier si c'est un numéro de test Twilio par pattern (1500555XXX ou +1500555XXX)
  // Les numéros de test Twilio ont toujours ce pattern : 1500555XXX
  if (/^\+?1?500555\d{3}$/.test(normalized.replace(/^\+33/, '').replace(/^0/, ''))) {
    return true;
  }
  
  // Vérifier format français (01500555XXX - 11 chiffres)
  if (/^01500555\d{3}$/.test(normalized)) {
    return true;
  }
  
  // Vérifier format international (+1500555XXX - 12 caractères)
  if (/^\+1500555\d{3}$/.test(normalized)) {
    return true;
  }
  
  return false;
}

/**
 * Vérifie si on doit utiliser le mode test
 */
export function isTestMode(): boolean {
  return TWILIO_TEST_MODE;
}

/**
 * Envoie un SMS de vérification via Twilio
 */
export async function sendVerificationSMS(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string; isTest?: boolean }> {
  try {
    // Vérifier la configuration
    if (!isTwilioConfigured()) {
      console.error('❌ [Twilio] Configuration manquante');
      return {
        success: false,
        error: 'Configuration Twilio manquante'
      };
    }

    // Vérifier d'abord si c'est un numéro de test AVANT de formater
    const isTestNumBeforeFormat = isTestNumber(phoneNumber);
    
    const client = getTwilioClient();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const isTestNumAfterFormat = isTestNumber(formattedPhone);
    
    // Message SMS
    const message = `Votre code de vérification Envie2Sortir est : ${code}. Valide pendant 10 minutes.`;

    // En mode test ou si c'est un numéro de test, logger mais ne pas envoyer réellement
    // Vérifier à la fois avant et après formatage pour être sûr
    if (TWILIO_TEST_MODE || isTestNumBeforeFormat || isTestNumAfterFormat) {
      console.log(`🧪 [Twilio TEST] SMS de test à ${formattedPhone} (original: ${phoneNumber})`);
      console.log(`🔐 [Twilio TEST] Code de vérification: ${code}`);
      console.log(`📝 [Twilio TEST] Message: ${message}`);
      
      // Gérer les numéros de test spéciaux Twilio
      if (formattedPhone === TWILIO_TEST_NUMBERS.ERROR || formattedPhone === '+15005550007' || formattedPhone === '15005550007') {
        console.log('⚠️ [Twilio TEST] Numéro de test erreur utilisé - simulation d\'erreur');
        return {
          success: false,
          error: 'Erreur simulée (numéro de test)',
          isTest: true
        };
      }
      
      if (formattedPhone === TWILIO_TEST_NUMBERS.INVALID || formattedPhone === '+15005550008' || formattedPhone === '15005550008') {
        console.log('⚠️ [Twilio TEST] Numéro de test invalide utilisé - simulation d\'erreur');
        return {
          success: false,
          error: 'Numéro de téléphone invalide (numéro de test)',
          isTest: true
        };
      }
      
      // Pour les numéros de test réussis, simuler l'envoi
      console.log('✅ [Twilio TEST] SMS simulé avec succès (pas d\'envoi réel)');
      return {
        success: true,
        isTest: true
      };
    }

    // Envoi réel via Twilio
    console.log(`📱 [Twilio] Envoi SMS à ${formattedPhone}`);
    
    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER!,
      to: formattedPhone
    });

    console.log(`✅ [Twilio] SMS envoyé avec succès. SID: ${result.sid}`);
    
    return {
      success: true,
      isTest: false
    };

  } catch (error) {
    console.error('❌ [Twilio] Erreur lors de l\'envoi du SMS:', error);
    
    if (error instanceof Error) {
      // Gestion des erreurs spécifiques Twilio
      if (error.message.includes('Invalid phone number')) {
        return {
          success: false,
          error: 'Numéro de téléphone invalide'
        };
      }
      
      if (error.message.includes('Unable to create record')) {
        return {
          success: false,
          error: 'Erreur de configuration Twilio'
        };
      }
    }

    return {
      success: false,
      error: 'Erreur lors de l\'envoi du SMS. Veuillez réessayer.'
    };
  }
}

/**
 * Envoie un SMS de vérification (avec gestion du mode développement et test)
 */
export async function sendSMSWithFallback(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string; devCode?: string; isTest?: boolean }> {
  // Si Twilio n'est pas configuré, on simule en développement
  if (!isTwilioConfigured()) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('⚠️ [Twilio] Mode développement/test - SMS non envoyé');
      console.log(`📱 [DEV] SMS serait envoyé à ${phoneNumber}`);
      console.log(`🔐 [DEV] Code de vérification: ${code}`);
      
      return {
        success: true,
        devCode: code, // Retourner le code en développement pour faciliter les tests
        isTest: true
      };
    } else {
      return {
        success: false,
        error: 'Configuration Twilio manquante'
      };
    }
  }

  // Envoi via Twilio (réel ou test selon la configuration)
  const result = await sendVerificationSMS(phoneNumber, code);
  
  // En développement ou test, retourner le code pour faciliter les tests
  if (result.success && (process.env.NODE_ENV === 'development' || result.isTest || TWILIO_TEST_MODE)) {
    return {
      ...result,
      devCode: code
    };
  }

  return result;
}

