import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * ✅ CORRECTION : Fonction unifiée pour détecter le rôle utilisateur
 * Priorise TOUJOURS app_metadata.role sur user_metadata.role
 * (app_metadata ne peut être modifié que par Supabase Admin)
 */
export function getUserRole(user: User | null | undefined): 'admin' | 'pro' | 'user' {
  if (!user) return 'user';
  
  // ✅ TOUJOURS prioriser app_metadata (seul Supabase Admin peut le modifier)
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  
  // Admin via app_metadata a priorité absolue
  if (appRole === 'admin') return 'admin';
  if (appRole === 'pro' || userRole === 'pro') return 'pro';
  
  return 'user';
}

/**
 * Récupère l'utilisateur actuel (user ou professional)
 */
export async function getCurrentUser() {
  // Pendant le build, retourner null pour éviter les erreurs
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build';
  
  if (isBuildTime) {
    console.warn('⚠️ getCurrentUser called during build - returning null');
    return null;
  }

  const supabase = await createClient();
  
  // Debug: vérifier les cookies
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'));
  console.log('🍪 Cookies Supabase trouvés:', supabaseCookies.length, supabaseCookies.map(c => c.name));
  
  // Afficher tous les cookies pour debug
  if (supabaseCookies.length === 0) {
    console.log('⚠️ Aucun cookie Supabase trouvé. Tous les cookies:', allCookies.map(c => c.name).slice(0, 10));
  }
  
  let authUser, authError;
  try {
    const result = await supabase.auth.getUser();
    authUser = result.data?.user;
    authError = result.error;
  } catch (error: any) {
    // Capturer les erreurs de refresh token invalide
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('Invalid Refresh Token')) {
      console.log('💡 Refresh token invalide - session expirée');
      throw error; // Propager l'erreur pour qu'elle soit gérée par l'appelant
    }
    authError = error;
  }
  
  console.log('👤 getUser result:', {
    hasUser: !!authUser,
    userId: authUser?.id,
    error: authError?.message,
    errorCode: authError?.status
  });
  
  if (authError || !authUser) {
    console.log('❌ Pas d\'utilisateur authentifié:', authError?.message || 'No user');
    // Si l'erreur indique que la session est manquante, c'est normal si les cookies ne sont pas définis
    if (authError?.message?.includes('session') || authError?.message?.includes('JWT')) {
      console.log('💡 Session Supabase manquante - les cookies ne sont peut-être pas correctement définis');
    }
    // Si c'est une erreur de refresh token, la propager
    if (authError?.message?.includes('Refresh Token') || authError?.message?.includes('Invalid Refresh Token')) {
      throw authError;
    }
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
 * ✅ Utilise les métadonnées JWT au lieu de lire la table users
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  
  // Récupérer l'utilisateur directement depuis l'auth (pas besoin de lire users)
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return false;
  }
  
  // ✅ CORRECTION : Utiliser la fonction unifiée getUserRole
  return getUserRole(user) === 'admin';
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
 * ✅ Utilise RLS - l'utilisateur doit être authentifié et propriétaire
 */
export async function getProfessionalEstablishment(professionalId: string) {
  console.log('🔍 Recherche établissement pour professionalId:', professionalId);
  
  // ✅ Utiliser le client normal - RLS vérifie automatiquement que l'utilisateur est propriétaire
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  const { data, error } = await supabase
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
 * Upload un fichier vers Supabase Storage (utilise le client standard)
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
 * Upload un fichier vers Supabase Storage avec le client admin (contourne RLS)
 * À utiliser côté serveur uniquement pour les opérations nécessitant des privilèges élevés
 */
export async function uploadFileAdmin(
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer | Buffer,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) {
  const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      data: null,
      error: new Error('Variables d\'environnement Supabase manquantes')
    };
  }
  
  const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const resolvedContentType =
    options?.contentType ||
    (typeof (file as any)?.type === 'string' ? (file as any).type : 'application/octet-stream');

  const uploadPayload =
    file instanceof ArrayBuffer || file instanceof Buffer ? file : file;

  const { data, error } = await adminClient.storage
    .from(bucket)
    // @ts-expect-error - supabase-js accepte Buffer/ArrayBuffer côté serveur
    .upload(path, uploadPayload, {
      cacheControl: options?.cacheControl || '3600',
      contentType: resolvedContentType,
      upsert: options?.upsert || false
    });
  
  if (error) {
    console.error('Upload error (admin):', error);
    return { data: null, error };
  }
  
  // Récupérer l'URL publique
  const { data: urlData } = adminClient.storage
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
  // Pendant le build, retourner un objet mock pour éviter les erreurs
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build' ||
                      (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  if (isBuildTime) {
    console.warn('⚠️ requireEstablishment called during build - returning mock object');
    return {
      id: 'build-mock-id',
      email: 'build@mock.com',
      userType: 'professional' as const,
      establishmentId: 'build-mock-establishment-id',
      authUser: null as any
    };
  }

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

