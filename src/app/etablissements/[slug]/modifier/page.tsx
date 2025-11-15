import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import EstablishmentForm from "../../establishment-form";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  
  // Récupérer l'établissement avec ses relations
  const { data: establishmentData, error: establishmentError } = await supabase
    .from('establishments')
    .select(`
      *,
      tags:etablissement_tags!etablissement_tags_establishment_id_fkey (
        tag,
        type_tag,
        poids
      ),
      owner:professionals!establishments_owner_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone,
        company_name,
        siret,
        legal_status,
        siret_verified,
        siret_verified_at
      )
    `)
    .eq('slug', slug)
    .single();

  if (establishmentError || !establishmentData) {
    console.error('Erreur récupération établissement:', establishmentError);
    notFound();
  }

  // Vérifier que l'utilisateur est le propriétaire de l'établissement
  if (establishmentData.owner_id !== user.id) {
    redirect('/dashboard?error=AccessDenied');
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
    tags: (establishmentData.tags || []).map((tag: any) => ({
      tag: tag.tag,
      typeTag: tag.type_tag,
      poids: tag.poids
    })),
    owner: establishmentData.owner ? {
      id: establishmentData.owner.id,
      firstName: establishmentData.owner.first_name,
      lastName: establishmentData.owner.last_name,
      email: establishmentData.owner.email,
      phone: establishmentData.owner.phone,
      companyName: establishmentData.owner.company_name,
      siret: establishmentData.owner.siret,
      legalStatus: establishmentData.owner.legal_status,
      siretVerified: establishmentData.owner.siret_verified,
      siretVerifiedAt: establishmentData.owner.siret_verified_at
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