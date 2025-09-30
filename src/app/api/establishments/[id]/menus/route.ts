import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { EstablishmentMenu } from '@/types/menu.types';

// GET /api/establishments/[id]/menus - Récupérer les menus d'un établissement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const establishmentId = params.id;

    // Vérifier que l'établissement appartient à l'utilisateur professionnel
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        owner: {
          email: session.user.email
        }
      },
      include: {
        owner: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a un plan Premium
    if (establishment.owner.subscriptionPlan !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Récupérer les menus de l'établissement
    const menus = await prisma.establishmentMenu.findMany({
      where: {
        establishmentId: establishmentId,
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      menus: menus as EstablishmentMenu[]
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des menus:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
