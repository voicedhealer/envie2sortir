import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    
    // Validation des champs requis
    if (!body.name || !body.address || !body.category) {
      return NextResponse.json(
        { error: "Nom, adresse et catégorie sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'établissement existe
    const existing = await prisma.establishment.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le nouveau slug existe déjà (sauf pour l'établissement actuel)
    if (body.slug && body.slug !== params.slug) {
      const slugExists = await prisma.establishment.findUnique({
        where: { slug: body.slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: "Un établissement avec ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'établissement
    const updated = await prisma.establishment.update({
      where: { slug: params.slug },
      data: {
        name: body.name,
        slug: body.slug || params.slug,
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

    return NextResponse.json(updated);
    
  } catch (error) {
    console.error("Erreur modification établissement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // TODO: Vérifier les permissions admin
    // if (!isAdmin(request)) {
    //   return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    // }

    // Vérifier si l'établissement existe
    const existing = await prisma.establishment.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'établissement (cascade automatique via Prisma)
    await prisma.establishment.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ message: "Établissement supprimé" });
    
  } catch (error) {
    console.error("Erreur suppression établissement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
