import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Trouver l'établissement par son slug
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Récupérer les commentaires de l'établissement
    const comments = await prisma.userComment.findMany({
      where: {
        establishmentId: establishment.id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}
