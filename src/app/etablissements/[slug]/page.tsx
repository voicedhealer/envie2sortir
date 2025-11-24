import { notFound } from "next/navigation";
import Link from "next/link";
import ActionButtons from "../action-buttons";
import EstablishmentDetail from "./EstablishmentDetail";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function EstablishmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  
  const supabase = await createClient();
  
  // Récupérer l'établissement depuis Supabase
  const { data: establishmentData, error: establishmentError } = await supabase
    .from('establishments')
    .select(`
      *,
      images!images_establishment_id_fkey (
        id,
        url,
        alt_text,
        is_card_image,
        ordre,
        created_at
      ),
      events!events_establishment_id_fkey (
        id,
        title,
        description,
        start_date,
        end_date,
        price,
        max_capacity,
        is_recurring,
        created_at
      )
    `)
    .eq('slug', slug)
    .single();

  if (establishmentError || !establishmentData) {
    console.error('Erreur récupération établissement:', establishmentError);
    notFound();
  }

  // Récupérer le propriétaire séparément
  const { data: ownerData } = await supabase
    .from('professionals')
    .select('id, first_name, last_name, email, phone')
    .eq('id', establishmentData.owner_id)
    .single();

  // Transformer les données pour correspondre au format attendu
  const establishment = {
    id: establishmentData.id,
    slug: establishmentData.slug,
    name: establishmentData.name,
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
    theForkLink: establishmentData.the_fork_link,
    uberEatsLink: establishmentData.uber_eats_link,
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
    status: establishmentData.status,
    rejectionReason: establishmentData.rejection_reason,
    rejectedAt: establishmentData.rejected_at,
    lastModifiedAt: establishmentData.last_modified_at,
    envieTags: typeof establishmentData.envie_tags === 'string' ? JSON.parse(establishmentData.envie_tags) : establishmentData.envie_tags,
    googlePlaceId: establishmentData.google_place_id,
    googleBusinessUrl: establishmentData.google_business_url,
    enriched: establishmentData.enriched,
    enrichmentData: typeof establishmentData.enrichment_data === 'string' ? JSON.parse(establishmentData.enrichment_data) : establishmentData.enrichment_data,
    priceLevel: establishmentData.price_level,
    googleRating: establishmentData.google_rating,
    googleReviewCount: establishmentData.google_review_count,
    specialties: typeof establishmentData.specialties === 'string' ? JSON.parse(establishmentData.specialties) : establishmentData.specialties,
    atmosphere: typeof establishmentData.atmosphere === 'string' ? JSON.parse(establishmentData.atmosphere) : establishmentData.atmosphere,
    accessibility: typeof establishmentData.accessibility === 'string' ? JSON.parse(establishmentData.accessibility) : establishmentData.accessibility,
    accessibilityDetails: typeof establishmentData.accessibility_details === 'string' ? JSON.parse(establishmentData.accessibility_details) : establishmentData.accessibility_details,
    detailedServices: typeof establishmentData.detailed_services === 'string' ? JSON.parse(establishmentData.detailed_services) : establishmentData.detailed_services,
    clienteleInfo: typeof establishmentData.clientele_info === 'string' ? JSON.parse(establishmentData.clientele_info) : establishmentData.clientele_info,
    detailedPayments: typeof establishmentData.detailed_payments === 'string' ? JSON.parse(establishmentData.detailed_payments) : establishmentData.detailed_payments,
    childrenServices: typeof establishmentData.children_services === 'string' ? JSON.parse(establishmentData.children_services) : establishmentData.children_services,
    informationsPratiques: typeof establishmentData.informations_pratiques === 'string' ? JSON.parse(establishmentData.informations_pratiques) : establishmentData.informations_pratiques,
    viewsCount: establishmentData.views_count,
    clicksCount: establishmentData.clicks_count,
    avgRating: establishmentData.avg_rating,
    totalComments: establishmentData.total_comments,
    createdAt: establishmentData.created_at,
    updatedAt: establishmentData.updated_at,
    imageUrl: establishmentData.image_url,
    images: (establishmentData.images || [])
      .sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0))
      .map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text,
        isCardImage: img.is_card_image,
        ordre: img.ordre,
        createdAt: img.created_at
      })),
    events: (establishmentData.events || [])
      .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        description: evt.description,
        startDate: evt.start_date,
        endDate: evt.end_date,
        price: evt.price,
        maxCapacity: evt.max_capacity,
        isRecurring: evt.is_recurring,
        createdAt: evt.created_at
      })),
    owner: ownerData ? {
      id: ownerData.id,
      firstName: ownerData.first_name,
      lastName: ownerData.last_name,
      email: ownerData.email,
      phone: ownerData.phone
    } : null
  };

  if (!establishment) {
    notFound();
  }

  // Parser les données JSON des horaires d'ouverture
  if (establishment.horairesOuverture && typeof establishment.horairesOuverture === 'string') {
    try {
      establishment.horairesOuverture = JSON.parse(establishment.horairesOuverture);
    } catch (error) {
      console.error('Erreur lors du parsing des horaires d\'ouverture:', error);
      establishment.horairesOuverture = null;
    }
  }

  // Parser les données JSON Google Places avec gestion d'erreurs robuste
  const parseGooglePlacesData = (data: any, fieldName: string) => {
    if (!data) return null;
    
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn(`⚠️ Erreur parsing ${fieldName}:`, error);
        console.warn(`⚠️ Valeur reçue:`, data);
        return null;
      }
    }
    
    return data;
  };

  // Parser toutes les données Google Places
  establishment.services = parseGooglePlacesData(establishment.services, 'services');
  establishment.ambiance = parseGooglePlacesData(establishment.ambiance, 'ambiance');
  establishment.paymentMethods = parseGooglePlacesData(establishment.paymentMethods, 'paymentMethods');
  establishment.informationsPratiques = parseGooglePlacesData(establishment.informationsPratiques, 'informationsPratiques');
  establishment.activities = parseGooglePlacesData(establishment.activities, 'activities');

  // Debug: Afficher les données récupérées
  console.log('🔍 Debug page publique pour:', establishment.name);
  console.log('📞 phone:', establishment.phone);
  console.log('📱 whatsappPhone:', establishment.whatsappPhone);
  console.log('💬 messengerUrl:', establishment.messengerUrl);
  console.log('📧 email:', establishment.email);
  console.log('📊 accessibilityDetails:', establishment.accessibilityDetails);
  console.log('📊 detailedPayments:', establishment.detailedPayments);
  console.log('📊 detailedServices:', establishment.detailedServices);
  console.log('📊 informationsPratiques:', establishment.informationsPratiques);
  console.log('📊 paymentMethods:', establishment.paymentMethods);
  console.log('📊 smartEnrichmentData:', establishment.smartEnrichmentData);
  console.log('📊 enrichmentData:', establishment.enrichmentData);
  console.log('📊 specialties:', establishment.specialties);
  console.log('📊 atmosphere:', establishment.atmosphere);

  // Déterminer la page de retour basée sur le referer ou les paramètres
  const getBackUrl = () => {
    // Vérifier si referer est une URL valide
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    // Si on vient d'une recherche par envie
    if ((referer && referer.includes('/recherche/envie')) || search.from === 'envie') {
      // Priorité aux paramètres URL (plus fiables que le referer)
      const envie = search.envie || (referer && isValidUrl(referer) ? new URL(referer).searchParams.get('envie') : null);
      const ville = search.ville || (referer && isValidUrl(referer) ? new URL(referer).searchParams.get('ville') : null);
      const rayon = search.rayon || (referer && isValidUrl(referer) ? new URL(referer).searchParams.get('rayon') : null);
      const lat = search.lat || (referer && isValidUrl(referer) ? new URL(referer).searchParams.get('lat') : null);
      const lng = search.lng || (referer && isValidUrl(referer) ? new URL(referer).searchParams.get('lng') : null);
      
      let backUrl = '/recherche/envie';
      const params = new URLSearchParams();
      if (envie) params.set('envie', envie);
      if (ville) params.set('ville', ville);
      if (rayon) params.set('rayon', rayon);
      if (lat) params.set('lat', lat);
      if (lng) params.set('lng', lng);
      
      if (params.toString()) {
        backUrl += '?' + params.toString();
      }
      return backUrl;
    }
    
    // Si on vient d'une recherche classique
    if ((referer && referer.includes('/recherche')) || search.from === 'recherche') {
      if (referer && isValidUrl(referer)) {
        const url = new URL(referer);
        const q = url.searchParams.get('q');
        const category = url.searchParams.get('category');
        const lat = url.searchParams.get('lat');
        const lng = url.searchParams.get('lng');
        
        let backUrl = '/recherche';
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category) params.set('category', category);
        if (lat) params.set('lat', lat);
        if (lng) params.set('lng', lng);
        
        if (params.toString()) {
          backUrl += '?' + params.toString();
        }
        return backUrl;
      }
      return '/recherche';
    }
    
    // Si on vient de la carte
    if ((referer && referer.includes('/carte')) || search.from === 'carte') {
      return '/carte';
    }
    
    // Si on vient du dashboard, retourner au dashboard
    if ((referer && referer.includes('/dashboard')) || search.from === 'dashboard') {
      return '/dashboard';
    }
    
    // Si on vient de la page d'accueil
    if (search.from === 'homepage' || (referer && referer.includes('/') && !referer.includes('/etablissements') && !referer.includes('/recherche') && !referer.includes('/carte') && !referer.includes('/dashboard'))) {
      return '/';
    }
    
    // Par défaut, retourner à la liste des établissements (gestion)
    return '/etablissements';
  };

  const getBackLabel = () => {
    if ((referer && referer.includes('/recherche/envie')) || search.from === 'envie') {
      return '← Retour aux résultats';
    }
    if ((referer && referer.includes('/recherche')) || search.from === 'recherche') {
      return '← Retour aux résultats';
    }
    if ((referer && referer.includes('/carte')) || search.from === 'carte') {
      return '← Retour à la carte';
    }
    if ((referer && referer.includes('/dashboard')) || search.from === 'dashboard') {
      return '← Retour à la gestion';
    }
    if (search.from === 'homepage' || (referer && referer.includes('/') && !referer.includes('/etablissements') && !referer.includes('/recherche') && !referer.includes('/carte') && !referer.includes('/dashboard'))) {
      return '← Retour à l\'accueil';
    }
    return '← Retour à la liste';
  };

  // Déterminer si c'est un mode dashboard (uniquement via paramètre URL explicite)
  const isDashboard = search.dashboard === 'true';

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <Link href={getBackUrl()} className="text-orange-500 hover:text-orange-600 hover:underline transition-colors">
          {getBackLabel()}
        </Link>
        
        <ActionButtons establishment={establishment} isDashboard={isDashboard} />
      </div>

      <EstablishmentDetail establishment={establishment} isDashboard={isDashboard} />
    </main>
  );
}
