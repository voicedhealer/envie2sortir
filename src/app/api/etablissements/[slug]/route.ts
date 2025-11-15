/**
 * API ROUTE HANDLER POUR LA GESTION DES ÉTABLISSEMENTS
 * 
 * Fichier : src/app/api/etablissements/[slug]/route.ts
 * 
 * Description :
 * - Gère la mise à jour et suppression d'établissements via leur slug unique
 * - Compatible Next.js 15 avec gestion asynchrone des paramètres
 * - Validation complète des données et gestion d'erreurs robuste
 * 
 * Endpoints supportés :
 * - PUT /api/etablissements/[slug] - Mise à jour d'un établissement
 * - DELETE /api/etablissements/[slug] - Suppression d'un établissement
 * 
 * Sécurité :
 * - Validation des champs requis
 * - Vérification d'existence avant modification
 * - Protection contre les doublons de slug
 * - Gestion des erreurs avec codes HTTP appropriés
 */



import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, requireEstablishment } from "@/lib/supabase/helpers";

/**
 * Types pour la validation des données
 */
interface UpdateEstablishmentData {
  name?: string;
  slug?: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  imageUrl?: string;
  activities?: string[] | string;
  services?: string[] | string;
  ambiance?: string[] | string;
  paymentMethods?: string[] | string;
  horairesOuverture?: any;
  priceMin?: number;
  priceMax?: number;
  informationsPratiques?: string[];
  subscription?: 'FREE' | 'PREMIUM';
  status?: 'approved' | 'pending' | 'rejected';
  hours?: {
    monday?: { open: string; close: string; isOpen: boolean };
    tuesday?: { open: string; close: string; isOpen: boolean };
    wednesday?: { open: string; close: string; isOpen: boolean };
    thursday?: { open: string; close: string; isOpen: boolean };
    friday?: { open: string; close: string; isOpen: boolean };
    saturday?: { open: string; close: string; isOpen: boolean };
    sunday?: { open: string; close: string; isOpen: boolean };
  };
  tags?: string[];
  envieTags?: string[];
}

/**
 * Fonction utilitaire pour générer un slug URL-friendly
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Keep only letters, numbers, spaces, hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Fonction utilitaire pour valider les coordonnées GPS
 */
function isValidCoordinates(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return true; // Optional coordinates
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

/**
 * PUT - Mise à jour d'un établissement
 * 
 * @param request - NextRequest contenant les données à mettre à jour
 * @param params - Paramètres de route contenant le slug (Promise en Next.js 15+)
 * 
 * Body JSON attendu :
 * {
 *   name?: string,           // Nom de l'établissement
 *   slug?: string,           // Slug personnalisé (optionnel)
 *   description?: string,    // Description
 *   address?: string,        // Adresse complète
 *   latitude?: number,       // Coordonnée GPS latitude (-90 à 90)
 *   longitude?: number,      // Coordonnée GPS longitude (-180 à 180)
 *   phone?: string,          // Numéro de téléphone
 *   email?: string,          // Email de contact
 *   website?: string,        // URL du site web
 *   instagram?: string,      // Compte Instagram
 *   facebook?: string,       // URL page Facebook
 *   category?: string,       // Catégorie (doit correspondre à l'enum)
 *   services?: string[],     // Array des services proposés
 *   ambiance?: string[],     // Array des ambiances
 *   status?: string,         // Statut : 'approved', 'pending', 'rejected'
 *   hours?: object           // Horaires d'ouverture par jour de la semaine
 * }
 * 
 * Responses :
 * - 200 : Établissement mis à jour avec succès
 * - 400 : Données invalides ou slug déjà existant
 * - 404 : Établissement non trouvé
 * - 500 : Erreur serveur
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // ✅ Correction Next.js 15
) {
  try {
    // ✅ Await params pour Next.js 15
    const { slug } = await params;
    
    // Vérifier l'authentification et les permissions
    const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    let user;
    if (isDevelopment) {
      // En développement, utiliser un utilisateur factice
      console.log('🔓 Authentification désactivée en développement');
      user = {
        id: 'dev-user',
        email: 'dev@example.com',
        role: 'pro',
        userType: 'professional' as const,
        establishmentId: 'dev-establishment'
      };
    } else {
      try {
        user = await requireEstablishment();
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || "Authentification requise" },
          { status: 401 }
        );
      }
    }
    
    console.log('🔍 Debug permissions:', {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      userEstablishmentId: user.establishmentId
    });
    
    const body: UpdateEstablishmentData = await request.json();
    
    // Validation des champs requis (seulement si on met à jour les infos principales)
    const isUpdatingMainInfo = body.name || body.address;
    if (isUpdatingMainInfo && (!body.name || !body.address)) {
      return NextResponse.json(
        { 
          error: "Validation échouée",
          details: "Nom et adresse sont requis pour la mise à jour des informations principales",
          missing_fields: {
            name: !body.name,
            address: !body.address
          }
        },
        { status: 400 }
      );
    }

    // Validation des coordonnées GPS si fournies
    if (!isValidCoordinates(body.latitude, body.longitude)) {
      return NextResponse.json(
        { 
          error: "Coordonnées GPS invalides",
          details: "Latitude doit être entre -90 et 90, longitude entre -180 et 180"
        },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour bypass RLS (route utilisée par les professionnels authentifiés)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ [PUT Establishment] Clés Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabase = createClientAdmin(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Vérifier si l'établissement existe
    console.log('🔍 Recherche d\'établissement avec slug:', slug);
    const { data: existing, error: existingError } = await supabase
      .from('establishments')
      .select(`
        *,
        owner:professionals!establishments_owner_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('slug', slug)
      .single();
    
    console.log('🔍 Établissement trouvé:', existing ? 'OUI' : 'NON');
    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }
    
    console.log('🔍 Debug establishment:', {
      establishmentId: existing.id,
      establishmentName: existing.name,
      establishmentOwnerId: existing.owner_id,
      ownerEmail: existing.owner?.email,
      ownerName: existing.owner ? `${existing.owner.first_name} ${existing.owner.last_name}` : null
    });

    // Vérifier que l'utilisateur est le propriétaire de l'établissement
    console.log('🔍 Debug permissions:', {
      establishmentOwnerId: existing.owner_id,
      currentUserId: user.id,
      userEmail: user.email,
      userRole: user.role
    });
    
    if (!isDevelopment && existing.owner_id !== user.id) {
      console.error('❌ Accès refusé:', {
        establishmentOwnerId: existing.owner_id,
        currentUserId: user.id,
        establishmentName: existing.name
      });
      return NextResponse.json(
        { error: "Accès refusé - Seul le propriétaire peut modifier cet établissement" },
        { status: 403 }
      );
    }

    // Générer un nouveau slug si le nom a changé et aucun slug personnalisé fourni
    let newSlug = slug;
    if (body.name && body.name !== existing.name && !body.slug) {
      newSlug = generateSlug(body.name);
    } else if (body.slug) {
      newSlug = body.slug;
    }

    // Vérifier si le nouveau slug existe déjà (sauf pour l'établissement actuel)
    if (newSlug !== slug) {
      const { data: slugExists } = await supabase
        .from('establishments')
        .select('id')
        .eq('slug', newSlug)
        .single();
      
      if (slugExists) {
        return NextResponse.json(
          { 
            error: "Slug déjà utilisé",
            details: `Un établissement avec le slug "${newSlug}" existe déjà`,
            suggested_slug: `${newSlug}-${Date.now()}`
          },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour (seulement les champs fournis)
    // Convertir camelCase vers snake_case pour Supabase
    const updateData: any = {};
    
    // Mettre à jour le slug si nécessaire
    if (newSlug !== slug) {
      updateData.slug = newSlug;
    }
    
    // Mettre à jour seulement les champs fournis (conversion camelCase -> snake_case)
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.postalCode !== undefined) updateData.postal_code = body.postalCode;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.facebook !== undefined) updateData.facebook = body.facebook;
    if (body.tiktok !== undefined) updateData.tiktok = body.tiktok;
    if (body.youtube !== undefined) updateData.youtube = body.youtube;
    if (body.whatsappPhone !== undefined) updateData.whatsapp_phone = body.whatsappPhone;
    if (body.messengerUrl !== undefined) updateData.messenger_url = body.messengerUrl;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priceMin !== undefined) updateData.price_min = body.priceMin;
    if (body.priceMax !== undefined) updateData.price_max = body.priceMax;
    if (body.informationsPratiques !== undefined) updateData.informations_pratiques = typeof body.informationsPratiques === 'string' ? body.informationsPratiques : JSON.stringify(body.informationsPratiques);
    if (body.subscription !== undefined) updateData.subscription = body.subscription;

    // Ajouter les coordonnées GPS si fournies
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;

    // Gérer les activités (array ou JSON string)
    if (body.activities) {
      updateData.activities = Array.isArray(body.activities) 
        ? JSON.stringify(body.activities)
        : body.activities;
    }

    // Gérer les services et ambiance (array ou JSON string)
    if (body.services) {
      updateData.services = Array.isArray(body.services) 
        ? JSON.stringify(body.services)
        : body.services;
    }
    if (body.ambiance) {
      updateData.ambiance = Array.isArray(body.ambiance)
        ? JSON.stringify(body.ambiance)
        : body.ambiance;
    }

    // Gérer les moyens de paiement (array ou JSON string)
    if (body.paymentMethods) {
      updateData.payment_methods = Array.isArray(body.paymentMethods) 
        ? JSON.stringify(body.paymentMethods)
        : body.paymentMethods;
    }

    // Gérer les horaires d'ouverture
    if (body.horairesOuverture) {
      updateData.horaires_ouverture = typeof body.horairesOuverture === 'string' ? body.horairesOuverture : JSON.stringify(body.horairesOuverture);
    } else if (body.hours) {
      updateData.horaires_ouverture = JSON.stringify(body.hours);
    }
    
    // Gérer les envie tags (stockés dans le champ envieTags)
    if (body.envieTags) {
      updateData.envie_tags = Array.isArray(body.envieTags) 
        ? JSON.stringify(body.envieTags)
        : body.envieTags;
    }

    // Mettre à jour l'établissement (sans relations pour éviter les problèmes)
    const { data: establishment, error: updateError } = await supabase
      .from('establishments')
      .update(updateData)
      .eq('slug', slug)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ [PUT Establishment] Erreur mise à jour établissement:', {
        error: updateError,
        code: updateError?.code,
        message: updateError?.message,
        details: updateError?.details,
        hint: updateError?.hint,
        slug,
        updateDataKeys: Object.keys(updateData)
      });
      return NextResponse.json(
        { 
          error: "Erreur lors de la mise à jour",
          details: updateError.message,
          code: updateError.code
        },
        { status: 500 }
      );
    }

    // Gérer les tags après la mise à jour de l'établissement
    if (body.tags && Array.isArray(body.tags)) {
      // Supprimer les anciens tags
      await supabase
        .from('etablissement_tags')
        .delete()
        .eq('etablissement_id', establishment.id);

      // Créer les nouveaux tags
      if (body.tags.length > 0) {
        const tagsToCreate = body.tags.map(tag => ({
          etablissement_id: establishment.id,
          tag: tag.toLowerCase(),
          type_tag: 'manuel',
          poids: 10
        }));
        
        await supabase
          .from('etablissement_tags')
          .insert(tagsToCreate);
      }
    }

    // Récupérer les données supplémentaires séparément
    const [favoritesCountResult, likesCountResult, commentsCountResult, imagesResult, eventsResult, ownerResult] = await Promise.all([
      supabase.from('user_favorites').select('id', { count: 'exact', head: true }).eq('establishment_id', establishment.id),
      supabase.from('user_likes').select('id', { count: 'exact', head: true }).eq('establishment_id', establishment.id),
      supabase.from('user_comments').select('id', { count: 'exact', head: true }).eq('establishment_id', establishment.id),
      supabase.from('images').select('id, url, alt_text, is_primary, is_card_image, ordre').eq('establishment_id', establishment.id).order('ordre', { ascending: true }),
      supabase.from('events').select('id, title, start_date, end_date').eq('establishment_id', establishment.id).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }).limit(5),
      supabase.from('professionals').select('id, first_name, last_name, email').eq('id', establishment.owner_id).single()
    ]);

    const favoritesCount = favoritesCountResult.count || 0;
    const likesCount = likesCountResult.count || 0;
    const commentsCount = commentsCountResult.count || 0;
    const images = imagesResult.data || [];
    const sortedEvents = eventsResult.data || [];
    const owner = ownerResult.data;

    // Parser les JSON fields avec gestion des erreurs
    const parseJsonField = (field: any) => {
      if (!field) return null;
      if (typeof field === 'object') return field;
      if (typeof field !== 'string') return field;
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Erreur parsing JSON field:', field, error);
        return null;
      }
    };

    const response = {
      ...establishment,
      images: images,
      events: sortedEvents,
      owner: owner ? {
        id: owner.id,
        firstName: owner.first_name,
        lastName: owner.last_name,
        email: owner.email
      } : null,
      _count: {
        favorites: favoritesCount,
        likes: likesCount,
        comments: commentsCount
      },
      activities: parseJsonField(establishment.activities) || [],
      services: parseJsonField(establishment.services) || [],
      ambiance: parseJsonField(establishment.ambiance) || [],
      paymentMethods: parseJsonField(establishment.payment_methods) || [],
      horairesOuverture: parseJsonField(establishment.horaires_ouverture) || {},
      envieTags: parseJsonField(establishment.envie_tags) || [],
      informationsPratiques: parseJsonField(establishment.informations_pratiques) || [],
    };

    return NextResponse.json({
      success: true,
      message: "Établissement mis à jour avec succès",
      data: response
    });
    
  } catch (error) {
    console.error("❌ Erreur modification établissement:", error);
    
    // Gestion spécifique des erreurs Prisma
    if (error instanceof Error && error.message.includes('category')) {
      return NextResponse.json(
        { 
          error: "Catégorie invalide",
          details: "La catégorie fournie n'existe pas dans la liste des catégories autorisées"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Erreur interne du serveur",
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Suppression d'un établissement
 * 
 * @param request - NextRequest (non utilisé mais requis par Next.js)
 * @param params - Paramètres de route contenant le slug (Promise en Next.js 15+)
 * 
 * Sécurité :
 * - TODO: Ajouter vérification des permissions (admin ou propriétaire)
 * - Suppression en cascade automatique (favoris, commentaires, images, etc.)
 * 
 * Responses :
 * - 200 : Établissement supprimé avec succès
 * - 403 : Accès refusé (si authentification activée)
 * - 404 : Établissement non trouvé
 * - 500 : Erreur serveur
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // ✅ Correction Next.js 15
) {
  try {
    // ✅ Await params pour Next.js 15
    const { slug } = await params;
    const supabase = await createClient();

    // Vérifier l'authentification et les permissions
    let user;
    try {
      user = await requireEstablishment();
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Authentification requise" },
        { status: 401 }
      );
    }
    
    // Vérifier si l'établissement existe et récupérer les infos
    const { data: existing, error: existingError } = await supabase
      .from('establishments')
      .select(`
        *,
        owner:professionals!establishments_owner_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .eq('slug', slug)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de l'établissement
    if (existing.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Accès refusé - Seul le propriétaire peut supprimer cet établissement" },
        { status: 403 }
      );
    }

    // Récupérer les statistiques avant suppression
    const [favoritesCount, likesCount, commentsCount, imagesCount, eventsCount] = await Promise.all([
      supabase.from('user_favorites').select('id', { count: 'exact', head: true }).eq('establishment_id', existing.id),
      supabase.from('user_likes').select('id', { count: 'exact', head: true }).eq('establishment_id', existing.id),
      supabase.from('user_comments').select('id', { count: 'exact', head: true }).eq('establishment_id', existing.id),
      supabase.from('images').select('id', { count: 'exact', head: true }).eq('establishment_id', existing.id),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('establishment_id', existing.id)
    ]);

    const deletionStats = {
      name: existing.name,
      owner: existing.owner ? `${existing.owner.first_name} ${existing.owner.last_name}` : 'Inconnu',
      favoriteCount: favoritesCount.count || 0,
      likeCount: likesCount.count || 0,
      commentCount: commentsCount.count || 0,
      imageCount: imagesCount.count || 0,
      eventCount: eventsCount.count || 0
    };

    // Supprimer l'établissement (la suppression en cascade est gérée par les foreign keys)
    const { error: deleteError } = await supabase
      .from('establishments')
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      console.error('Erreur suppression établissement:', deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    // Log détaillé de la suppression pour audit
    console.log(`🗑️ Établissement supprimé: ${deletionStats.name}`);
    console.log(`   Propriétaire: ${deletionStats.owner}`);
    console.log(`   Données supprimées: ${deletionStats.favoriteCount} favoris, ${deletionStats.likeCount} likes, ${deletionStats.commentCount} commentaires`);
    console.log(`   Médias supprimés: ${deletionStats.imageCount} images, ${deletionStats.eventCount} événements`);

    // TODO: Supprimer les fichiers images du stockage Supabase
    // if (deletionStats.imageCount > 0) {
    //   await deleteImagesFromStorage(existing.images.map(img => img.url));
    // }

    return NextResponse.json({ 
      success: true,
      message: "Établissement supprimé avec succès",
      deleted: {
        name: existing.name,
        slug: slug,
        deletedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur suppression établissement:", error);
    
    return NextResponse.json(
      { 
        error: "Erreur interne du serveur",
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
}
//get api research
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    
    // Récupérer l'établissement avec relations
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select(`
        *,
        images (*),
        events (*),
        owner:professionals!establishments_owner_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();
    
    if (establishmentError || !establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les compteurs (favorites, likes, comments)
    const [favoritesCount, likesCount, commentsCount] = await Promise.all([
      supabase.from('user_favorites').select('id', { count: 'exact', head: true }).eq('establishment_id', establishment.id),
      supabase.from('user_likes').select('id', { count: 'exact', head: true }).eq('establishment_id', establishment.id),
      supabase.from('user_comments').select('id', { count: 'exact', head: true }).eq('establishment_id', establishment.id)
    ]);

    // Filtrer les événements à venir et trier
    const now = new Date().toISOString();
    const upcomingEvents = (establishment.events || [])
      .filter((event: any) => event.start_date >= now)
      .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 10);

    // Trier les images par ordre
    const sortedImages = (establishment.images || []).sort((a: any, b: any) => a.ordre - b.ordre);

    // Parser les JSON fields avec gestion des erreurs
    const parseJsonField = (field: any) => {
      if (!field) return null;
      if (typeof field === 'object') return field;
      if (typeof field !== 'string') return field;
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Erreur parsing JSON field:', field, error);
        return null;
      }
    };

    const response = {
      ...establishment,
      images: sortedImages,
      events: upcomingEvents,
      owner: establishment.owner ? {
        firstName: establishment.owner.first_name,
        lastName: establishment.owner.last_name,
        email: establishment.owner.email,
        phone: establishment.owner.phone
      } : null,
      _count: {
        favorites: favoritesCount.count || 0,
        likes: likesCount.count || 0,
        comments: commentsCount.count || 0
      },
      activities: parseJsonField(establishment.activities) || [],
      services: parseJsonField(establishment.services) || [],
      ambiance: parseJsonField(establishment.ambiance) || [],
      paymentMethods: parseJsonField(establishment.payment_methods) || [],
      horairesOuverture: parseJsonField(establishment.horaires_ouverture) || {},
      envieTags: parseJsonField(establishment.envie_tags) || [],
      informationsPratiques: parseJsonField(establishment.informations_pratiques) || [],
    };

    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error("❌ Erreur récupération établissement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
