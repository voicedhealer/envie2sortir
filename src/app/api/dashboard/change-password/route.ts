import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation des données
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Mot de passe actuel et nouveau mot de passe requis' 
      }, { status: 400 });
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
      }, { status: 400 });
    }

    // Validation forte du mot de passe
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' 
      }, { status: 400 });
    }

    // Vérifier le mot de passe actuel avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (authError || !authData.user) {
      return NextResponse.json({ 
        error: 'Mot de passe actuel incorrect' 
      }, { status: 401 });
    }

    // Mettre à jour le mot de passe via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Erreur mise à jour mot de passe:', updateError);
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour du mot de passe' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Mot de passe mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du changement de mot de passe' 
    }, { status: 500 });
  }
}

