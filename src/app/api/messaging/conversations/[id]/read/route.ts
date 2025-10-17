import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// PATCH /api/messaging/conversations/[id]/read - Marquer les messages comme lus
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id },
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

    // Marquer comme lus les messages de l'autre partie
    const senderTypeToMarkAsRead = isAdmin ? "PROFESSIONAL" : "ADMIN";

    const result = await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderType: senderTypeToMarkAsRead,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ 
      success: true,
      markedAsRead: result.count,
    });
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

