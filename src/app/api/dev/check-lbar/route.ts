import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🔍 Vérification de l\'établissement Lbar et son compte pro...');
    
    // Chercher l'établissement Lbar
    const establishment = await prisma.establishment.findFirst({
      where: {
        name: {
          contains: "L Bar"
        }
      },
      include: {
        owner: true,
        tags: true
      }
    });

    if (!establishment) {
      return NextResponse.json({
        error: "Établissement 'Lbar' non trouvé",
        suggestion: "Vérifiez le nom exact de l'établissement"
      }, { status: 404 });
    }

    console.log(`📊 Établissement trouvé: ${establishment.name}`);
    console.log(`📊 Statut: ${establishment.status}`);
    console.log(`📊 Owner associé: ${establishment.owner ? 'OUI' : 'NON'}`);

    // Vérifier le compte propriétaire
    let ownerInfo = null;
    if (establishment.owner) {
      ownerInfo = {
        id: establishment.owner.id,
        email: establishment.owner.email,
        role: establishment.owner.role,
        hasPassword: !!establishment.owner.passwordHash,
        firstName: establishment.owner.firstName,
        lastName: establishment.owner.lastName,
        createdAt: establishment.owner.createdAt
      };
      console.log(`📊 Email owner: ${establishment.owner.email}`);
      console.log(`📊 Rôle: ${establishment.owner.role}`);
      console.log(`📊 Mot de passe défini: ${!!establishment.owner.passwordHash}`);
    }

    // Vérifier les tags
    const tagsInfo = establishment.tags.map(tag => ({
      tag: tag.tag,
      typeTag: tag.typeTag,
      poids: tag.poids
    }));

    const result = {
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        status: establishment.status,
        address: establishment.address,
        latitude: establishment.latitude,
        longitude: establishment.longitude,
        createdAt: establishment.createdAt,
        updatedAt: establishment.updatedAt
      },
      owner: ownerInfo,
      tags: {
        count: establishment.tags.length,
        list: tagsInfo
      },
      issues: [
        establishment.status !== 'active' && 'Établissement non actif',
        !establishment.owner && 'Aucun propriétaire associé',
        establishment.owner && establishment.owner.role !== 'pro' && 'Rôle utilisateur incorrect',
        establishment.owner && !establishment.owner.passwordHash && 'Mot de passe non défini',
        !establishment.latitude || !establishment.longitude && 'Coordonnées manquantes',
        establishment.tags.length === 0 && 'Aucun tag'
      ].filter(Boolean)
    };

    console.log('🚨 Problèmes identifiés:', result.issues);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erreur lors de la vérification de Lbar:', error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification", details: error.message },
      { status: 500 }
    );
  }
}
