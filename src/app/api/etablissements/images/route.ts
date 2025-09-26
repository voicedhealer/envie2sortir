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

    // Récupérer l'établissement de l'utilisateur (nouvelle architecture)
    const establishment = await prisma.establishment.findFirst({
      where: { ownerId: session.user.id },
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
    console.log('🔄 API PUT /api/etablissements/images appelée');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Session utilisateur:', session?.user?.id, session?.user?.role);
    
    if (!session?.user) {
      console.log('❌ Utilisateur non authentifié');
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'établissement de l'utilisateur (nouvelle architecture)
    const establishment = await prisma.establishment.findFirst({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        imageUrl: true
      }
    });

    console.log('🏢 Établissement trouvé:', establishment?.id, establishment?.name, establishment?.status);

    if (!establishment) {
      console.log('❌ Aucun établissement associé');
      return NextResponse.json({ error: "Aucun établissement associé" }, { status: 404 });
    }

    // Vérifier que l'établissement est actif (pas nécessaire pour l'upload d'images)
    // Les établissements en attente peuvent aussi uploader des images
    console.log('📊 Statut de l\'établissement:', establishment.status);

    const body = await request.json();
    console.log('📝 Données reçues:', body);
    
    const { imageUrl } = body;

    if (!imageUrl) {
      console.log('❌ imageUrl manquant');
      return NextResponse.json({ error: "URL de l'image requise" }, { status: 400 });
    }

    // Mettre à jour l'image principale
    console.log('💾 Mise à jour de l\'image principale:', imageUrl);
    await prisma.establishment.update({
      where: { id: establishment.id },
      data: { imageUrl }
    });

    console.log('✅ Image principale mise à jour avec succès');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Erreur mise à jour image:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}
