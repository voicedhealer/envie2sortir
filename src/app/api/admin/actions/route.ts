import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Créer une nouvelle action administrative
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const { establishmentId, action, reason, previousStatus, newStatus, details } = await request.json();

    if (!establishmentId || !action) {
      return NextResponse.json({ message: 'ID établissement et action requis' }, { status: 400 });
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId }
    });

    if (!establishment) {
      return NextResponse.json({ message: 'Établissement non trouvé' }, { status: 404 });
    }

    // Créer l'action administrative
    const adminAction = await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        establishmentId,
        action,
        reason,
        previousStatus,
        newStatus,
        details: details || null
      },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        establishment: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      action: adminAction,
      message: 'Action enregistrée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'action admin:', error);
    return NextResponse.json({ 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

// Récupérer l'historique des actions
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    const actions = await prisma.adminAction.findMany({
      where,
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        establishment: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const totalCount = await prisma.adminAction.count({ where });

    return NextResponse.json({ 
      actions, 
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actions admin:', error);
    return NextResponse.json({ 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

