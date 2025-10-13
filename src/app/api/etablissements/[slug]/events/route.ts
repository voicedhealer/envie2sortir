import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Récupérer l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true, name: true }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Récupérer les événements de l'établissement (événements à venir ET en cours)
    const now = new Date();
    const events = await prisma.event.findMany({
      where: { 
        establishmentId: establishment.id,
        OR: [
          // Événements à venir (pas encore commencés)
          {
            startDate: {
              gt: now
            }
          },
          // Événements en cours (commencés mais pas encore finis)
          {
            startDate: {
              lte: now
            },
            endDate: {
              gte: now
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        imageUrl: true,
        price: true,
        maxCapacity: true,
        isRecurring: true,
        modality: true, // ✅ Ajout du champ modality
        createdAt: true
      },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des événements' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, price, maxCapacity } = body;

    // Validation des données requises
    if (!title || !description || !startDate) {
      return NextResponse.json({ 
        error: 'Titre, description et date de début sont requis' 
      }, { status: 400 });
    }

    // Récupérer l'établissement et vérifier les permissions
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { 
        id: true, 
        name: true, 
        ownerId: true,
        subscription: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    if (establishment.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier que l'établissement a un abonnement PREMIUM pour créer des événements
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Un abonnement PREMIUM est requis pour créer des événements',
        currentSubscription: establishment.subscription,
        requiredSubscription: 'PREMIUM'
      }, { status: 403 });
    }

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price: price ? parseFloat(price) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        establishmentId: establishment.id,
        isRecurring: false
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        price: event.price,
        maxCapacity: event.maxCapacity,
        isRecurring: event.isRecurring
      },
      message: 'Événement créé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création de l\'événement' 
    }, { status: 500 });
  }
}