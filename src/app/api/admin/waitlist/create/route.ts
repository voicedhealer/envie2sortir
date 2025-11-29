import { NextRequest, NextResponse } from 'next/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/supabase/helpers';
import { isLaunchActive } from '@/lib/launch';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Schéma de validation
const createWaitlistProSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  establishmentName: z.string().min(1, 'Le nom de l\'établissement est requis'),
  phone: z.string().regex(/^(0[67]|\+33[67])[0-9]{8}$/, 'Numéro de téléphone invalide (06 ou 07)'),
  siret: z.string().regex(/^[0-9]{14}$/, 'SIRET invalide (14 chiffres)'),
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  legalStatus: z.string().min(1, 'Le statut juridique est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
});

/**
 * POST /api/admin/waitlist/create
 * Permet à l'admin de créer manuellement un professionnel en waitlist
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Accès refusé. Authentification admin requise.' },
        { status: 403 }
      );
    }

    // Vérifier si le lancement est déjà actif
    if (isLaunchActive()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le site est déjà lancé. Utilisez le formulaire d\'inscription standard.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createWaitlistProSchema.parse(body);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Vérifier si le Professional existe déjà
    const [existingEmail, existingSiret] = await Promise.all([
      adminClient
        .from('professionals')
        .select('id, email')
        .eq('email', validatedData.email)
        .maybeSingle(),
      adminClient
        .from('professionals')
        .select('id, siret')
        .eq('siret', validatedData.siret)
        .maybeSingle(),
    ]);

    if (existingEmail.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un compte avec cet email existe déjà',
        },
        { status: 400 }
      );
    }

    if (existingSiret.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un compte avec ce SIRET existe déjà',
        },
        { status: 400 }
      );
    }

    // Générer un mot de passe si non fourni
    const password = validatedData.password || Math.random().toString(36).slice(-12) + 'A1!';
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: password,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        role: 'pro',
        userType: 'professional',
      },
    });

    if (authError || !authData.user) {
      console.error('Erreur création compte auth:', authError);
      return NextResponse.json(
        {
          success: false,
          error: authError?.message || 'Erreur lors de la création du compte',
        },
        { status: 500 }
      );
    }

    const authUserId = authData.user.id;

    try {
      // Créer le Professional avec subscription_plan = 'WAITLIST_BETA'
      const { data: professional, error: professionalError } = await adminClient
        .from('professionals')
        .insert({
          id: authUserId,
          siret: validatedData.siret,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          company_name: validatedData.companyName,
          legal_status: validatedData.legalStatus,
          subscription_plan: 'WAITLIST_BETA',
          password_hash: passwordHash,
          siret_verified: false,
        })
        .select()
        .single();

      if (professionalError || !professional) {
        console.error('❌ Erreur création professionnel:', professionalError);
        // Rollback: supprimer le compte auth
        await adminClient.auth.admin.deleteUser(authUserId);
        return NextResponse.json(
          {
            success: false,
            error: professionalError?.message || 'Erreur lors de la création du professionnel',
          },
          { status: 500 }
        );
      }

      // Générer un slug simple pour l'établissement
      const slug = validatedData.establishmentName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Vérifier l'unicité du slug
      let finalSlug = slug;
      let counter = 1;
      let slugExists = true;

      while (slugExists) {
        const { data: existing } = await adminClient
          .from('establishments')
          .select('id')
          .eq('slug', finalSlug)
          .maybeSingle();

        if (!existing) {
          slugExists = false;
        } else {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      }

      // Créer l'établissement avec subscription = 'WAITLIST_BETA' et status = 'pending'
      const { data: establishment, error: establishmentError } = await adminClient
        .from('establishments')
        .insert({
          name: validatedData.establishmentName,
          slug: finalSlug,
          description: `Établissement en attente de lancement - ${validatedData.establishmentName}`,
          address: '', // À compléter plus tard
          city: null,
          postal_code: null,
          country: 'France',
          owner_id: professional.id,
          status: 'pending',
          subscription: 'WAITLIST_BETA',
        })
        .select()
        .single();

      if (establishmentError || !establishment) {
        console.error('❌ Erreur création établissement:', establishmentError);
        // Rollback: supprimer professional et auth
        await adminClient.from('professionals').delete().eq('id', professional.id);
        await adminClient.auth.admin.deleteUser(authUserId);
        return NextResponse.json(
          {
            success: false,
            error: establishmentError?.message || 'Erreur lors de la création de l\'établissement',
          },
          { status: 500 }
        );
      }

      // Log dans subscription_logs
      await adminClient.from('subscription_logs').insert({
        professional_id: professional.id,
        old_status: null,
        new_status: 'WAITLIST_BETA',
        reason: 'admin_manual_creation',
      });

      console.log(`✅ [Admin Waitlist] Professionnel créé: ${validatedData.email}`);

      return NextResponse.json(
        {
          success: true,
          message: 'Professionnel créé en waitlist avec succès',
          professionalId: professional.id,
          establishmentId: establishment.id,
          password: validatedData.password ? undefined : password, // Retourner le mot de passe généré si non fourni
        },
        { status: 201 }
      );
    } catch (error: any) {
      // En cas d'erreur, supprimer le compte auth créé
      try {
        await adminClient.auth.admin.deleteUser(authUserId);
      } catch (deleteError) {
        console.error('Erreur lors de la suppression du compte auth:', deleteError);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('❌ [Admin Waitlist Create] Erreur:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Données invalides',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la création du professionnel en waitlist',
      },
      { status: 500 }
    );
  }
}

