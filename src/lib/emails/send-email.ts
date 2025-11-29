/**
 * Fonction utilitaire pour envoyer des emails via Resend
 * Fallback en console.log en développement
 */

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactElement;
}

/**
 * Envoie un email via Resend
 * En développement, log dans la console
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@envie2sortir.fr';

  // En développement ou si Resend n'est pas configuré, logger dans la console
  if (!resendApiKey || process.env.NODE_ENV === 'development') {
    console.log('📧 [Email] Envoi simulé:');
    console.log('  To:', options.to);
    console.log('  Subject:', options.subject);
    console.log('  HTML:', options.html?.substring(0, 100) + '...');
    return { success: true };
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      react: options.react,
    });

    if (error) {
      console.error('❌ [Email] Erreur Resend:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Email] Email envoyé via Resend:', data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('❌ [Email] Erreur envoi email:', error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
}

