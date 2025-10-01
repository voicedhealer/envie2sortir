import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PublicMenuDisplay } from '@/types/menu.types';

// GET /api/public/establishments/[slug]/menus - Récupérer les menus publics d'un établissement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Récupérer l'établissement par son slug
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: slug,
        status: 'approved' // Seuls les établissements approuvés
      },
      include: {
        owner: true,
        menus: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'établissement a un plan Premium (seuls les Premium ont des menus)
    if (establishment.owner.subscriptionPlan !== 'PREMIUM') {
      return NextResponse.json({
        success: true,
        menus: [],
        message: 'Aucun menu disponible pour cet établissement'
      });
    }

    // Transformer les menus pour l'affichage public
    const publicMenus: PublicMenuDisplay[] = establishment.menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      fileUrl: menu.fileUrl,
      fileName: menu.fileName,
      fileSize: menu.fileSize,
      order: menu.order
    }));

    return NextResponse.json({
      success: true,
      menus: publicMenus
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des menus publics:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
