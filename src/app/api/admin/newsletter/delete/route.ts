import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const deleteSchema = z.object({
  subscriberId: z.string().min(1, "ID abonné requis")
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = deleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { subscriberId } = validationResult.data;

    // Vérifier que l'abonné existe
    const subscriber = await prisma.user.findUnique({
      where: { id: subscriberId },
      select: { id: true, email: true, role: true }
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: "Abonné non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la suppression d'un admin
    if (subscriber.role === 'admin') {
      return NextResponse.json(
        { success: false, error: "Impossible de supprimer un administrateur" },
        { status: 403 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: subscriberId }
    });

    // Log de l'action
    console.log(`🗑️ [Newsletter Admin] Abonné supprimé: ${subscriber.email}`);

    return NextResponse.json({
      success: true,
      message: "Abonné supprimé avec succès"
    });

  } catch (error) {
    console.error('❌ [Newsletter Delete] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}


