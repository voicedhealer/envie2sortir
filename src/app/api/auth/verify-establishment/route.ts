/**
 * API Route pour vérifier si un utilisateur a un établissement
 * 
 * Cette route est utilisée côté client pour vérifier
 * si un utilisateur Professional a un établissement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/helpers';
import { createClient } from '@/lib/supabase/server';
import { getProfessionalEstablishment } from '@/lib/supabase/helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un professionnel
    const supabase = await createClient();
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!professional) {
      return NextResponse.json({ 
        hasEstablishment: false, 
        error: 'Utilisateur non professionnel' 
      });
    }

    // Récupérer l'établissement du professionnel
    const establishment = await getProfessionalEstablishment(professional.id);
    
    return NextResponse.json({ 
      hasEstablishment: !!establishment,
      establishment: establishment ? {
        id: establishment.id,
        name: establishment.name,
        subscription: establishment.subscription
      } : null
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'établissement:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
