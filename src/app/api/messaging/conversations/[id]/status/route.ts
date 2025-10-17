import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// PATCH /api/messaging/conversations/[id]/status - Changer le statut
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide (open ou closed requis)" },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        professionalId: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les droits d'accès
    const isAdmin = session.user.role === "admin";
    const isProfessionalOwner = 
      session.user.userType === "professional" && 
      conversation.professionalId === session.user.id;

    if (!isAdmin && !isProfessionalOwner) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    const updatedConversation = await prisma.conversation.update({
      where: { id: params.id },
      data: { status },
      include: {
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
          },
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return NextResponse.json({ conversation: updatedConversation });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

