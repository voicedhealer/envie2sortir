import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/messaging/conversations - Lister les conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let conversations;

    if (session.user.role === "admin") {
      // Admin peut voir toutes les conversations
      conversations = await prisma.conversation.findMany({
        where: {
          ...(status && { status: status as any }),
        },
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderType: true,
              isRead: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  senderType: "PROFESSIONAL",
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });

      // Filtrer par messages non lus si demandé
      if (unreadOnly) {
        conversations = conversations.filter(
          (conv) => conv._count.messages > 0
        );
      }
    } else if (session.user.userType === "professional") {
      // Pro ne peut voir que ses conversations
      conversations = await prisma.conversation.findMany({
        where: {
          professionalId: session.user.id,
          ...(status && { status: status as any }),
        },
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderType: true,
              isRead: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  senderType: "ADMIN",
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });

      // Filtrer par messages non lus si demandé
      if (unreadOnly) {
        conversations = conversations.filter(
          (conv) => conv._count.messages > 0
        );
      }
    } else {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/messaging/conversations - Créer une conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, professionalId, initialMessage } = body;

    if (!subject || !initialMessage) {
      return NextResponse.json(
        { error: "Sujet et message initial requis" },
        { status: 400 }
      );
    }

    let conversation;

    if (session.user.role === "admin") {
      // Admin crée une conversation avec un pro
      if (!professionalId) {
        return NextResponse.json(
          { error: "ID du professionnel requis" },
          { status: 400 }
        );
      }

      conversation = await prisma.conversation.create({
        data: {
          subject,
          professionalId,
          adminId: session.user.id,
          messages: {
            create: {
              senderId: session.user.id,
              senderType: "ADMIN",
              content: initialMessage,
            },
          },
        },
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
          messages: true,
        },
      });
    } else if (session.user.userType === "professional") {
      // Pro crée une conversation (ticket support)
      conversation = await prisma.conversation.create({
        data: {
          subject,
          professionalId: session.user.id,
          messages: {
            create: {
              senderId: session.user.id,
              senderType: "PROFESSIONAL",
              content: initialMessage,
            },
          },
        },
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
          messages: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

