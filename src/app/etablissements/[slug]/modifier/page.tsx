import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import EstablishmentForm from "../../establishment-form";

export default async function EditEstablishmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  // Vérifier que l'utilisateur est un professionnel
  if (user.userType !== 'professional' && user.role !== 'professional') {
    redirect('/auth?error=AccessDenied');
  }

  // Utiliser le client admin pour bypass RLS (page protégée pour professionnels)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ [Edit Establishment] Clés Supabase manquantes');
    notFound();
  }

  const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
  const supabase = createClientAdmin(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
  
  // D'abord, vérifier que l'établissement existe avec une requête simple
  const { data: establishmentCheck, error: checkError } = await supabase
    .from('establishments')
    .select('id, slug, owner_id')
    .eq('slug', slug)
    .single();

  if (checkError || !establishmentCheck) {
    console.error('❌ [Edit Establishment] Établissement non trouvé:', {
      error: checkError,
      code: checkError?.code,
      message: checkError?.message,
      details: checkError?.details,
      hint: checkError?.hint,
      slug,
      userId: user.id
    });
    notFound();
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (establishmentCheck.owner_id !== user.id) {
    console.error('❌ [Edit Establishment] Accès refusé:', {
      slug,
      userId: user.id,
      ownerId: establishmentCheck.owner_id
    });
    redirect('/dashboard?error=AccessDenied');
  }

  // Récupérer l'établissement (sans relations pour éviter les problèmes de foreign keys)
  const { data: establishmentData, error: establishmentError } = await supabase
    .from('establishments')
    .select('*')
    .eq('slug', slug)
    .single();

  if (establishmentError || !establishmentData) {
    console.error('❌ [Edit Establishment] Erreur récupération établissement:', {
      error: establishmentError,
      code: establishmentError?.code,
      message: establishmentError?.message,
      details: establishmentError?.details,
      hint: establishmentError?.hint,
      slug,
      establishmentId: establishmentCheck.id
    });
    notFound();
  }

  // Récupérer les tags séparément (optionnel, silencieux si erreur)
  let tagsData: any[] = [];
  try {
    const { data: tags, error: tagsError } = await supabase
      .from('etablissement_tags')
      .select('tag, type_tag, poids')
      .eq('establishment_id', establishmentData.id);

    if (!tagsError && tags) {
      tagsData = tags;
    }
    // Ne pas logger l'erreur car les tags sont optionnels et l'erreur peut être due à RLS
  } catch (error) {
    // Ignorer silencieusement les erreurs de tags
  }

  // Récupérer le propriétaire séparément (optionnel, ne bloque pas si erreur)
  let ownerData: any = null;
  try {
    const { data: owner, error: ownerError } = await supabase
      .from('professionals')
      .select('id, first_name, last_name, email, phone, company_name, siret, legal_status, siret_verified, siret_verified_at')
      .eq('id', establishmentData.owner_id)
      .single();

    if (ownerError) {
      console.error('⚠️ [Edit Establishment] Erreur récupération propriétaire:', {
        error: ownerError,
        code: ownerError?.code,
        message: ownerError?.message,
        details: ownerError?.details,
        hint: ownerError?.hint,
        ownerId: establishmentData.owner_id
      });
    } else {
      ownerData = owner;
    }
  } catch (error) {
    console.error('⚠️ [Edit Establishment] Exception lors de la récupération du propriétaire:', error);
  }


  // Transformer les données pour correspondre au format attendu
  const establishment = {
    id: establishmentData.id,
    name: establishmentData.name,
    slug: establishmentData.slug,
    description: establishmentData.description,
    address: establishmentData.address,
    city: establishmentData.city,
    postalCode: establishmentData.postal_code,
    country: establishmentData.country,
    latitude: establishmentData.latitude,
    longitude: establishmentData.longitude,
    phone: establishmentData.phone,
    email: establishmentData.email,
    website: establishmentData.website,
    instagram: establishmentData.instagram,
    facebook: establishmentData.facebook,
    tiktok: establishmentData.tiktok,
    youtube: establishmentData.youtube,
    activities: typeof establishmentData.activities === 'string' ? JSON.parse(establishmentData.activities) : establishmentData.activities,
    services: typeof establishmentData.services === 'string' ? JSON.parse(establishmentData.services) : establishmentData.services,
    ambiance: typeof establishmentData.ambiance === 'string' ? JSON.parse(establishmentData.ambiance) : establishmentData.ambiance,
    paymentMethods: typeof establishmentData.payment_methods === 'string' ? JSON.parse(establishmentData.payment_methods) : establishmentData.payment_methods,
    horairesOuverture: typeof establishmentData.horaires_ouverture === 'string' ? JSON.parse(establishmentData.horaires_ouverture) : establishmentData.horaires_ouverture,
    prixMoyen: establishmentData.prix_moyen,
    capaciteMax: establishmentData.capacite_max,
    accessibilite: establishmentData.accessibilite,
    parking: establishmentData.parking,
    terrasse: establishmentData.terrasse,
    priceMin: establishmentData.price_min,
    priceMax: establishmentData.price_max,
    subscription: establishmentData.subscription,
    ownerId: establishmentData.owner_id,
    rejectionReason: establishmentData.rejection_reason,
    rejectedAt: establishmentData.rejected_at,
    lastModifiedAt: establishmentData.last_modified_at,
    envieTags: typeof establishmentData.envie_tags === 'string' ? JSON.parse(establishmentData.envie_tags) : establishmentData.envie_tags,
    tags: (tagsData || []).map((tag: any) => ({
      tag: tag.tag,
      typeTag: tag.type_tag,
      poids: tag.poids
    })),
    owner: ownerData ? {
      id: ownerData.id,
      firstName: ownerData.first_name,
      lastName: ownerData.last_name,
      email: ownerData.email,
      phone: ownerData.phone,
      companyName: ownerData.company_name,
      siret: ownerData.siret,
      legalStatus: ownerData.legal_status,
      siretVerified: ownerData.siret_verified,
      siretVerifiedAt: ownerData.siret_verified_at
    } : null
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header avec navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifier l'établissement</h1>
              <p className="text-gray-600 mt-2">Modifiez les informations de {establishment.name}</p>
            </div>
            <a 
              href="/dashboard" 
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Retour au dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <EstablishmentForm 
            establishment={establishment} 
            isEditMode={true} 
          />
        </div>
      </div>
    </main>
  );
}