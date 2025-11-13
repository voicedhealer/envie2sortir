import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API pour vérifier si un email existe déjà dans la base de données
 * Utilisé pendant le formulaire d'inscription pour éviter les doublons
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email manquant ou invalide' 
      }, { status: 400 });
    }

    const supabase = createClient();
    
    // Nettoyer l'email (trim et lowercase)
    const cleanedEmail = email.trim().toLowerCase();
    
    // Vérifier si l'email existe déjà dans User
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('email', cleanedEmail)
      .single();

    // Vérifier si l'email existe déjà dans Professional
    const { data: existingProfessional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, first_name, last_name, company_name')
      .eq('email', cleanedEmail)
      .single();

    if (existingUser && !userError) {
      return NextResponse.json({ 
        exists: true,
        message: 'Cet email est déjà utilisé par un utilisateur.',
        userName: `${existingUser.first_name || ''} ${existingUser.last_name || ''}`.trim(),
        userType: 'user'
      });
    }

    if (existingProfessional && !professionalError) {
      return NextResponse.json({ 
        exists: true,
        message: 'Cet email est déjà utilisé par un professionnel.',
        userName: `${existingProfessional.first_name || ''} ${existingProfessional.last_name || ''}`.trim(),
        companyName: existingProfessional.company_name,
        userType: 'professional'
      });
    }

    return NextResponse.json({ 
      exists: false,
      message: 'Cet email est disponible.' 
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification de l\'email' 
    }, { status: 500 });
  }
}

