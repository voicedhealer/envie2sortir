import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { dealId } = await params;
    const body = await request.json();

    // Vérifier que le bon plan existe et que l'utilisateur en est le propriétaire
    const existingDeal = await prisma.dailyDeal.findUnique({
      where: { id: dealId },
      include: {
        establishment: {
          select: {
            ownerId: true,
            subscription: true
          }
        }
      }
    });

    if (!existingDeal) {
      return NextResponse.json({ error: 'Bon plan introuvable' }, { status: 404 });
    }

    if (existingDeal.establishment.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Mettre à jour le bon plan
    const updatedDeal = await prisma.dailyDeal.update({
      where: { id: dealId },
      data: {
        title: body.title,
        description: body.description,
        modality: body.modality || null,
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        discountedPrice: body.discountedPrice ? parseFloat(body.discountedPrice) : null,
        imageUrl: body.imageUrl || null,
        pdfUrl: body.pdfUrl || null,
        dateDebut: body.dateDebut ? new Date(body.dateDebut) : undefined,
        dateFin: body.dateFin ? new Date(body.dateFin) : undefined,
        heureDebut: body.heureDebut || null,
        heureFin: body.heureFin || null,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        // Récurrence
        isRecurring: body.isRecurring !== undefined ? body.isRecurring : undefined,
        recurrenceType: body.recurrenceType || null,
        recurrenceDays: body.recurrenceDays || null,
        recurrenceEndDate: body.recurrenceEndDate ? new Date(body.recurrenceEndDate) : null,
        // Champs pour l'effet flip
        promoUrl: body.promoUrl || null
      }
    });

    return NextResponse.json({ 
      success: true,
      deal: updatedDeal
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du bon plan:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du bon plan' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { dealId } = await params;

    // Vérifier que le bon plan existe et que l'utilisateur en est le propriétaire
    const existingDeal = await prisma.dailyDeal.findUnique({
      where: { id: dealId },
      include: {
        establishment: {
          select: {
            ownerId: true
          }
        }
      }
    });

    if (!existingDeal) {
      return NextResponse.json({ error: 'Bon plan introuvable' }, { status: 404 });
    }

    if (existingDeal.establishment.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Supprimer le bon plan
    await prisma.dailyDeal.delete({
      where: { id: dealId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Bon plan supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du bon plan:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du bon plan' 
    }, { status: 500 });
  }
}


