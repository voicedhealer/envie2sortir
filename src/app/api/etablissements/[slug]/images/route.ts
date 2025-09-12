import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    
    // Récupérer l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
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
        imageUrl: establishment.imageUrl,
        images: establishment.images
      }
    });

  } catch (error) {
    console.error("Erreur récupération images:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { slug } = await params;
    const { imageUrl } = await request.json();

    // Vérifier que l'utilisateur est le propriétaire
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true, ownerId: true }
    });

    if (!establishment) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    if (establishment.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Mettre à jour l'image principale
    await prisma.establishment.update({
      where: { id: establishment.id },
      data: { imageUrl }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur mise à jour image:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

