import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'établissement du professionnel
    const establishment = await prisma.establishment.findUnique({
      where: {
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        subscription: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: 'Aucun établissement trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(establishment);
  } catch (error) {
    console.error('Error fetching establishment:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
