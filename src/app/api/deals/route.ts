import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      establishmentId,
      title,
      description,
      originalPrice,
      discountedPrice,
      imageUrl,
      pdfUrl,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      isActive
    } = body;

    // Validation des champs requis
    if (!establishmentId || !title || !description || !dateDebut || !dateFin) {
      return NextResponse.json({ 
        error: 'Champs requis manquants' 
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        ownerId: session.user.id 
      },
      select: { 
        id: true, 
        subscription: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ 
        error: 'Établissement introuvable ou accès refusé' 
      }, { status: 404 });
    }

    // Vérifier que l'établissement est premium
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Créer le bon plan
    const deal = await prisma.dailyDeal.create({
      data: {
        establishmentId,
        title,
        description,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        imageUrl: imageUrl || null,
        pdfUrl: pdfUrl || null,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        heureDebut: heureDebut || null,
        heureFin: heureFin || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ 
      success: true,
      deal
    });

  } catch (error) {
    console.error('Erreur lors de la création du bon plan:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la création du bon plan' 
    }, { status: 500 });
  }
}

