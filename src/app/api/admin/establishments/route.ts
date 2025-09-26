import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Construire les filtres
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { owner: { companyName: { contains: search, mode: 'insensitive' } } },
        { owner: { firstName: { contains: search, mode: 'insensitive' } } },
        { owner: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Récupérer les établissements avec les données du professionnel
    const establishments = await prisma.establishment.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        phone: true, // Contact de l'établissement
        email: true, // Contact de l'établissement
        website: true,
        status: true,
        subscription: true,
        rejectionReason: true,
        rejectedAt: true,
        lastModifiedAt: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true, // Contact du professionnel
            phone: true, // Contact du professionnel
            companyName: true,
            siret: true,
            legalStatus: true,
            siretVerified: true,
            siretVerifiedAt: true,
            createdAt: true,
            updatedAt: true
          }
        },
        _count: {
          select: {
            images: true,
            events: true,
            comments: true,
            favorites: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Compter le total pour la pagination
    const total = await prisma.establishment.count({ where });

    // Statistiques par statut
    const stats = await prisma.establishment.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      establishments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        pending: statusStats.pending || 0,
        approved: statusStats.approved || 0,
        rejected: statusStats.rejected || 0,
        total
      }
    });

  } catch (error) {
    console.error('Erreur API admin établissements:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { establishmentId, action, rejectionReason } = await request.json();

    if (!establishmentId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          rejectionReason: null,
          rejectedAt: null
        };
        break;
      
      case 'reject':
        if (!rejectionReason) {
          return NextResponse.json({ error: 'Raison du rejet requise' }, { status: 400 });
        }
        updateData = {
          status: 'rejected',
          rejectionReason,
          rejectedAt: new Date()
        };
        break;
      
      default:
        return NextResponse.json({ error: 'Action non valide' }, { status: 400 });
    }

    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
            siret: true,
            legalStatus: true,
            siretVerified: true,
            siretVerifiedAt: true
          }
        }
      }
    });

    // TODO: Envoyer notification au professionnel
    // - Email de notification
    // - Notification dans le dashboard

    return NextResponse.json({
      success: true,
      establishment: updatedEstablishment,
      message: action === 'approve' 
        ? 'Établissement approuvé avec succès'
        : 'Établissement rejeté avec succès'
    });

  } catch (error) {
    console.error('Erreur API admin établissements PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
