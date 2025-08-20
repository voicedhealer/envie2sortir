import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des champs requis
    if (!body.name || !body.address || !body.category) {
      return NextResponse.json(
        { error: "Nom, adresse et catégorie sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    if (body.slug) {
      const existing = await prisma.establishment.findUnique({
        where: { slug: body.slug },
      });
      
      if (existing) {
        return NextResponse.json(
          { error: "Un établissement avec ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Créer l'établissement
    const establishment = await prisma.establishment.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description || "",
        address: body.address,
        latitude: body.latitude || 47.322,
        longitude: body.longitude || 5.041,
        phone: body.phone || "",
        email: body.email || "",
        website: body.website || "",
        instagram: body.instagram || "",
        category: body.category,
        status: body.status || "pending",
      },
    });

    return NextResponse.json(establishment, { status: 201 });
    
  } catch (error) {
    console.error("Erreur création établissement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
