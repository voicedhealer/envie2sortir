import { NextRequest, NextResponse } from 'next/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { getSmsCode, deleteSmsCode, getAllStoredCodes } from '@/lib/sms-code-store';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json({ 
        error: 'Code invalide' 
      }, { status: 400 });
    }

    // Récupérer le code stocké pour cet utilisateur depuis Supabase
    const storedData = await getSmsCode(user.id);
    
    // Log pour debug
    console.log('🔍 [Verify SMS] Recherche code pour user.id:', user.id);
    const allCodes = await getAllStoredCodes();
    console.log('📦 [Verify SMS] Codes stockés:', allCodes);
    console.log('📋 [Verify SMS] Code trouvé:', storedData ? 'OUI' : 'NON');

    if (!storedData) {
      return NextResponse.json({ 
        error: 'Aucun code de vérification en cours. Veuillez redemander un code.' 
      }, { status: 400 });
    }

    // Vérifier l'expiration (déjà fait dans getSmsCode, mais double vérification)
    if (new Date() > storedData.expiry) {
      await deleteSmsCode(user.id);
      return NextResponse.json({ 
        error: 'Code expiré. Veuillez redemander un nouveau code.' 
      }, { status: 400 });
    }

    // Vérifier le code
    if (storedData.code !== code) {
      return NextResponse.json({ 
        error: 'Code incorrect' 
      }, { status: 400 });
    }

    // Code valide - le supprimer du stockage
    await deleteSmsCode(user.id);

    return NextResponse.json({ 
      success: true,
      message: 'Code vérifié avec succès',
      verified: true
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du code SMS:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification du code' 
    }, { status: 500 });
  }
}

