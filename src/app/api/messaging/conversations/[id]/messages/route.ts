import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/messaging/conversations/[id]/messages - Envoyer un message
export async function POST(
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

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        professionalId: true,
        status: true,
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

    // Déterminer le type d'expéditeur
    const senderType = isAdmin ? "ADMIN" : "PROFESSIONAL";

    // Créer le message et mettre à jour la conversation
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        senderType,
        content,
      },
    });

    // Mettre à jour lastMessageAt et assigner l'admin si premier message admin
    const updateData: any = {
      lastMessageAt: new Date(),
    };

    if (isAdmin && !conversation.status) {
      updateData.adminId = session.user.id;
    }

    await prisma.conversation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

