import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API GET /api/etablissements/images appelée');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Session utilisateur complète:', {
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
      userType: session?.user?.userType,
      companyName: session?.user?.companyName
    });
    
    if (!session?.user) {
      console.log('❌ Utilisateur non authentifié');
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que c'est bien un professionnel
    if (session.user.role !== 'pro' || session.user.userType !== 'professional') {
      console.log('❌ Utilisateur n\'est pas un professionnel:', session.user.role, session.user.userType);
      return NextResponse.json({ error: "Accès refusé - Professionnel requis" }, { status: 403 });
    }

    console.log('🔍 Recherche de l\'établissement avec ownerId:', session.user.id);

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

    console.log('🏢 Établissement trouvé:', establishment?.id, establishment?.name);

    if (!establishment) {
      console.log('❌ Aucun établissement trouvé pour ownerId:', session.user.id);
      
      // Debug: lister tous les établissements avec leurs propriétaires
      const allEstablishments = await prisma.establishment.findMany({
        select: { 
          id: true, 
          name: true, 
          ownerId: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      // Debug: lister tous les professionnels
      const allProfessionals = await prisma.professional.findMany({
        select: { 
          id: true, 
          email: true, 
          firstName: true, 
          lastName: true,
          companyName: true
        }
      });
      
      console.log('📋 Tous les établissements:', allEstablishments);
      console.log('👥 Tous les professionnels:', allProfessionals);
      
      // Vérifier s'il y a un établissement avec un ownerId qui ne correspond à aucun professionnel
      const invalidOwners = allEstablishments.filter(est => 
        est.ownerId && !allProfessionals.some(p => p.id === est.ownerId)
      );
      
      if (invalidOwners.length > 0) {
        console.log('⚠️ Établissements avec ownerId invalide:', invalidOwners);
      }
      
      return NextResponse.json({ 
        error: "Établissement non trouvé",
        debug: {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: session.user.role,
          userType: session.user.userType,
          allEstablishments: allEstablishments,
          allProfessionals: allProfessionals,
          invalidOwners: invalidOwners
        }
      }, { status: 404 });
    }

    console.log('✅ Retour des données de l\'établissement');
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
    console.error("❌ Erreur récupération images:", error);
    return NextResponse.json({ 
      error: "Erreur serveur",
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 API PUT /api/etablissements/images appelée');
    
    // Debug des headers de la requête
    const cookies = request.headers.get('cookie');
    console.log('🍪 Cookies reçus:', cookies);
    
    const session = await getServerSession(authOptions);
    console.log('👤 Session utilisateur complète:', {
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
      userType: session?.user?.userType,
      hasSession: !!session,
      hasUser: !!session?.user
    });
    
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
    
    // Transaction pour mettre à jour l'établissement ET les images
    await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour l'imageUrl de l'établissement
      await tx.establishment.update({
        where: { id: establishment.id },
        data: { imageUrl }
      });
      
      // 2. Marquer toutes les images comme non-principales
      await tx.image.updateMany({
        where: { establishmentId: establishment.id },
        data: { isPrimary: false }
      });
      
      // 3. Marquer l'image sélectionnée comme principale
      await tx.image.updateMany({
        where: { 
          establishmentId: establishment.id,
          url: imageUrl
        },
        data: { isPrimary: true }
      });
    });

    console.log('✅ Image principale mise à jour avec succès');
    return NextResponse.json({ 
      success: true,
      message: 'Image principale mise à jour'
    });

  } catch (error) {
    console.error("❌ Erreur mise à jour image:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}
