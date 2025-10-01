import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/dashboard?error=InvalidToken', request.url));
    }

    // Trouver la demande de modification avec ce token
    const updateRequest = await prisma.professionalUpdateRequest.findFirst({
      where: {
        verificationToken: token,
        status: 'pending',
        fieldName: 'email'
      },
      include: {
        professional: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!updateRequest) {
      return NextResponse.redirect(new URL('/dashboard?error=RequestNotFound', request.url));
    }

    // Vérifier que l'email n'a pas déjà été vérifié
    if (updateRequest.isEmailVerified) {
      return NextResponse.redirect(new URL('/dashboard?success=EmailAlreadyVerified', request.url));
    }

    // Marquer l'email comme vérifié
    await prisma.professionalUpdateRequest.update({
      where: { id: updateRequest.id },
      data: { isEmailVerified: true }
    });

    // Rediriger vers le dashboard avec un message de succès
    return NextResponse.redirect(new URL('/dashboard?success=EmailVerified', request.url));

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.redirect(new URL('/dashboard?error=VerificationFailed', request.url));
  }
}

