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

// GET - Récupérer tous les tarifs de l'établissement
export async function GET() {
  try {
    const establishmentId = await getEstablishmentId();
    
    const tariffs = await prisma.tariff.findMany({
      where: { establishmentId },
      orderBy: { createdAt: 'asc' }
    });
    
    return NextResponse.json(tariffs);
  } catch (error) {
    console.error('Erreur récupération tarifs:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tarifs" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau tarif
export async function POST(request: NextRequest) {
  try {
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
    
    const tariff = await prisma.tariff.create({
      data: {
        label: label.trim(),
        price: parseFloat(price),
        establishmentId
      }
    });
    
    return NextResponse.json(tariff, { status: 201 });
  } catch (error) {
    console.error('Erreur création tarif:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création du tarif" },
      { status: 500 }
    );
  }
}
