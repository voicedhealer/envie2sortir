import { NextRequest, NextResponse } from 'next/server';
import { sendSMSWithFallback } from '@/lib/twilio';
import { markPhoneAsVerified } from '@/lib/phone-verification';

// Simulation de codes de vérification en mémoire (en production, utiliser Redis ou DB)
// Note: Pour l'inscription, on utilise une Map en mémoire car l'utilisateur n'est pas encore créé
// Pour les modifications, on utilise la table sms_verification_codes dans Supabase
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

const ALLOW_TEST_AUTO_VERIFY = process.env.TWILIO_AUTO_VERIFY_TEST_NUMBERS !== 'false';

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

export async function POST(request: NextRequest) {
  try {
    // Parser le corps de la requête une seule fois
    const body = await request.json();
    const { phone, action, code } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }

    // Nettoyer et normaliser le numéro de téléphone
    let cleanPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
    cleanPhone = normalizeTwilioTestNumber(cleanPhone);
    
    if (action === 'send') {
      // Générer un code à 6 chiffres
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Stocker le code avec expiration (10 minutes)
      const expiresAt = Date.now() + (10 * 60 * 1000);
      verificationCodes.set(cleanPhone, { code: verificationCode, expiresAt });
      
      // Envoyer le SMS via Twilio (ou simulation en développement)
      const smsResult = await sendSMSWithFallback(phone, verificationCode);
      
      if (!smsResult.success) {
        // Nettoyer le code stocké si l'envoi a échoué
        verificationCodes.delete(cleanPhone);
        console.error('❌ [Verify Phone] Échec envoi SMS:', smsResult.error);
        return NextResponse.json({ 
          error: smsResult.error || 'Erreur lors de l\'envoi du SMS. Veuillez réessayer.' 
        }, { status: 500 });
      }
      
      console.log(`✅ [Verify Phone] SMS envoyé à ${phone}`);
      console.log(`🔐 Code généré: ${verificationCode}`);
      
      let autoVerified = false;
      let testMessage: string | undefined;

      if (smsResult.isTest && ALLOW_TEST_AUTO_VERIFY) {
        console.log(`🧪 [Verify Phone] Numéro de test détecté (${cleanPhone}) - auto validation`);
        verificationCodes.delete(cleanPhone);
        markPhoneAsVerified(cleanPhone, 60 * 60 * 1000); // 1 heure
        autoVerified = true;
        testMessage = 'Numéro de test Twilio détecté - vérification automatique';
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'SMS de vérification envoyé',
        // En développement, retourner le code pour faciliter les tests
        ...(smsResult.devCode && { 
          debugCode: smsResult.devCode,
          devCode: smsResult.devCode,
          debugMessage: 'Code affiché pour les tests (mode développement)'
        }),
        ...(smsResult.isTest && {
          isTestMode: true,
          autoVerified,
          testMessage: testMessage || 'Numéro de test Twilio détecté',
        })
      });
      
    } else if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Code de vérification requis' }, { status: 400 });
      }
      
      // Vérifier le code
      const storedData = verificationCodes.get(cleanPhone);
      
      if (!storedData) {
        return NextResponse.json({ 
          error: 'Aucun code de vérification trouvé pour ce numéro' 
        }, { status: 400 });
      }
      
      if (Date.now() > storedData.expiresAt) {
        verificationCodes.delete(cleanPhone);
        return NextResponse.json({ 
          error: 'Code de vérification expiré' 
        }, { status: 400 });
      }
      
      if (storedData.code !== code) {
        return NextResponse.json({ 
          error: 'Code de vérification incorrect' 
        }, { status: 400 });
      }
      
      // Code correct ! Nettoyer le code et marquer le numéro comme vérifié
      verificationCodes.delete(cleanPhone);
      
      // Marquer le numéro comme vérifié (valide pendant 1 heure)
      // Utiliser cleanPhone pour assurer la cohérence avec le stockage
      console.log(`🔍 [Verify Phone] Marquage du numéro ${phone} (normalisé: ${cleanPhone}) comme vérifié`);
      markPhoneAsVerified(cleanPhone, 60 * 60 * 1000); // 1 heure
      
      // Vérifier immédiatement que le numéro est bien marqué
      const { isPhoneVerified } = await import('@/lib/phone-verification');
      const isNowVerified = isPhoneVerified(cleanPhone);
      console.log(`🔍 [Verify Phone] Vérification immédiate après marquage: ${isNowVerified ? '✅ OUI' : '❌ NON'}`);
      
      console.log(`✅ [Verify Phone] Numéro ${phone} (normalisé: ${cleanPhone}) vérifié avec succès`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Numéro de téléphone vérifié avec succès',
        verified: true
      });
      
    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification téléphone:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

// Nettoyer les codes expirés toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(phone);
    }
  }
}, 60 * 60 * 1000); // 1 heure
