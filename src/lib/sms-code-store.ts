// Stockage des codes SMS dans Supabase
// Utilise la table sms_verification_codes pour un stockage persistant
// qui fonctionne même avec des workers Next.js séparés

async function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
  return createClientAdmin(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
}

export async function storeSmsCode(userId: string, code: string, expiry: Date) {
  try {
    const adminClient = await getAdminClient();
    
    // Supprimer les anciens codes pour cet utilisateur
    await adminClient
      .from('sms_verification_codes')
      .delete()
      .eq('user_id', userId);
    
    // Insérer le nouveau code
    const { error } = await adminClient
      .from('sms_verification_codes')
      .insert({
        user_id: userId,
        code: code,
        expires_at: expiry.toISOString()
      });
    
    if (error) {
      console.error('❌ [SMS Store] Erreur stockage code:', error);
      throw error;
    }
    
    console.log('💾 [SMS Store] Code stocké dans Supabase pour userId:', userId, 'code:', code);
    console.log('⏰ [SMS Store] Expiration:', expiry.toISOString());
  } catch (error) {
    console.error('❌ [SMS Store] Erreur lors du stockage:', error);
    throw error;
  }
}

export async function getSmsCode(userId: string): Promise<{ code: string; expiry: Date } | undefined> {
  try {
    const adminClient = await getAdminClient();
    
    const { data, error } = await adminClient
      .from('sms_verification_codes')
      .select('code, expires_at')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString()) // Seulement les codes non expirés
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Aucun code trouvé
        console.log('🔍 [SMS Store] Aucun code trouvé pour userId:', userId);
        return undefined;
      }
      console.error('❌ [SMS Store] Erreur récupération code:', error);
      throw error;
    }
    
    if (!data) {
      console.log('🔍 [SMS Store] Aucun code trouvé pour userId:', userId);
      return undefined;
    }
    
    console.log('✅ [SMS Store] Code trouvé pour userId:', userId);
    return {
      code: data.code,
      expiry: new Date(data.expires_at)
    };
  } catch (error) {
    console.error('❌ [SMS Store] Erreur lors de la récupération:', error);
    return undefined;
  }
}

export async function deleteSmsCode(userId: string) {
  try {
    const adminClient = await getAdminClient();
    
    const { error } = await adminClient
      .from('sms_verification_codes')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ [SMS Store] Erreur suppression code:', error);
      throw error;
    }
    
    console.log('🗑️ [SMS Store] Code supprimé pour userId:', userId);
  } catch (error) {
    console.error('❌ [SMS Store] Erreur lors de la suppression:', error);
    throw error;
  }
}

export async function getAllStoredCodes(): Promise<string[]> {
  try {
    const adminClient = await getAdminClient();
    
    const { data, error } = await adminClient
      .from('sms_verification_codes')
      .select('user_id')
      .gt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('❌ [SMS Store] Erreur récupération codes:', error);
      return [];
    }
    
    return (data || []).map((row: any) => row.user_id);
  } catch (error) {
    console.error('❌ [SMS Store] Erreur lors de la récupération de tous les codes:', error);
    return [];
  }
}

