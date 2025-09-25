import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeInput, sanitizeRequestBody } from '@/lib/security';
import { recordAPIMetric, createRequestLogger } from '@/lib/monitoring';
import { z } from 'zod';

// Schéma de validation pour la création d'établissement
const establishmentSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  slug: z.string().optional(),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const requestLogger = createRequestLogger(requestId, undefined, ipAddress);

  try {
    const body = await request.json();
    
    // Sanitisation des données d'entrée
    const sanitizedBody = sanitizeRequestBody(body);
    
    // Validation avec Zod
    const validatedData = establishmentSchema.parse(sanitizedBody);

    // Vérifier si le slug existe déjà
    if (validatedData.slug) {
      const existing = await prisma.establishment.findUnique({
        where: { slug: validatedData.slug },
      });
      
      if (existing) {
        const responseTime = Date.now() - startTime;
        recordAPIMetric('/api/etablissements', 'POST', 400, responseTime, { ipAddress });
        
        await requestLogger.warn('Duplicate slug attempt', {
          slug: validatedData.slug,
          ipAddress
        });

        return NextResponse.json(
          { error: "Un établissement avec ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Créer l'établissement
    const establishment = await prisma.establishment.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, '-'),
        description: validatedData.description || "",
        address: validatedData.address,
        latitude: validatedData.latitude || 47.322,
        longitude: validatedData.longitude || 5.041,
        phone: validatedData.phone || "",
        email: validatedData.email || "",
        website: validatedData.website || "",
        instagram: validatedData.instagram || "",
        category: validatedData.category,
        status: validatedData.status || "pending",
      },
    });

    const responseTime = Date.now() - startTime;
    recordAPIMetric('/api/etablissements', 'POST', 201, responseTime, {
      establishmentId: establishment.id,
      ipAddress
    });

    await requestLogger.info('Establishment created', {
      establishmentId: establishment.id,
      name: establishment.name,
      category: establishment.category,
      responseTime
    });

    return NextResponse.json(establishment, { status: 201 });
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Logging des erreurs
    if (error.name === 'ZodError') {
      recordAPIMetric('/api/etablissements', 'POST', 400, responseTime, { ipAddress });
      await requestLogger.warn('Invalid establishment data', {
        errors: error.errors,
        ipAddress
      });

      return NextResponse.json(
        { 
          error: "Données invalides",
          details: error.errors 
        },
        { status: 400 }
      );
    }

    recordAPIMetric('/api/etablissements', 'POST', 500, responseTime, { ipAddress });
    await requestLogger.error('Establishment creation error', {
      error: error.message,
      ipAddress
    }, error);

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
