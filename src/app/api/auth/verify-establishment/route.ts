/**
 * API Route pour vérifier si un utilisateur a un établissement
 * 
 * Cette route est utilisée côté client pour vérifier
 * si un utilisateur Professional a un établissement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getUserEstablishment } from '@/lib/professional-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un professionnel
    if (session.user.role !== 'pro') {
      return NextResponse.json({ 
        hasEstablishment: false, 
        error: 'Utilisateur non professionnel' 
      });
    }

    // Récupérer l'établissement de l'utilisateur
    const establishment = await getUserEstablishment(session.user.id);
    
    return NextResponse.json({ 
      hasEstablishment: !!establishment,
      establishment: establishment ? {
        id: establishment.id,
        name: establishment.name,
        subscription: establishment.subscription
      } : null
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'établissement:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
