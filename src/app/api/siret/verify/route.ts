import { NextRequest, NextResponse } from 'next/server';
import { getINSEEService } from '@/lib/insee-service';

export async function POST(request: NextRequest) {
  try {
    const { siret } = await request.json();

    if (!siret) {
      return NextResponse.json(
        { error: 'Le numéro SIRET est requis' },
        { status: 400 }
      );
    }

    const inseeService = getINSEEService();
    const result = await inseeService.verifySiret(siret);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur API vérification SIRET:', error);
    return NextResponse.json(
      { 
        isValid: false, 
        error: 'Erreur interne du serveur' 
      },
      { status: 500 }
    );
  }
}
