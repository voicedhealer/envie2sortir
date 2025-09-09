import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🔍 Liste de tous les établissements...');
    
    // Récupérer TOUS les établissements
    const establishments = await prisma.establishment.findMany({
      include: {
        owner: true,
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 ${establishments.length} établissements trouvés`);

    const result = establishments.map(establishment => ({
      id: establishment.id,
      name: establishment.name,
      slug: establishment.slug,
      status: establishment.status,
      address: establishment.address,
      owner: establishment.owner ? {
        id: establishment.owner.id,
        email: establishment.owner.email,
        role: establishment.owner.role,
        firstName: establishment.owner.firstName,
        lastName: establishment.owner.lastName
      } : null,
      tagsCount: establishment.tags.length,
      createdAt: establishment.createdAt
    }));

    return NextResponse.json({
      total: establishments.length,
      establishments: result
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des établissements:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération", details: error.message },
      { status: 500 }
    );
  }
}
