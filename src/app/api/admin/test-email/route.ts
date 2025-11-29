import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/test-email
 * Route de test pour vérifier l'envoi d'email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const testEmail = body.email || 'test@example.com';

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@envie2sortir.fr';

    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_API_KEY non configuré dans les variables d\'environnement',
        },
        { status: 500 }
      );
    }

    console.log('📧 [Test Email] Configuration:');
    console.log('  - From:', fromEmail);
    console.log('  - To:', testEmail);
    console.log('  - API Key:', resendApiKey.substring(0, 10) + '...');

    const resend = new Resend(resendApiKey);

    // Créer un email de test simple
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ff751f 0%, #ff1fa9 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #ff751f;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Test d'envoi d'email</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Ceci est un email de test pour vérifier que Resend fonctionne correctement avec votre configuration.</p>
            <p><strong>Configuration utilisée :</strong></p>
            <ul>
              <li>From: ${fromEmail}</li>
              <li>To: ${testEmail}</li>
              <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
            </ul>
            <p>Si vous recevez cet email, cela signifie que Resend est correctement configuré ! ✅</p>
            <p>Cordialement,<br>L'équipe Envie2Sortir</p>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '🧪 Test d\'envoi d\'email - Envie2Sortir',
      html: testHtml,
    });

    if (error) {
      console.error('❌ [Test Email] Erreur Resend:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Erreur lors de l\'envoi de l\'email',
          details: error,
        },
        { status: 500 }
      );
    }

    console.log('✅ [Test Email] Email envoyé avec succès:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès !',
      emailId: data?.id,
      from: fromEmail,
      to: testEmail,
    });
  } catch (error: any) {
    console.error('❌ [Test Email] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email de test',
      },
      { status: 500 }
    );
  }
}

