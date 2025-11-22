import { NextRequest, NextResponse } from 'next/server';
import { sendSMSWithFallback } from '@/lib/twilio';
import { markPhoneAsVerified } from '@/lib/phone-verification';

// Simulation de codes de vérification en mémoire (en production, utiliser Redis ou DB)
// Note: Pour l'inscription, on utilise une Map en mémoire car l'utilisateur n'est pas encore créé
// Pour les modifications, on utilise la table sms_verification_codes dans Supabase
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    // Parser le corps de la requête une seule fois
    const body = await request.json();
    const { phone, action, code } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }

    // Nettoyer le numéro de téléphone
    const cleanPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
    
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
      
      // Si c'est un SMS de test (simulé), marquer automatiquement le numéro comme vérifié
      // pour faciliter les tests
      if (smsResult.isTest) {
        console.log(`🧪 [Verify Phone] Numéro de test détecté - Marquage automatique comme vérifié`);
        markPhoneAsVerified(phone, 60 * 60 * 1000); // 1 heure
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'SMS de vérification envoyé',
        // En développement, retourner le code pour faciliter les tests
        ...(smsResult.devCode && { 
          debugCode: smsResult.devCode,
          debugMessage: 'Code affiché pour les tests (mode développement)'
        }),
        // Indiquer si c'est un test pour que le front puisse auto-valider
        ...(smsResult.isTest && {
          isTestMode: true,
          autoVerified: true,
          testMessage: 'Numéro de test Twilio - Vérification automatique'
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
      markPhoneAsVerified(phone, 60 * 60 * 1000); // 1 heure
      
      console.log(`✅ [Verify Phone] Numéro ${phone} vérifié avec succès`);
      
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
