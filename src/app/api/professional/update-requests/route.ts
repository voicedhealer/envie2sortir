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

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les demandes du professionnel
    const requests = await prisma.professionalUpdateRequest.findMany({
      where: {
        professionalId: session.user.id,
        status: {
          in: ['pending', 'rejected'] // Ne montrer que les demandes en attente ou rejetées
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true,
      requests 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des demandes' 
    }, { status: 500 });
  }
}

