import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';
import { z } from 'zod';
import { isLaunchActive, getDaysUntilLaunch, formatTimeUntilLaunch } from '@/lib/launch';
import type { WaitlistJoinRequest, WaitlistJoinResponse } from '@/types/waitlist';
import bcrypt from 'bcryptjs';

// Forcer le mode dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Schéma de validation
const waitlistJoinSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  establishmentName: z.string().min(1, 'Le nom de l\'établissement est requis'),
  phone: z.string().regex(/^(0[67]|\+33[67])[0-9]{8}$/, 'Numéro de téléphone invalide (06 ou 07)'),
  siret: z.string().regex(/^[0-9]{14}$/, 'SIRET invalide (14 chiffres)'),
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  legalStatus: z.string().min(1, 'Le statut juridique est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

/**
 * POST /api/professionals/waitlist/join
 * Permet aux professionnels de rejoindre la waitlist premium
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  try {
    const body: WaitlistJoinRequest = await request.json();

    // Validation des données
    const validatedData = waitlistJoinSchema.parse(body);

    // Vérifier si le lancement est déjà actif
    if (isLaunchActive()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le site est déjà lancé. Veuillez vous inscrire via le formulaire d\'inscription standard.',
        } as WaitlistJoinResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Configuration Supabase manquante');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration serveur manquante',
        } as WaitlistJoinResponse,
        { status: 500 }
      );
    }

    const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Vérifier si le Professional existe déjà (par email ou SIRET)
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
        } as WaitlistJoinResponse,
        { status: 400 }
      );
    }

    if (existingSiret.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un compte avec ce SIRET existe déjà',
        } as WaitlistJoinResponse,
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          role: 'pro',
          userType: 'professional',
        },
      },
    });

    if (authError || !authData.user) {
      console.error('Erreur création compte auth:', authError);
      return NextResponse.json(
        {
          success: false,
          error: authError?.message || 'Erreur lors de la création du compte',
        } as WaitlistJoinResponse,
        { status: 500 }
      );
    }

    const authUserId = authData.user.id;

    try {
      // Vérifier automatiquement l'email pour permettre la connexion immédiate
      await adminClient.auth.admin.updateUserById(authUserId, {
        email_confirm: true,
      });
      console.log('✅ Email vérifié automatiquement pour:', validatedData.email);
    } catch (verifyError) {
      console.warn('⚠️ Impossible de vérifier automatiquement l\'email:', verifyError);
    }

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
        } as WaitlistJoinResponse,
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
        address: '', // Sera complété plus tard
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
        } as WaitlistJoinResponse,
        { status: 500 }
      );
    }

    // Log dans subscription_logs
    await adminClient.from('subscription_logs').insert({
      professional_id: professional.id,
      old_status: null,
      new_status: 'WAITLIST_BETA',
      reason: 'waitlist_join',
    });

    // TODO: Envoyer email de confirmation (via Resend)
    // Pour l'instant, juste logger
    const daysUntilLaunch = getDaysUntilLaunch();
    console.log(`📧 [Waitlist] Inscription réussie pour ${validatedData.email}`);
    console.log(`📅 ${daysUntilLaunch} jours avant le lancement`);

    const duration = Date.now() - startTime;
    console.log(`✅ [Waitlist Join] Inscription réussie en ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        message: `Inscription réussie ! Vous bénéficiez du premium gratuitement jusqu'au lancement. ${formatTimeUntilLaunch()}`,
        professionalId: professional.id,
      } as WaitlistJoinResponse,
      { status: 201 }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Waitlist Join] Erreur après ${duration}ms:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Données invalides',
        } as WaitlistJoinResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'inscription à la waitlist',
      } as WaitlistJoinResponse,
      { status: 500 }
    );
  }
}

