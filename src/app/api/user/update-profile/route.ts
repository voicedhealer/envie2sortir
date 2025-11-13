import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.userType !== 'user') {
      return NextResponse.json({ error: 'Non authentifié ou accès refusé' }, { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();
    const { firstName, lastName, email, currentPassword, newPassword } = body;

    console.log('🔍 API - Données reçues:', { firstName, lastName, email });

    // Si changement de mot de passe, vérifier l'ancien mot de passe avec Supabase Auth
    if (newPassword && currentPassword) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (authError || !authData.user) {
        return NextResponse.json({ 
          error: 'Mot de passe actuel incorrect' 
        }, { status: 400 });
      }
    }

    // Préparer les données à mettre à jour dans la table users
    const updateData: any = {};
    
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (email !== undefined) updateData.email = email;

    // Mettre à jour l'utilisateur dans la table users
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, email, first_name, last_name, role')
      .single();

    if (updateError || !updatedUser) {
      console.error('Erreur mise à jour utilisateur:', updateError);
      
      if (updateError?.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'Cet email est déjà utilisé par un autre compte' 
        }, { status: 400 });
      }

      return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
    }

    // Si changement de mot de passe, mettre à jour via Supabase Auth
    if (newPassword) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passwordError) {
        console.error('Erreur mise à jour mot de passe:', passwordError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du mot de passe' }, { status: 500 });
      }
    }

    // Convertir snake_case -> camelCase
    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role
    };

    console.log('✅ API - Utilisateur mis à jour:', formattedUser);

    return NextResponse.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      user: formattedUser
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Cet email est déjà utilisé par un autre compte' 
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
