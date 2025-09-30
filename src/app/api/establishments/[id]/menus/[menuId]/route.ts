import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

// DELETE /api/establishments/[id]/menus/[menuId] - Supprimer un menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; menuId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: establishmentId, menuId } = params;

    // Vérifier que l'établissement appartient à l'utilisateur professionnel
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        owner: {
          email: session.user.email
        }
      },
      include: {
        owner: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a un plan Premium
    if (establishment.owner.subscriptionPlan !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Récupérer le menu à supprimer
    const menu = await prisma.establishmentMenu.findFirst({
      where: {
        id: menuId,
        establishmentId: establishmentId
      }
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu non trouvé' }, { status: 404 });
    }

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), 'public', menu.fileUrl);
      await unlink(filePath);
    } catch (fileError) {
      console.warn('Impossible de supprimer le fichier physique:', fileError);
      // On continue même si le fichier n'existe pas
    }

    // Supprimer l'entrée en base de données
    await prisma.establishmentMenu.delete({
      where: {
        id: menuId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Menu supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du menu:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/establishments/[id]/menus/[menuId] - Mettre à jour un menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; menuId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: establishmentId, menuId } = params;
    const body = await request.json();
    const { name, description, order, isActive } = body;

    // Vérifier que l'établissement appartient à l'utilisateur professionnel
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        owner: {
          email: session.user.email
        }
      },
      include: {
        owner: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a un plan Premium
    if (establishment.owner.subscriptionPlan !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Vérifier que le menu existe
    const existingMenu = await prisma.establishmentMenu.findFirst({
      where: {
        id: menuId,
        establishmentId: establishmentId
      }
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu non trouvé' }, { status: 404 });
    }

    // Mettre à jour le menu
    const updatedMenu = await prisma.establishmentMenu.update({
      where: {
        id: menuId
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      success: true,
      menu: {
        id: updatedMenu.id,
        name: updatedMenu.name,
        description: updatedMenu.description,
        fileUrl: updatedMenu.fileUrl,
        fileName: updatedMenu.fileName,
        fileSize: updatedMenu.fileSize,
        mimeType: updatedMenu.mimeType,
        order: updatedMenu.order,
        isActive: updatedMenu.isActive,
        establishmentId: updatedMenu.establishmentId,
        createdAt: updatedMenu.createdAt,
        updatedAt: updatedMenu.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
