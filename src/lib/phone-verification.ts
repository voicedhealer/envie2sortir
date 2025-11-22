/**
 * Utilitaire pour la vérification des numéros de téléphone par SMS
 * Utilise une Map en mémoire pour stocker les numéros vérifiés (pour l'inscription)
 */

const verifiedPhones = new Map<string, { verifiedAt: number; expiresAt: number }>();

/**
 * Nettoie le numéro de téléphone pour le stockage
 */
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
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
  
  console.log(`✅ [Phone Verification] Numéro ${phone} marqué comme vérifié jusqu'à ${new Date(now + validityDuration).toISOString()}`);
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
    console.log(`❌ [Phone Verification] Numéro ${phone} non trouvé dans les vérifications`);
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

