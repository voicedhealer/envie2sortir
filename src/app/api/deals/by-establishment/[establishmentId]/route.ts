import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ establishmentId: string }> }
) {
  try {
    const { establishmentId } = await params;
    console.log('🔍 API GET /api/deals/by-establishment - Recherche pour:', establishmentId);

    // Récupérer l'établissement pour vérifier s'il existe
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { 
        id: true,
        subscription: true,
        name: true
      }
    });

    console.log('🏢 Établissement trouvé:', establishment);

    if (!establishment) {
      console.error('❌ Établissement introuvable');
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Récupérer tous les bons plans de l'établissement
    const deals = await prisma.dailyDeal.findMany({
      where: { 
        establishmentId: establishmentId
      },
      orderBy: {
        dateDebut: 'desc'
      }
    });

    console.log('📋 Bons plans trouvés:', deals.length, 'deals');
    console.log('📋 Détails des deals:', deals.map(d => ({ id: d.id, title: d.title, isActive: d.isActive })));

    return NextResponse.json({ 
      success: true,
      deals
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des bons plans:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des bons plans' 
    }, { status: 500 });
  }
}




