import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API pour vérifier si un SIRET existe déjà dans la base de données
 * Utilisé pendant le formulaire d'inscription pour éviter de remplir toutes les étapes
 * avant de découvrir que l'établissement existe déjà
 */
export async function POST(request: NextRequest) {
  try {
    const { siret } = await request.json();
    
    if (!siret || typeof siret !== 'string') {
      return NextResponse.json({ 
        error: 'SIRET manquant ou invalide' 
      }, { status: 400 });
    }

    // Nettoyer le SIRET (enlever les espaces)
    const cleanedSiret = siret.replace(/\s/g, '');
    
    // Vérifier si le SIRET existe déjà
    const existingProfessional = await prisma.professional.findUnique({
      where: { siret: cleanedSiret },
      select: {
        id: true,
        companyName: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (existingProfessional) {
      return NextResponse.json({ 
        exists: true,
        message: 'Ce SIRET est déjà enregistré.',
        companyName: existingProfessional.companyName,
        // Ne pas renvoyer l'email complet pour des raisons de sécurité
        emailHint: existingProfessional.user?.email 
          ? existingProfessional.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          : null
      });
    }

    return NextResponse.json({ 
      exists: false,
      message: 'Ce SIRET est disponible.' 
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du SIRET:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification du SIRET' 
    }, { status: 500 });
  }
}

