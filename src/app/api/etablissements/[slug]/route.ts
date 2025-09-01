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

/**
 * Types pour la validation des données
 */
interface UpdateEstablishmentData {
  name?: string;
  slug?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  category?: string;
  services?: string[] | string;
  ambiance?: string[] | string;
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
    
    const body: UpdateEstablishmentData = await request.json();
    
    // Validation des champs requis
    if (!body.name || !body.address || !body.category) {
      return NextResponse.json(
        { 
          error: "Validation échouée",
          details: "Nom, adresse et catégorie sont requis",
          missing_fields: {
            name: !body.name,
            address: !body.address,
            category: !body.category
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
        professionalOwner: true // Inclure les infos du propriétaire
      }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Générer un nouveau slug si le nom a changé et aucun slug personnalisé fourni
    let newSlug = slug;
    if (body.name !== existing.name && !body.slug) {
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

    // Préparer les données de mise à jour
    const updateData: any = {
      name: body.name,
      slug: newSlug,
      description: body.description || existing.description || "",
      address: body.address,
      phone: body.phone || existing.phone || "",
      email: body.email || existing.email || "",
      website: body.website || existing.website || "",
      instagram: body.instagram || existing.instagram || "",
      facebook: body.facebook || existing.facebook || "",
      category: body.category,
      status: body.status || existing.status || "pending",
    };

    // Ajouter les coordonnées GPS si fournies
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;

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

    // Gérer les horaires d'ouverture
    if (body.hours) {
      updateData.hours = JSON.stringify(body.hours);
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
          professionalOwner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true
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
      console.log(`✅ Établissement mis à jour: ${establishment.name} (${establishment.slug}) par ${establishment.professionalOwner.companyName}`);

      return establishment;
    });

    // Parser les services et ambiance pour la réponse
    const response = {
      ...updated,
      services: typeof updated.services === 'string' 
        ? JSON.parse(updated.services) 
        : updated.services,
      ambiance: typeof updated.ambiance === 'string'
        ? JSON.parse(updated.ambiance)
        : updated.ambiance,
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

    // TODO: Vérifier les permissions admin ou propriétaire
    // const user = await getCurrentUser(request);
    // if (!user || (!user.isAdmin && user.id !== establishment.professionalOwnerId)) {
    //   return NextResponse.json(
    //     { error: "Accès refusé - Seul le propriétaire ou un admin peut supprimer cet établissement" },
    //     { status: 403 }
    //   );
    // }

    // Vérifier si l'établissement existe et récupérer les infos
    const existing = await prisma.establishment.findUnique({
      where: { slug },
      include: {
        professionalOwner: {
          select: {
            id: true,
            companyName: true,
            firstName: true,
            lastName: true
          }
        },
        images: { select: { id: true, url: true } },
        events: { select: { id: true, name: true } },
        _count: {
          select: {
            favorites: true,
            likes: true,
            comments: true,
            images: true,
            events: true
          }
        }
      }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Statistiques avant suppression pour le log
    const deletionStats = {
      name: existing.name,
      owner: existing.professionalOwner.companyName,
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
        professionalOwner: {
          select: {
            companyName: true,
            phone: true,
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
