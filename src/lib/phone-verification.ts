/**
 * Utilitaire pour la vérification des numéros de téléphone par SMS
 * Utilise une Map en mémoire pour stocker les numéros vérifiés (pour l'inscription)
 */

const verifiedPhones = new Map<string, { verifiedAt: number; expiresAt: number }>();

/**
 * Normalise un numéro de test Twilio (corrige les erreurs de saisie et unifie le format)
 * Tous les formats sont normalisés vers le format international: +15005550006
 */
function normalizeTwilioTestNumber(phone: string): string {
  if (!phone) return phone;
  
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  
  // Si c'est un numéro de test Twilio, normaliser vers le format international +1500555XXX
  // Format français: 01500555XXX (11 chiffres) - corriger si 12 chiffres (015005550006 -> 01500555006)
  if (/^01500555\d{3,4}$/.test(cleaned)) {
    // Prendre les 11 premiers caractères (015005550006 -> 01500555006)
    const normalized = cleaned.substring(0, 11);
    // Convertir en format international: 01500555006 -> +15005550006
    return '+' + normalized.substring(1);
  }
  
  // Format international: +1500555XXX (12 caractères) - corriger si 13 caractères
  if (/^\+1500555\d{3,4}$/.test(cleaned)) {
    // Prendre les 12 premiers caractères (+150055500006 -> +15005550006)
    return cleaned.substring(0, 12);
  }
  
  // Format sans 0 initial: 1500555XXX (11 chiffres) - corriger si 12 chiffres
  if (/^1500555\d{3,4}$/.test(cleaned)) {
    // Prendre les 11 premiers caractères (150055500006 -> 15005550006)
    const normalized = cleaned.substring(0, 11);
    // Convertir en format international: 15005550006 -> +15005550006
    return '+' + normalized;
  }
  
  return cleaned;
}

/**
 * Nettoie le numéro de téléphone pour le stockage
 */
function cleanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  // Normaliser les numéros de test Twilio pour assurer la cohérence
  return normalizeTwilioTestNumber(cleaned);
}

/**
 * Marque un numéro de téléphone comme vérifié
 * @param phone Le numéro de téléphone à marquer comme vérifié
 * @param validityDuration Durée de validité en millisecondes (par défaut 1 heure)
 */
export function markPhoneAsVerified(
  phone: string,
  validityDuration: number = 60 * 60 * 1000 // 1 heure par défaut
): void {
  const cleanPhone = cleanPhoneNumber(phone);
  const now = Date.now();
  
  verifiedPhones.set(cleanPhone, {
    verifiedAt: now,
    expiresAt: now + validityDuration
  });
  
  console.log(`✅ [Phone Verification] Numéro ${phone} (normalisé: ${cleanPhone}) marqué comme vérifié jusqu'à ${new Date(now + validityDuration).toISOString()}`);
  console.log(`🔍 [Phone Verification] Map actuelle après ajout:`, Array.from(verifiedPhones.keys()));
}

/**
 * Vérifie si un numéro de téléphone a été vérifié récemment
 * @param phone Le numéro de téléphone à vérifier
 * @returns true si le numéro a été vérifié et n'est pas expiré, false sinon
 */
export function isPhoneVerified(phone: string): boolean {
  if (!phone) {
    return false;
  }
  
  const cleanPhone = cleanPhoneNumber(phone);
  const verified = verifiedPhones.get(cleanPhone);
  
  if (!verified) {
    console.log(`❌ [Phone Verification] Numéro ${phone} (normalisé: ${cleanPhone}) non trouvé dans les vérifications`);
    console.log(`🔍 [Phone Verification] Numéros actuellement vérifiés:`, Array.from(verifiedPhones.keys()));
    return false;
  }
  
  // Vérifier que la vérification n'est pas expirée
  const now = Date.now();
  if (now > verified.expiresAt) {
    verifiedPhones.delete(cleanPhone);
    console.log(`❌ [Phone Verification] Vérification expirée pour ${phone}`);
    return false;
  }
  
  console.log(`✅ [Phone Verification] Numéro ${phone} vérifié (vérifié le ${new Date(verified.verifiedAt).toISOString()})`);
  return true;
}

/**
 * Supprime la vérification d'un numéro de téléphone
 * @param phone Le numéro de téléphone à supprimer
 */
export function removePhoneVerification(phone: string): void {
  const cleanPhone = cleanPhoneNumber(phone);
  verifiedPhones.delete(cleanPhone);
  console.log(`🗑️ [Phone Verification] Vérification supprimée pour ${phone}`);
}

/**
 * Nettoie les vérifications expirées
 */
export function cleanupExpiredVerifications(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [phone, data] of verifiedPhones.entries()) {
    if (now > data.expiresAt) {
      verifiedPhones.delete(phone);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 [Phone Verification] ${cleaned} vérification(s) expirée(s) nettoyée(s)`);
  }
}

// Nettoyer les vérifications expirées toutes les heures
setInterval(() => {
  cleanupExpiredVerifications();
}, 60 * 60 * 1000); // 1 heure

