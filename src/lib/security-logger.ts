import { createClient as createClientAdmin } from '@supabase/supabase-js';

type SecurityEventType = 'failed_login' | 'blocked_request' | 'suspicious_activity' | 'rate_limit_exceeded';

interface LogSecurityEventParams {
  type: SecurityEventType;
  ipAddress: string;
  userAgent?: string;
  email?: string;
  details?: any;
}

/**
 * Log un événement de sécurité dans la base de données
 * Utilise le client admin pour contourner RLS
 */
export async function logSecurityEvent(params: LogSecurityEventParams): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes pour le logging de sécurité');
      return;
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error } = await adminClient
      .from('security_events')
      .insert({
        type: params.type,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        email: params.email,
        details: params.details || null
      });

    if (error) {
      console.error('❌ Erreur lors du logging de l\'événement de sécurité:', error);
    } else {
      console.log(`✅ Événement de sécurité loggé: ${params.type} depuis ${params.ipAddress}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du logging de l\'événement de sécurité:', error);
    // Ne pas faire échouer la requête principale si le logging échoue
  }
}

/**
 * Log une tentative de connexion échouée
 */
export async function logFailedLogin(email: string, ipAddress: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    type: 'failed_login',
    ipAddress,
    userAgent,
    email
  });
}

/**
 * Log une requête bloquée
 */
export async function logBlockedRequest(ipAddress: string, userAgent?: string, details?: any): Promise<void> {
  await logSecurityEvent({
    type: 'blocked_request',
    ipAddress,
    userAgent,
    details
  });
}

/**
 * Log une activité suspecte
 */
export async function logSuspiciousActivity(ipAddress: string, userAgent?: string, email?: string, details?: any): Promise<void> {
  await logSecurityEvent({
    type: 'suspicious_activity',
    ipAddress,
    userAgent,
    email,
    details
  });
}

/**
 * Log un dépassement de rate limit
 */
export async function logRateLimitExceeded(ipAddress: string, userAgent?: string, details?: any): Promise<void> {
  await logSecurityEvent({
    type: 'rate_limit_exceeded',
    ipAddress,
    userAgent,
    details
  });
}

