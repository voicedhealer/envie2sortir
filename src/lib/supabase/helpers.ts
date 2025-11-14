import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Récupère l'utilisateur actuel (user ou professional)
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  // Debug: vérifier les cookies
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'));
  console.log('🍪 Cookies Supabase trouvés:', supabaseCookies.length, supabaseCookies.map(c => c.name));
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  console.log('👤 getUser result:', {
    hasUser: !!authUser,
    userId: authUser?.id,
    error: authError?.message
  });
  
  if (authError || !authUser) {
    console.log('❌ Pas d\'utilisateur authentifié:', authError?.message || 'No user');
    return null;
  }
  
  // Vérifier si c'est un user
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  
  console.log('🔍 Recherche dans users:', {
    found: !!userData,
    error: userError?.message,
    userId: authUser.id
  });
  
  if (userData) {
    console.log('✅ Utilisateur trouvé dans users');
    return {
      ...userData,
      userType: 'user' as const,
      authUser
    };
  }
  
  // Vérifier si c'est un professional
  // Récupérer d'abord le professional, puis l'établissement séparément
  const { data: professionalData, error: professionalError } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  
  console.log('🔍 Recherche dans professionals:', {
    found: !!professionalData,
    error: professionalError?.message,
    userId: authUser.id
  });
  
  if (professionalData) {
    // Récupérer l'établissement séparément
    const { data: establishment } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', professionalData.id)
      .maybeSingle();
    
    console.log('✅ Professionnel trouvé, établissement:', establishment?.id || 'aucun');
    
    return {
      ...professionalData,
      userType: 'professional' as const,
      establishmentId: establishment?.id || null,
      authUser
    };
  }
  
  console.log('❌ Utilisateur non trouvé dans users ni professionals');
  return null;
}

/**
 * Vérifie si l'utilisateur est un admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Vérifie si l'utilisateur est un professionnel
 */
export async function isProfessional(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.userType === 'professional';
}

/**
 * Récupère l'établissement d'un professionnel
 */
export async function getProfessionalEstablishment(professionalId: string) {
  console.log('🔍 Recherche établissement pour professionalId:', professionalId);
  
  // Utiliser le client admin pour contourner RLS
  // On sait déjà que l'utilisateur est authentifié et est le propriétaire
  const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    return null;
  }
  
  const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const { data, error } = await adminClient
    .from('establishments')
    .select('*')
    .eq('owner_id', professionalId)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error fetching establishment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return null;
  }
  
  console.log('🏢 Établissement trouvé:', data ? `ID: ${data.id}, Name: ${data.name}` : 'aucun');
  
  return data;
}

/**
 * Vérifie si l'utilisateur est propriétaire d'un établissement
 */
export async function isEstablishmentOwner(establishmentId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user || user.userType !== 'professional') {
    return false;
  }
  
  const establishment = await getProfessionalEstablishment(user.id);
  return establishment?.id === establishmentId;
}

/**
 * Helper pour les requêtes avec gestion d'erreur
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Query error:', error);
    return { data: null, error };
  }
}

/**
 * Upload un fichier vers Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || false
    });
  
  if (error) {
    console.error('Upload error:', error);
    return { data: null, error };
  }
  
  // Récupérer l'URL publique
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return {
    data: {
      path: data.path,
      url: urlData.publicUrl
    },
    error: null
  };
}

/**
 * Supprime un fichier de Supabase Storage
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Delete error:', error);
    return { error };
  }
  
  return { data, error: null };
}

/**
 * Récupère l'URL publique d'un fichier
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Requiert qu'un utilisateur soit authentifié et soit un professionnel avec un établissement
 * (Équivalent de requireEstablishment pour Prisma)
 */
export async function requireEstablishment() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentification requise");
  }
  
  if (user.userType !== 'professional') {
    throw new Error("Accès professionnel requis");
  }
  
  // Si l'utilisateur n'a pas d'establishmentId, chercher son établissement
  if (!user.establishmentId) {
    const establishment = await getProfessionalEstablishment(user.id);
    
    if (!establishment) {
      throw new Error("Aucun établissement associé à ce compte");
    }
    
    return {
      ...user,
      establishmentId: establishment.id
    };
  }
  
  return user;
}

