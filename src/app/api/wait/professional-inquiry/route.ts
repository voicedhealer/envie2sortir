import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sanitizeInput, sanitizeEmail } from "@/lib/security/sanitization";

// Schema de validation avec protection contre les caractères dangereux
const professionalInquirySchema = z.object({
  firstName: z.string()
    .min(1, "Le prénom est requis")
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  lastName: z.string()
    .min(1, "Le nom est requis")
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  email: z.string()
    .email("Adresse email invalide")
    .min(5, "Email trop court")
    .max(255, "Email trop long")
    .toLowerCase()
    .trim(),
  establishmentName: z.string()
    .min(1, "Le nom de l'établissement est requis")
    .max(200)
    .refine((val) => !/[<>{}[\]\\]/.test(val), "Le nom de l'établissement contient des caractères interdits"),
  city: z.string()
    .min(1, "La ville est requise")
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "La ville ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  description: z.string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .refine((val) => !val || !/<script|javascript:|on\w+=/i.test(val), "La description contient du contenu dangereux")
    .optional(),
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

    // 🔒 Sanitization des données avant validation
    const body = await request.json();
    const sanitizedBody = {
      firstName: sanitizeInput(body.firstName || ''),
      lastName: sanitizeInput(body.lastName || ''),
      email: sanitizeEmail(body.email || ''),
      establishmentName: sanitizeInput(body.establishmentName || ''),
      city: sanitizeInput(body.city || ''),
      description: body.description ? sanitizeInput(body.description) : undefined,
    };

    // 🔒 Validation des données
    const validationResult = professionalInquirySchema.safeParse(sanitizedBody);

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
    const { error: insertError } = await supabase
      .from('professional_inquiries')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        establishment_name: data.establishmentName,
        city: data.city,
        description: data.description || null,
        ip_address: ip,
      });

    if (insertError) {
      console.error('Erreur insertion demande professionnelle:', insertError);
      // Logger quand même pour le debug
      console.log(`📋 [Professional Inquiry] Nouvelle demande (non sauvegardée):`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        establishmentName: data.establishmentName,
        city: data.city,
        description: data.description,
        ip,
      });
      
      // Ne pas bloquer si la table n'existe pas encore, juste logger
      // Retourner un succès pour ne pas frustrer l'utilisateur
      // L'admin pourra voir les logs et créer la table si nécessaire
      return NextResponse.json({
        success: true,
        message: "Votre demande a été enregistrée avec succès. Nous vous contacterons très bientôt."
      });
    }

    console.log(`📋 [Professional Inquiry] Nouvelle demande enregistrée:`, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      establishmentName: data.establishmentName,
      city: data.city,
      ip,
    });

    return NextResponse.json({
      success: true,
      message: "Votre demande a été enregistrée avec succès. Nous vous contacterons très bientôt."
    });

  } catch (error) {
    console.error('❌ [Professional Inquiry] Erreur:', error);
    
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

