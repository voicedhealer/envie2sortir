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

  // Récupérer les tags séparément depuis la table etablissement_tags
  // ✅ IMPORTANT : Ne récupérer que les tags normaux (type_tag != 'envie')
  // Les envieTags sont récupérés depuis envie_tags (JSONB) pour éviter les doublons
  let tagsData: any[] = [];
  try {
    // ✅ Supabase PostgREST utilise snake_case pour les noms de colonnes
    const { data: tags, error: tagsError } = await supabase
      .from('etablissement_tags')
      .select('*')
      .eq('etablissement_id', establishmentData.id)
      .neq('type_tag', 'envie'); // ✅ Exclure les envieTags (récupérés depuis envie_tags)

    if (tagsError) {
      console.error('⚠️ [Edit Establishment] Erreur récupération tags:', {
        error: tagsError,
        code: tagsError?.code,
        message: tagsError?.message,
        details: tagsError?.details,
        hint: tagsError?.hint,
        establishmentId: establishmentData.id
      });
    } else if (tags && tags.length > 0) {
      tagsData = tags;
      console.log(`✅ [Edit Establishment] ${tags.length} tags normaux récupérés pour l'établissement ${establishmentData.id}:`, tags.map(t => `${t.tag} (${t.type_tag || t.typeTag})`));
    } else {
      console.log(`ℹ️ [Edit Establishment] Aucun tag normal trouvé dans etablissement_tags pour l'établissement ${establishmentData.id}`);
    }
    
    // Les envieTags sont récupérés depuis envie_tags (JSONB) dans le hook useEstablishmentForm
  } catch (error) {
    console.error('❌ [Edit Establishment] Exception lors de la récupération des tags:', error);
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
      console.log('✅ [Edit Establishment] Données du propriétaire récupérées:', {
        firstName: owner.first_name,
        lastName: owner.last_name,
        email: owner.email,
        phone: owner.phone
      });
    }
  } catch (error) {
    console.error('⚠️ [Edit Establishment] Exception lors de la récupération du propriétaire:', error);
  }


  // Transformer les données pour correspondre au format attendu
  console.log('🔍 [Edit Establishment] Données de contact récupérées depuis la base:', JSON.stringify({
    phone: establishmentData.phone,
    email: establishmentData.email,
    website: establishmentData.website,
    instagram: establishmentData.instagram,
    facebook: establishmentData.facebook,
    whatsapp_phone: establishmentData.whatsapp_phone,
    messenger_url: establishmentData.messenger_url
  }, null, 2));
  
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
    whatsappPhone: establishmentData.whatsapp_phone,
    messengerUrl: establishmentData.messenger_url,
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
    envieTags: (() => {
      try {
        const envieTags = typeof establishmentData.envie_tags === 'string' 
          ? JSON.parse(establishmentData.envie_tags) 
          : establishmentData.envie_tags;
        console.log(`💭 [Edit Establishment] envieTags récupérés pour l'établissement ${establishmentData.id}:`, envieTags);
        return envieTags;
      } catch (error) {
        console.error('❌ [Edit Establishment] Erreur parsing envieTags:', error);
        return null;
      }
    })(),
    tags: (tagsData || []).map((tag: any) => {
      const mappedTag = {
        tag: tag.tag,
        typeTag: tag.typeTag || tag.type_tag, // Gérer les deux formats
        poids: tag.poids
      };
      return mappedTag;
    }),
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