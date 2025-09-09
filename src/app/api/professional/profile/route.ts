import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, address, city, phone, email, website, instagram, facebook } = body;

    // TODO: Récupérer l'ID du professionnel depuis la session
    const professionalId = "cmf0ygvkn00008ztdq5rc0bwx"; // ID de test

    // Récupérer l'établissement du professionnel
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: { establishments: true }
    });

    if (!professional || !professional.establishments[0]) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    const establishmentId = professional.establishments[0].id;

    // Mettre à jour l'établissement avec statut "pending" pour modération
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        name,
        description: description || "",
        address,
        city,
        phone: phone || null,
        email: email || null,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        status: 'pending', // Mise en attente de validation
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      id: updatedEstablishment.id,
      name: updatedEstablishment.name,
      slug: updatedEstablishment.slug,
      status: updatedEstablishment.status,
      description: updatedEstablishment.description,
      address: updatedEstablishment.address,
      city: updatedEstablishment.city,
      viewsCount: updatedEstablishment.viewsCount,
      clicksCount: updatedEstablishment.clicksCount,
      avgRating: updatedEstablishment.avgRating,
      totalComments: updatedEstablishment.totalComments,
      createdAt: updatedEstablishment.createdAt.toISOString(),
      updatedAt: updatedEstablishment.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
