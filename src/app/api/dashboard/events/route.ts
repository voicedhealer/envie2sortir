import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { getPremiumRequiredError, validateSubscriptionAccess } from "@/lib/subscription-utils";

/**
 * API pour gérer les événements d'un établissement
 * GET: Récupère tous les événements de l'établissement
 * POST: Crée un nouvel événement
 */

// GET - Récupérer tous les événements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.role !== 'pro') {
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

    if (!establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Vérifier l'accès Premium avec validation centralisée
    const validation = validateSubscriptionAccess(establishment.subscription as 'STANDARD' | 'PREMIUM', 'canCreateEvents');
    if (!validation.hasAccess) {
      const error = getPremiumRequiredError('Événements');
      return NextResponse.json(error, { status: error.status });
    }

    // Récupérer tous les événements de l'établissement
    const events = await prisma.event.findMany({
      where: { establishmentId: session.user.establishmentId },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.role !== 'pro') {
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

    if (!establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    // Vérifier l'accès Premium avec validation centralisée
    const validation = validateSubscriptionAccess(establishment.subscription as 'STANDARD' | 'PREMIUM', 'canCreateEvents');
    if (!validation.hasAccess) {
      const error = getPremiumRequiredError('Événements');
      return NextResponse.json(error, { status: error.status });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, imageUrl, price, maxCapacity } = body;

    // Validation
    if (!title || !startDate) {
      return NextResponse.json({ error: "Titre et date de début requis" }, { status: 400 });
    }

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl,
        price: price ? parseFloat(price) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        establishmentId: session.user.establishmentId
      }
    });

    return NextResponse.json({ 
      success: true, 
      event,
      message: "Événement créé avec succès" 
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
