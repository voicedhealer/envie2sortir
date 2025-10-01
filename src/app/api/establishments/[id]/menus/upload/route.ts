import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { MENU_CONSTRAINTS } from '@/types/menu.types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/establishments/[id]/menus/upload - Uploader un menu PDF
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: establishmentId } = await params;

    // Vérifier que l'établissement appartient à l'utilisateur professionnel
    const establishment = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        owner: {
          email: session.user.email
        }
      },
      include: {
        owner: true,
        menus: true
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

    // Vérifier la limite de menus (5 maximum)
    if (establishment.menus.length >= MENU_CONSTRAINTS.MAX_FILES) {
      return NextResponse.json({ 
        error: `Limite de ${MENU_CONSTRAINTS.MAX_FILES} menus atteinte` 
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file || !name) {
      return NextResponse.json({ 
        error: 'Fichier et nom requis' 
      }, { status: 400 });
    }

    // Validation du fichier
    if (file.size > MENU_CONSTRAINTS.MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Maximum ${MENU_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    if (!MENU_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Format de fichier non supporté. Seuls les PDF sont acceptés.' 
      }, { status: 400 });
    }

    // Vérifier l'extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!MENU_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Extension de fichier non supportée. Seuls les PDF sont acceptés.' 
      }, { status: 400 });
    }

    // Créer le dossier de stockage s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'menus', establishmentId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const fileName = `${sanitizedName}_${timestamp}.pdf`;
    const filePath = join(uploadDir, fileName);
    const fileUrl = `/uploads/menus/${establishmentId}/${fileName}`;

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Déterminer l'ordre (dernier + 1)
    const lastMenu = await prisma.establishmentMenu.findFirst({
      where: { establishmentId },
      orderBy: { order: 'desc' }
    });
    const order = lastMenu ? lastMenu.order + 1 : 0;

    // Créer l'entrée en base de données
    const menu = await prisma.establishmentMenu.create({
      data: {
        name,
        description: description || null,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        order,
        isActive: true,
        establishmentId
      }
    });

    return NextResponse.json({
      success: true,
      menu: {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        fileUrl: menu.fileUrl,
        fileName: menu.fileName,
        fileSize: menu.fileSize,
        mimeType: menu.mimeType,
        order: menu.order,
        isActive: menu.isActive,
        establishmentId: menu.establishmentId,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du menu:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
