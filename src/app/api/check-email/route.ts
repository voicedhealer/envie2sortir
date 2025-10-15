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
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        professional: {
          select: {
            companyName: true
          }
        }
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        exists: true,
        message: 'Cet email est déjà utilisé.',
        userName: `${existingUser.firstName} ${existingUser.lastName}`,
        companyName: existingUser.professional?.companyName || null
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

