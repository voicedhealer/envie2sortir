import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Vérifier si l'utilisateur de test existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@envie2sortir.fr" }
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "Utilisateur de test existe déjà",
        email: "test@envie2sortir.fr",
        password: "password123"
      });
    }

    // Créer un professionnel de test
    const professional = await prisma.professional.create({
      data: {
        firstName: "Michel",
        lastName: "Maurice",
        email: "test@envie2sortir.fr",
        phone: "0123456789",
        siret: "12345678901234",
        companyName: "Test Company"
      }
    });

    // Créer un établissement de test
    const establishment = await prisma.establishment.create({
      data: {
        name: "Battle Kart Test",
        slug: "battle-kart-test",
        description: "Établissement de test",
        address: "123 Rue de Test",
        city: "Dijon",
        latitude: 47.3220,
        longitude: 5.0415,
        professionalOwnerId: professional.id,
        status: "active"
      }
    });

    // Créer l'utilisateur de test
    const hashedPassword = await bcrypt.hash("password123", 12);
    const user = await prisma.user.create({
      data: {
        email: "test@envie2sortir.fr",
        name: "Michel Maurice",
        passwordHash: hashedPassword,
        role: "pro"
      }
    });

    return NextResponse.json({ 
      message: "Utilisateur de test créé avec succès",
      email: "test@envie2sortir.fr",
      password: "password123",
      userId: user.id,
      professionalId: professional.id,
      establishmentId: establishment.id
    });

  } catch (error) {
    console.error('Erreur création utilisateur test:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur de test" },
      { status: 500 }
    );
  }
}
