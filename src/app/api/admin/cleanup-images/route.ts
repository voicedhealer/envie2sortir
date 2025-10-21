import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { cleanupOrphanedFiles, cleanupOldFiles } from '@/lib/image-cleanup';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier que l'utilisateur est admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { type = 'orphaned', daysOld = 30 } = body;

    let result;

    if (type === 'orphaned') {
      result = await cleanupOrphanedFiles();
    } else if (type === 'old') {
      result = await cleanupOldFiles(daysOld);
    } else {
      return NextResponse.json({ error: 'Type de nettoyage invalide' }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      deletedCount: result.deletedCount,
      freedSpace: result.freedSpace,
      message: `${result.deletedCount} fichiers supprimés, ${(result.freedSpace / 1024 / 1024).toFixed(2)} MB libérés`
    });

  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors du nettoyage des images' 
    }, { status: 500 });
  }
}

