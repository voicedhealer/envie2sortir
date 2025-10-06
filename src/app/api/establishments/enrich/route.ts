import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { establishmentId, enrichmentData } = await request.json();

    if (!establishmentId || !enrichmentData) {
      return NextResponse.json(
        { error: 'Paramètres manquants: establishmentId et enrichmentData requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement appartient à l'utilisateur
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        userId: session.user.id
      }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Établissement non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    // Mettre à jour l'établissement avec les données enrichies
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        // Données de base enrichies
        name: enrichmentData.name || establishment.name,
        description: enrichmentData.description || establishment.description,
        phone: enrichmentData.phone || establishment.phone,
        website: enrichmentData.website || establishment.website,
        
        // Données d'enrichissement spécifiques
        googleBusinessUrl: enrichmentData.googleBusinessUrl,
        googlePlaceId: enrichmentData.googlePlaceId,
        googleRating: enrichmentData.googleRating,
        googleReviewCount: enrichmentData.googleReviewCount,
        theForkLink: enrichmentData.theForkLink,
        
        // Tags "envie" générés
        envieTags: enrichmentData.envieTags || [],
        
        // Spécialités et informations pratiques
        specialties: enrichmentData.specialties || [],
        atmosphere: enrichmentData.atmosphere || [],
        accessibility: enrichmentData.accessibility || [],
        
        // Marquer comme enrichi
        enriched: true,
        
        // Horaires d'ouverture si disponibles
        horairesOuverture: enrichmentData.hours || establishment.horairesOuverture,
        
        // Prix basé sur le niveau Google
        priceLevel: enrichmentData.priceLevel || establishment.priceLevel,
        
        // Informations pratiques fusionnées
        informationsPratiques: [
          ...(establishment.informationsPratiques || []),
          ...(enrichmentData.practicalInfo || [])
        ].filter((item, index, arr) => arr.indexOf(item) === index), // Supprimer les doublons
        
        // Enrichissement conditionnel : ne pas écraser les choix d'enrichissement manuel existants
        detailedPayments: establishment.detailedPayments && Object.keys(establishment.detailedPayments).length > 0 
          ? establishment.detailedPayments  // Garder les choix manuels existants
          : enrichmentData.detailedPayments, // Appliquer l'enrichissement seulement si vide
        
        detailedServices: establishment.detailedServices && Object.keys(establishment.detailedServices).length > 0 
          ? establishment.detailedServices  // Garder les choix manuels existants
          : enrichmentData.detailedServices, // Appliquer l'enrichissement seulement si vide
        
        accessibilityDetails: establishment.accessibilityDetails && Object.keys(establishment.accessibilityDetails).length > 0 
          ? establishment.accessibilityDetails  // Garder les choix manuels existants
          : enrichmentData.accessibilityDetails, // Appliquer l'enrichissement seulement si vide
        
        // Marquer comme enrichi avec la date
        enrichmentApplied: true,
        enrichmentDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      establishment: updatedEstablishment
    });

  } catch (error) {
    console.error('Erreur enrichissement établissement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de l\'enrichissement' },
      { status: 500 }
    );
  }
}
