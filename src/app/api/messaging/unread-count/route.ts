import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/messaging/unread-count - Compter les messages non lus
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    let unreadCount = 0;

    if (session.user.role === "admin") {
      // Compter les messages non lus des professionnels
      unreadCount = await prisma.message.count({
        where: {
          senderType: "PROFESSIONAL",
          isRead: false,
        },
      });
    } else if (session.user.userType === "professional") {
      // Compter les messages non lus de l'admin dans les conversations du pro
      const conversations = await prisma.conversation.findMany({
        where: {
          professionalId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      const conversationIds = conversations.map((c) => c.id);

      unreadCount = await prisma.message.count({
        where: {
          conversationId: {
            in: conversationIds,
          },
          senderType: "ADMIN",
          isRead: false,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Erreur lors du comptage des messages non lus:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

