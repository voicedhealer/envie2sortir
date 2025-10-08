import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * API pour incrémenter les statistiques d'un établissement
 * 
 * Endpoints:
 * - POST /api/establishments/[id]/stats?action=view - Incrémente les vues
 * - POST /api/establishments/[id]/stats?action=click - Incrémente les clics
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action || !['view', 'click'].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'view' ou 'click'" },
        { status: 400 }
      );
    }

    // Vérifier que l'établissement existe
    const establishment = await prisma.establishment.findUnique({
      where: { id },
      select: { id: true, name: true, status: true, ownerId: true }
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // ✅ CORRECTION : Vérifier si c'est le propriétaire qui consulte
    const session = await getServerSession(authOptions);
    if (session?.user?.id === establishment.ownerId) {
      console.log('🔒 Vue/click du propriétaire ignorée pour:', establishment.name);
      return NextResponse.json({
        success: true,
        action,
        message: "Statistique non comptabilisée (propriétaire)",
        establishment: {
          id: establishment.id,
          name: establishment.name,
          viewsCount: 0, // Ne pas révéler les vraies statistiques
          clicksCount: 0
        }
      });
    }

    // Note: On permet l'incrémentation même pour les établissements en attente
    // car le propriétaire peut voir et tester sa propre page avant validation
    // Les établissements rejetés sont exclus
    if (establishment.status === 'rejected') {
      return NextResponse.json(
        { error: "Établissement non disponible" },
        { status: 403 }
      );
    }

    // Incrémenter la statistique appropriée
    const updateData = action === 'view' 
      ? { viewsCount: { increment: 1 } }
      : { clicksCount: { increment: 1 } };

    const updatedEstablishment = await prisma.establishment.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        viewsCount: true,
        clicksCount: true
      }
    });

    console.log(`📊 Statistique ${action} incrémentée pour ${establishment.name}:`, {
      viewsCount: updatedEstablishment.viewsCount,
      clicksCount: updatedEstablishment.clicksCount
    });

    return NextResponse.json({
      success: true,
      action,
      establishment: updatedEstablishment
    });

  } catch (error) {
    console.error('❌ Erreur incrémentation statistique:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'incrémentation des statistiques" },
      { status: 500 }
    );
  }
}
