import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // TODO: Récupérer l'ID du professionnel depuis la session
    const professionalId = "cmf0ygvkn00008ztdq5rc0bwx"; // ID de test

    // Récupérer l'établissement du professionnel avec ses tarifs
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: { 
        establishments: {
          include: {
            pricing: true
          }
        }
      }
    });

    if (!professional || !professional.establishments[0]) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    const establishment = professional.establishments[0];
    
    // Convertir les tarifs en format clé-valeur
    const prices: Record<string, number> = {};
    if (establishment.pricing) {
      establishment.pricing.forEach(price => {
        prices[price.serviceId] = price.price;
      });
    }

    return NextResponse.json({ prices });

  } catch (error) {
    console.error('Erreur récupération tarifs:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tarifs" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prices } = body;

    // TODO: Récupérer l'ID du professionnel depuis la session
    const professionalId = "cmf0ygvkn00008ztdq5rc0bwx"; // ID de test

    // Récupérer l'établissement du professionnel
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: { establishments: true }
    });

    if (!professional || !professional.establishments[0]) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    const establishmentId = professional.establishments[0].id;

    // Supprimer les anciens tarifs
    await prisma.pricing.deleteMany({
      where: { establishmentId }
    });

    // Créer les nouveaux tarifs
    const pricingData = Object.entries(prices).map(([serviceId, price]) => ({
      establishmentId,
      serviceId,
      price: price as number,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (pricingData.length > 0) {
      await prisma.pricing.createMany({
        data: pricingData
      });
    }

    // Mettre à jour le statut de l'établissement pour modération
    await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        status: 'pending',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Tarifs mis à jour avec succès",
      prices 
    });

  } catch (error) {
    console.error('Erreur mise à jour tarifs:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des tarifs" },
      { status: 500 }
    );
  }
}
