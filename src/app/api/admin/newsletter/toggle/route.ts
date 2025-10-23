import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleSchema = z.object({
  subscriberId: z.string().min(1, "ID abonné requis"),
  status: z.boolean()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = toggleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { subscriberId, status } = validationResult.data;

    // Vérifier que l'abonné existe
    const subscriber = await prisma.user.findUnique({
      where: { id: subscriberId },
      select: { id: true, email: true, newsletterOptIn: true }
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: "Abonné non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    await prisma.user.update({
      where: { id: subscriberId },
      data: { 
        newsletterOptIn: status,
        updatedAt: new Date()
      }
    });

    // Log de l'action
    console.log(`📧 [Newsletter Admin] Statut modifié pour ${subscriber.email}: ${status ? 'Activé' : 'Désactivé'}`);

    return NextResponse.json({
      success: true,
      message: `Abonnement ${status ? 'activé' : 'désactivé'} avec succès`
    });

  } catch (error) {
    console.error('❌ [Newsletter Toggle] Erreur:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la modification du statut" },
      { status: 500 }
    );
  }
}
