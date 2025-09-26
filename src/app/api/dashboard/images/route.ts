import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: 'Aucun établissement associé' }, { status: 400 });
    }

    // Récupérer l'établissement pour vérifier l'abonnement
    const establishment = await prisma.establishment.findUnique({
      where: { id: session.user.establishmentId },
      select: { 
        id: true, 
        subscription: true,
        images: {
          select: { id: true }
        }
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier les restrictions selon l'abonnement
    const maxImages = establishment.subscription === 'PREMIUM' ? 10 : 1;
    const currentImageCount = establishment.images.length;

    if (currentImageCount >= maxImages) {
      return NextResponse.json({ 
        error: `Limite d'images atteinte. Maximum ${maxImages} image(s) pour un abonnement ${establishment.subscription}`,
        currentCount: currentImageCount,
        maxAllowed: maxImages
      }, { status: 403 });
    }

    // Traiter le fichier uploadé
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Formats acceptés: JPEG, PNG, WebP, GIF' 
      }, { status: 400 });
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Taille maximum: 5MB' 
      }, { status: 400 });
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    // Sauvegarder en base de données
    const isFirstImage = currentImageCount === 0;
    
    const image = await prisma.image.create({
      data: {
        url: imageUrl,
        altText: file.name,
        isPrimary: isFirstImage,
        establishmentId: establishment.id
      }
    });

    // Si c'est la première image, la définir comme image principale de l'établissement
    if (isFirstImage) {
      await prisma.establishment.update({
        where: { id: establishment.id },
        data: { imageUrl: imageUrl }
      });
    }

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        url: image.url,
        altText: image.altText,
        isPrimary: image.isPrimary
      },
      message: `Image ajoutée avec succès. ${currentImageCount + 1}/${maxImages} images utilisées.`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload d\'image:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload de l\'image' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professionnel
    if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    if (!session.user.establishmentId) {
      return NextResponse.json({ error: 'Aucun établissement associé' }, { status: 400 });
    }

    // Récupérer les images de l'établissement
    const establishment = await prisma.establishment.findUnique({
      where: { id: session.user.establishmentId },
      select: {
        id: true,
        name: true,
        subscription: true,
        imageUrl: true,
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        subscription: establishment.subscription,
        imageUrl: establishment.imageUrl,
        images: establishment.images
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des images' 
    }, { status: 500 });
  }
}
