import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Compter les établissements en attente
    const pendingEstablishments = await prisma.establishment.count({
      where: {
        status: 'pending'
      }
    });

    // Compter les demandes de modification en attente
    const pendingUpdates = await prisma.professionalUpdateRequest.count({
      where: {
        status: 'pending'
      }
    });

    // Total des éléments en attente
    const totalPending = pendingEstablishments + pendingUpdates;

    return NextResponse.json({ 
      success: true,
      count: totalPending,
      details: {
        establishments: pendingEstablishments,
        professionalUpdates: pendingUpdates
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du compteur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du compteur' 
    }, { status: 500 });
  }
}

