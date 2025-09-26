import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * API pour gérer un événement spécifique
 * PUT: Modifier un événement
 * DELETE: Supprimer un événement
 */

// PUT - Modifier un événement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: "Accès professionnel requis" }, { status: 403 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 400 });
    }

    // Vérifier que l'établissement est Premium
    const establishment = await prisma.establishment.findUnique({
      where: { id: session.user.establishmentId },
      select: { subscription: true }
    });

    if (!establishment || establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ error: "Fonctionnalité réservée aux abonnements Premium" }, { status: 403 });
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, imageUrl, price, maxCapacity } = body;

    // Validation
    if (!title || !startDate) {
      return NextResponse.json({ error: "Titre et date de début requis" }, { status: 400 });
    }

    // Vérifier que l'événement appartient à l'établissement
    const existingEvent = await prisma.event.findFirst({
      where: { 
        id: eventId,
        establishmentId: session.user.establishmentId 
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    // Modifier l'événement
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl,
        price: price ? parseFloat(price) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
      }
    });

    return NextResponse.json({ 
      success: true, 
      event,
      message: "Événement modifié avec succès" 
    });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: "Accès professionnel requis" }, { status: 403 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 400 });
    }

    // Vérifier que l'établissement est Premium
    const establishment = await prisma.establishment.findUnique({
      where: { id: session.user.establishmentId },
      select: { subscription: true }
    });

    if (!establishment || establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ error: "Fonctionnalité réservée aux abonnements Premium" }, { status: 403 });
    }

    const { id: eventId } = await params;

    // Vérifier que l'événement appartient à l'établissement
    const existingEvent = await prisma.event.findFirst({
      where: { 
        id: eventId,
        establishmentId: session.user.establishmentId 
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ 
      success: true,
      message: "Événement supprimé avec succès" 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
