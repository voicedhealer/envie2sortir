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
import { prisma } from "@/lib/prisma";
import { requireEstablishment } from "@/lib/auth-utils";

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
  subscription?: 'STANDARD' | 'PREMIUM';
  status?: 'active' | 'pending' | 'suspended';
  hours?: {
    monday?: { open: string; close: string; isOpen: boolean };
    tuesday?: { open: string; close: string; isOpen: boolean };
    wednesday?: { open: string; close: string; isOpen: boolean };
    thursday?: { open: string; close: string; isOpen: boolean };
    friday?: { open: string; close: string; isOpen: boolean };
    saturday?: { open: string; close: string; isOpen: boolean };
    sunday?: { open: string; close: string; isOpen: boolean };
  };
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
 *   status?: string,         // Statut : 'active', 'pending', 'suspended'
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
    const user = await requireEstablishment(request);
    
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

    // Vérifier si l'établissement existe
    const existing = await prisma.establishment.findUnique({
      where: { slug },
      include: {
        owner: true // Inclure les infos du propriétaire
      }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }
    
    console.log('🔍 Debug establishment:', {
      establishmentId: existing.id,
      establishmentName: existing.name,
      establishmentOwnerId: existing.ownerId,
      ownerEmail: existing.owner?.email,
      ownerName: existing.owner?.firstName + ' ' + existing.owner?.lastName
    });

    // Vérifier que l'utilisateur est le propriétaire de l'établissement
    console.log('🔍 Debug permissions:', {
      establishmentOwnerId: existing.ownerId,
      currentUserId: user.id,
      userEmail: user.email,
      userRole: user.role
    });
    
    if (existing.ownerId !== user.id) {
      console.error('❌ Accès refusé:', {
        establishmentOwnerId: existing.ownerId,
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
      const slugExists = await prisma.establishment.findUnique({
        where: { slug: newSlug },
      });
      
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
    const updateData: any = {};
    
    // Mettre à jour le slug si nécessaire
    if (newSlug !== slug) {
      updateData.slug = newSlug;
    }
    
    // Mettre à jour seulement les champs fournis
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.facebook !== undefined) updateData.facebook = body.facebook;
    if (body.tiktok !== undefined) updateData.tiktok = body.tiktok;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priceMin !== undefined) updateData.priceMin = body.priceMin;
    if (body.priceMax !== undefined) updateData.priceMax = body.priceMax;
    if (body.informationsPratiques !== undefined) updateData.informationsPratiques = body.informationsPratiques;
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
      updateData.paymentMethods = Array.isArray(body.paymentMethods) 
        ? JSON.stringify(body.paymentMethods)
        : body.paymentMethods;
    }

    // Gérer les horaires d'ouverture
    if (body.horairesOuverture) {
      updateData.horairesOuverture = JSON.stringify(body.horairesOuverture);
    } else if (body.hours) {
      updateData.horairesOuverture = JSON.stringify(body.hours);
    }

    // Mettre à jour l'établissement dans une transaction
    const updated = await prisma.$transaction(async (tx) => {
      const establishment = await tx.establishment.update({
        where: { slug },
        data: updateData,
        include: {
          images: true,
          events: {
            orderBy: { startDate: "asc" },
            take: 5 // Limiter à 5 événements récents
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              favorites: true,
              likes: true,
              comments: true
            }
          }
        },
      });

      // Log de l'action pour audit
      console.log(`✅ Établissement mis à jour: ${establishment.name} (${establishment.slug}) par ${establishment.owner.firstName} ${establishment.owner.lastName}`);

      return establishment;
    });

    // Parser tous les champs JSON pour la réponse
    const response = {
      ...updated,
      activities: typeof updated.activities === 'string' 
        ? JSON.parse(updated.activities) 
        : updated.activities,
      services: typeof updated.services === 'string' 
        ? JSON.parse(updated.services) 
        : updated.services,
      ambiance: typeof updated.ambiance === 'string'
        ? JSON.parse(updated.ambiance)
        : updated.ambiance,
      paymentMethods: typeof updated.paymentMethods === 'string'
        ? JSON.parse(updated.paymentMethods)
        : updated.paymentMethods,
      horairesOuverture: typeof updated.horairesOuverture === 'string'
        ? JSON.parse(updated.horairesOuverture)
        : updated.horairesOuverture,
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

    // Vérifier l'authentification et les permissions
    const user = await requireEstablishment();
    
    // Vérifier si l'établissement existe et récupérer les infos
    const existing = await prisma.establishment.findUnique({
      where: { slug },
      include: { owner: true }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de l'établissement
    if (existing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Accès refusé - Seul le propriétaire peut supprimer cet établissement" },
        { status: 403 }
      );
    }



    // Statistiques avant suppression pour le log
    const deletionStats = {
      name: existing.name,
      owner: existing.owner.firstName + ' ' + existing.owner.lastName,
      favoriteCount: existing._count.favorites,
      likeCount: existing._count.likes,
      commentCount: existing._count.comments,
      imageCount: existing._count.images,
      eventCount: existing._count.events
    };

    // Supprimer l'établissement dans une transaction
    // La suppression en cascade est automatiquement gérée par Prisma
    await prisma.$transaction(async (tx) => {
      await tx.establishment.delete({
        where: { slug },
      });

      // Log détaillé de la suppression pour audit
      console.log(`🗑️ Établissement supprimé: ${deletionStats.name}`);
      console.log(`   Propriétaire: ${deletionStats.owner}`);
      console.log(`   Données supprimées: ${deletionStats.favoriteCount} favoris, ${deletionStats.likeCount} likes, ${deletionStats.commentCount} commentaires`);
      console.log(`   Médias supprimés: ${deletionStats.imageCount} images, ${deletionStats.eventCount} événements`);
    });

    // TODO: Supprimer les fichiers images du stockage (Cloudinary, S3, etc.)
    // if (existing.images.length > 0) {
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
    
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      include: {
        images: true,
        events: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
          take: 10
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            favorites: true,
            likes: true,
            comments: true
          }
        }
      }
    });
    
    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Parser les JSON fields
    const response = {
      ...establishment,
      services: typeof establishment.services === 'string' 
        ? JSON.parse(establishment.services) 
        : establishment.services,
      ambiance: typeof establishment.ambiance === 'string'
        ? JSON.parse(establishment.ambiance)
        : establishment.ambiance,
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
