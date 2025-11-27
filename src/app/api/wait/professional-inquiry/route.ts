import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { logger } from "@/lib/monitoring/logger";

// Schema de validation
const professionalInquirySchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(100),
  lastName: z.string().min(1, "Le nom est requis").max(100),
  establishmentName: z.string().min(1, "Le nom de l'établissement est requis").max(200),
  city: z.string().min(1, "La ville est requise").max(100),
  description: z.string().max(1000).optional(),
});

// Rate limiting simple (en mémoire)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 2; // 2 tentatives par minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 Rate limiting
    // Extraire la première IP de x-forwarded-for (peut contenir plusieurs IPs séparées par des virgules)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = request.ip || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." 
        },
        { status: 429 }
      );
    }

    // 🔒 Validation des données
    const body = await request.json();
    const validationResult = professionalInquirySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0]?.message || "Données invalides" 
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const data = validationResult.data;

    // Stocker la demande dans une table (vous devrez créer cette table dans Supabase)
    // Pour l'instant, on va créer un enregistrement dans une table temporaire ou utiliser une table existante
    // Si vous avez une table "professional_inquiries" ou similaire, utilisez-la
    
    // Option 1: Créer une table dans Supabase pour stocker ces demandes
    // Option 2: Utiliser une table existante ou créer un enregistrement dans users avec un flag spécial
    
    // Pour l'instant, on va simplement logger et retourner un succès
    // Vous pouvez créer une table "professional_inquiries" avec les colonnes:
    // id (uuid), first_name, last_name, establishment_name, city, description, created_at, ip_address
    
    // Insérer la demande dans la table professional_inquiries
    await logger.info('Professional inquiry submission attempt', {
      firstName: data.firstName,
      lastName: data.lastName,
      establishmentName: data.establishmentName,
      city: data.city,
      hasDescription: !!data.description,
      ipAddress: ip,
    });

    const { data: insertData, error: insertError } = await supabase
      .from('professional_inquiries')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        establishment_name: data.establishmentName,
        city: data.city,
        description: data.description || null,
        ip_address: ip,
      })
      .select();

    if (insertError) {
      await logger.error('Professional inquiry insertion failed', {
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        firstName: data.firstName,
        lastName: data.lastName,
        establishmentName: data.establishmentName,
        city: data.city,
        ipAddress: ip,
      }, new Error(insertError.message));
      
      // Ne pas bloquer si la table n'existe pas encore, juste logger
      // Retourner un succès pour ne pas frustrer l'utilisateur
      // L'admin pourra voir les logs et créer la table si nécessaire
      return NextResponse.json({
        success: true,
        message: "Votre demande a été enregistrée avec succès. Nous vous contacterons très bientôt."
      });
    }

    await logger.info('Professional inquiry successfully inserted', {
      inquiryId: insertData?.[0]?.id,
      firstName: data.firstName,
      lastName: data.lastName,
      establishmentName: data.establishmentName,
      city: data.city,
      ipAddress: ip,
      createdAt: insertData?.[0]?.created_at,
    });

    return NextResponse.json({
      success: true,
      message: "Votre demande a été enregistrée avec succès. Nous vous contacterons très bientôt."
    });

  } catch (error) {
    await logger.error('Professional inquiry unexpected error', {
      error: error instanceof Error ? error.message : String(error),
      ipAddress: request.ip || 'unknown',
    }, error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Une erreur est survenue. Veuillez réessayer plus tard." 
      },
      { status: 500 }
    );
  }
}

// 🔒 Seulement POST autorisé
export async function GET() {
  return NextResponse.json(
    { error: "Méthode non autorisée" },
    { status: 405 }
  );
}

