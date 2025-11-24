import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/dashboard?error=InvalidToken', request.url));
    }

    const supabase = await createClient();

    // Trouver la demande de modification avec ce token
    const { data: updateRequest, error: requestError } = await supabase
      .from('professional_update_requests')
      .select(`
        *,
        professional:professionals!professional_update_requests_professional_id_fkey (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('verification_token', token)
      .eq('status', 'pending')
      .eq('field_name', 'email')
      .single();

    if (requestError || !updateRequest) {
      return NextResponse.redirect(new URL('/dashboard?error=RequestNotFound', request.url));
    }

    // Vérifier que l'email n'a pas déjà été vérifié
    if (updateRequest.is_email_verified) {
      return NextResponse.redirect(new URL('/dashboard?success=EmailAlreadyVerified', request.url));
    }

    // Marquer l'email comme vérifié
    const { error: updateError } = await supabase
      .from('professional_update_requests')
      .update({ is_email_verified: true })
      .eq('id', updateRequest.id);

    if (updateError) {
      console.error('Erreur mise à jour demande:', updateError);
      return NextResponse.redirect(new URL('/dashboard?error=VerificationFailed', request.url));
    }

    // Rediriger vers le dashboard avec un message de succès
    return NextResponse.redirect(new URL('/dashboard?success=EmailVerified', request.url));

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.redirect(new URL('/dashboard?error=VerificationFailed', request.url));
  }
}

