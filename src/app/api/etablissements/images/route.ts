import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 404 });
    }
    
    // Récupérer l'établissement de l'utilisateur
    const establishment = await prisma.establishment.findUnique({
      where: { id: session.user.establishmentId },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        images: {
          select: {
            id: true,
            url: true,
            isPrimary: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        imageUrl: establishment.imageUrl,
        images: establishment.images
      }
    });

  } catch (error) {
    console.error("Erreur récupération images:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 404 });
    }

    const { imageUrl } = await request.json();

    // Mettre à jour l'image principale
    await prisma.establishment.update({
      where: { id: session.user.establishmentId },
      data: { imageUrl }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur mise à jour image:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
