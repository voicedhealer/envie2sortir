import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer les détails de l'établissement avec le propriétaire
    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        professionalOwner: {
          select: {
            siret: true,
            companyName: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            legalStatus: true,
          },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        {
          error: "Établissement non trouvé",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des détails",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          error: "Action invalide. Doit être 'approve' ou 'reject'",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe et est en attente
    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: { professionalOwner: true },
    });

    if (!establishment) {
      return NextResponse.json(
        {
          error: "Établissement non trouvé",
        },
        { status: 404 }
      );
    }

    if (establishment.status !== "pending") {
      return NextResponse.json(
        {
          error: "Cet établissement n'est plus en attente de validation",
        },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const newStatus = action === "approve" ? "active" : "suspended";
    
    const updatedEstablishment = await prisma.establishment.update({
      where: { id },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      },
    });

    // Log de l'action (pour le MVP, juste console.log)
    console.log(`Établissement ${id} ${action === 'approve' ? 'approuvé' : 'rejeté'} par l'admin`);

    return NextResponse.json({
      success: true,
      message: `Établissement ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`,
      establishment: updatedEstablishment,
    });
  } catch (error) {
    console.error("Erreur lors de l'action sur la demande:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement de la demande",
      },
      { status: 500 }
    );
  }
}
