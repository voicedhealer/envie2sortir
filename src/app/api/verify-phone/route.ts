import { NextRequest, NextResponse } from 'next/server';

// Simulation de codes de vérification en mémoire (en production, utiliser Redis ou DB)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Codes de test prédéfinis pour le développement
const TEST_CODES = ['123456', '000000', '111111', '999999'];

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
      // === SIMULATION D'ENVOI DE SMS ===
      
      // En développement, on génère un code aléatoire ou on utilise un code de test
      const isTestNumber = cleanPhone.includes('06') || cleanPhone.includes('07');
      const verificationCode = isTestNumber ? TEST_CODES[Math.floor(Math.random() * TEST_CODES.length)] : '123456';
      
      // Stocker le code avec expiration (5 minutes)
      const expiresAt = Date.now() + (5 * 60 * 1000);
      verificationCodes.set(cleanPhone, { code: verificationCode, expiresAt });
      
      // === SIMULATION DE L'ENVOI ===
      console.log(`📱 [SIMULATION TWILIO] SMS envoyé à ${phone}`);
      console.log(`🔐 Code de vérification: ${verificationCode}`);
      console.log(`⏰ Expire dans 5 minutes`);
      
      // En mode développement, on peut aussi logger dans la console du navigateur
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🚨 CODE DE VÉRIFICATION POUR ${phone}: ${verificationCode}\n`);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'SMS de vérification envoyé',
        // En développement, on peut retourner le code pour faciliter les tests
        ...(process.env.NODE_ENV === 'development' && { 
          debugCode: verificationCode,
          debugMessage: 'Code affiché en console pour les tests'
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
      
      // Code correct ! Nettoyer et confirmer
      verificationCodes.delete(cleanPhone);
      
      console.log(`✅ [SIMULATION TWILIO] Numéro ${phone} vérifié avec succès`);
      
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
