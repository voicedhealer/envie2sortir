import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { validateFile, IMAGE_VALIDATION } from '@/lib/security';
import { generateAllImageVariants, cleanupTempFiles } from '@/lib/image-management';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const establishmentId = formData.get('establishmentId') as string;
    const imageType = formData.get('imageType') as string; // 'establishment', 'deals', 'menus'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!establishmentId) {
      return NextResponse.json({ error: 'ID de l\'établissement requis' }, { status: 400 });
    }

    // Validation du fichier
    const fileValidation = validateFile(file, IMAGE_VALIDATION);
    if (!fileValidation.valid) {
      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        ownerId: session.user.id 
      },
      select: { 
        id: true, 
        subscription: true,
        name: true
      }
    });

    if (!establishment) {
      return NextResponse.json({ 
        error: 'Établissement introuvable ou accès refusé' 
      }, { status: 404 });
    }

    // Créer le dossier temporaire
    const tempDir = join(process.cwd(), 'temp', 'uploads');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Sauvegarder le fichier temporaire
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const tempFileName = `${timestamp}_${randomString}.${extension}`;
    const tempFilePath = join(tempDir, tempFileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    // Créer le dossier de sortie selon le type
    const outputDir = join(process.cwd(), 'public', 'uploads', imageType);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    console.log(`🖼️  Upload optimisé pour ${establishment.name} (${imageType})`);

    // Générer toutes les variantes optimisées
    const result = await generateAllImageVariants(
      tempFilePath, 
      outputDir, 
      imageType as 'establishment' | 'deals' | 'menus'
    );

    // Nettoyer le fichier temporaire
    await cleanupTempFiles(tempFilePath);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Erreur lors de l\'optimisation de l\'image' 
      }, { status: 500 });
    }

    // Retourner les URLs des variantes
    const variants: Record<string, string> = {};
    for (const [variant, path] of Object.entries(result.variants)) {
      const fileName = path.split('/').pop() || '';
      variants[variant] = `/uploads/${imageType}/${fileName}`;
    }

    return NextResponse.json({ 
      success: true,
      variants,
      totalSavings: result.totalSavings,
      totalSavingsPercentage: result.totalSavingsPercentage,
      message: `Image optimisée avec ${result.totalSavingsPercentage.toFixed(1)}% d'économie d'espace`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload optimisé:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload de l\'image' 
    }, { status: 500 });
  }
}
