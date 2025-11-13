import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Récupère l'utilisateur actuel (user ou professional)
 */
export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    return null;
  }
  
  // Vérifier si c'est un user
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();
  
  if (userData) {
    return {
      ...userData,
      userType: 'user' as const,
      authUser
    };
  }
  
  // Vérifier si c'est un professional
  const { data: professionalData } = await supabase
    .from('professionals')
    .select(`
      *,
      establishment:establishments(*)
    `)
    .eq('id', authUser.id)
    .single();
  
  if (professionalData) {
    return {
      ...professionalData,
      userType: 'professional' as const,
      establishmentId: professionalData.establishment?.[0]?.id || null,
      authUser
    };
  }
  
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
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('owner_id', professionalId)
    .single();
  
  if (error) {
    console.error('Error fetching establishment:', error);
    return null;
  }
  
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
  const supabase = createClient();
  
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
  const supabase = createClient();
  
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

