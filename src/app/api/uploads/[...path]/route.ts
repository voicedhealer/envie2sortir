import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', ...path);
    
    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Lire le fichier
    const fileBuffer = await readFile(filePath);
    
    // Déterminer le type MIME basé sur l'extension
    const extension = path[path.length - 1].split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Erreur lors du chargement du fichier:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
