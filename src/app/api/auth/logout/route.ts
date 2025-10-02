import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: true, message: 'Déjà déconnecté' });
    }

    // Ici on pourrait ajouter une logique de nettoyage côté serveur
    // Par exemple, invalider des tokens, nettoyer des caches, etc.
    
    console.log(`Utilisateur ${session.user.email} déconnecté`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Déconnexion réussie' 
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
