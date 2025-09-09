import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";

// Récupérer l'ID du professionnel depuis la session
const getProfessionalId = async () => {
  const session = await getServerSession();
  if (!session?.user?.professionalId) {
    throw new Error("Non autorisé");
  }
  return session.user.professionalId;
};

// Récupérer l'ID de l'établissement du professionnel
const getEstablishmentId = async () => {
  const professionalId = getProfessionalId();
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { establishments: true }
  });
  
  if (!professional || !professional.establishments[0]) {
    throw new Error("Établissement non trouvé");
  }
  
  return professional.establishments[0].id;
};

// PUT - Modifier un tarif
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { label, price } = body;
    
    // Validation
    if (!label || label.trim() === '') {
      return NextResponse.json(
        { error: "Le label est requis" },
        { status: 400 }
      );
    }
    
    if (!price || price <= 0) {
      return NextResponse.json(
        { error: "Le prix doit être supérieur à 0" },
        { status: 400 }
      );
    }
    
    const establishmentId = await getEstablishmentId();
    
    // Vérifier que le tarif appartient à l'établissement
    const existingTariff = await prisma.tariff.findFirst({
      where: { 
        id,
        establishmentId 
      }
    });
    
    if (!existingTariff) {
      return NextResponse.json(
        { error: "Tarif non trouvé" },
        { status: 404 }
      );
    }
    
    const updatedTariff = await prisma.tariff.update({
      where: { id },
      data: {
        label: label.trim(),
        price: parseFloat(price),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(updatedTariff);
  } catch (error) {
    console.error('Erreur modification tarif:', error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du tarif" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un tarif
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const establishmentId = await getEstablishmentId();
    
    // Vérifier que le tarif appartient à l'établissement
    const existingTariff = await prisma.tariff.findFirst({
      where: { 
        id,
        establishmentId 
      }
    });
    
    if (!existingTariff) {
      return NextResponse.json(
        { error: "Tarif non trouvé" },
        { status: 404 }
      );
    }
    
    await prisma.tariff.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression tarif:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du tarif" },
      { status: 500 }
    );
  }
}
