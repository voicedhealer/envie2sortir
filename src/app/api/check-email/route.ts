import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API pour vérifier si un email existe déjà dans la base de données
 * Utilisé pendant le formulaire d'inscription pour éviter les doublons
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email manquant ou invalide' 
      }, { status: 400 });
    }

    // Nettoyer l'email (trim et lowercase)
    const cleanedEmail = email.trim().toLowerCase();
    
    // Vérifier si l'email existe déjà dans User
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    });

    // Vérifier si l'email existe déjà dans Professional
    const existingProfessional = await prisma.professional.findUnique({
      where: { email: cleanedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        exists: true,
        message: 'Cet email est déjà utilisé par un utilisateur.',
        userName: `${existingUser.firstName} ${existingUser.lastName}`,
        userType: 'user'
      });
    }

    if (existingProfessional) {
      return NextResponse.json({ 
        exists: true,
        message: 'Cet email est déjà utilisé par un professionnel.',
        userName: `${existingProfessional.firstName} ${existingProfessional.lastName}`,
        companyName: existingProfessional.companyName,
        userType: 'professional'
      });
    }

    return NextResponse.json({ 
      exists: false,
      message: 'Cet email est disponible.' 
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification de l\'email' 
    }, { status: 500 });
  }
}

