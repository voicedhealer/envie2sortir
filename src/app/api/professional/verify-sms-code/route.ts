import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Stockage temporaire des codes (en production, utiliser Redis)
const smsCodesStore = new Map<string, { code: string; expiry: Date }>();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json({ 
        error: 'Code invalide' 
      }, { status: 400 });
    }

    // Récupérer le code stocké pour cet utilisateur
    const storedData = smsCodesStore.get(session.user.id);

    if (!storedData) {
      return NextResponse.json({ 
        error: 'Aucun code de vérification en cours. Veuillez redemander un code.' 
      }, { status: 400 });
    }

    // Vérifier l'expiration
    if (new Date() > storedData.expiry) {
      smsCodesStore.delete(session.user.id);
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
    smsCodesStore.delete(session.user.id);

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

// Fonction helper pour stocker un code (appelée par l'API send-verification-sms)
export function storeSmsCode(userId: string, code: string, expiry: Date) {
  smsCodesStore.set(userId, { code, expiry });
}

