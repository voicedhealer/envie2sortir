import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, price, maxCapacity, isRecurring } = body;

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

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        name,
        description: description || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price: price ? parseFloat(price) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        isRecurring,
        establishmentId
      }
    });

    return NextResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString(),
      price: event.price,
      maxCapacity: event.maxCapacity,
      isRecurring: event.isRecurring,
      status: event.startDate > new Date() ? 'upcoming' : 'completed',
      createdAt: event.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Erreur création événement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, startDate, endDate, price, maxCapacity, isRecurring } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description: description || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price: price ? parseFloat(price) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        isRecurring
      }
    });

    return NextResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString(),
      price: event.price,
      maxCapacity: event.maxCapacity,
      isRecurring: event.isRecurring,
      status: event.startDate > new Date() ? 'upcoming' : 'completed',
      createdAt: event.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Erreur modification événement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'événement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID de l'événement requis" }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur suppression événement:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}
