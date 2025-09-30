import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ActionButtons from "../action-buttons";
import EstablishmentDetail from "./EstablishmentDetail";
import { headers } from "next/headers";

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
  
  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
      latitude: true,
      longitude: true,
      phone: true,
      email: true,
      website: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      theForkLink: true,
      uberEatsLink: true,
      activities: true,
      services: true,
      ambiance: true,
      paymentMethods: true,
      horairesOuverture: true,
      prixMoyen: true,
      capaciteMax: true,
      accessibilite: true,
      parking: true,
      terrasse: true,
      priceMin: true,
      priceMax: true,
      subscription: true,
      status: true,
      rejectionReason: true,
      rejectedAt: true,
      lastModifiedAt: true,
      envieTags: true,
      googlePlaceId: true,
      googleBusinessUrl: true,
      enriched: true,
      enrichmentData: true,
      priceLevel: true,
      googleRating: true,
      googleReviewCount: true,
      specialties: true,
      atmosphere: true,
      accessibility: true,
      accessibilityDetails: true,
      detailedServices: true,
      clienteleInfo: true,
      detailedPayments: true,
      childrenServices: true,
      informationsPratiques: true,
      viewsCount: true,
      clicksCount: true,
      avgRating: true,
      totalComments: true,
      createdAt: true,
      updatedAt: true,
      images: true,
      events: { 
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          price: true,
          maxCapacity: true,
          isRecurring: true,
          createdAt: true
        }
      },
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        }
      },
    },
  });

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
      if (referer && isValidUrl(referer)) {
        const url = new URL(referer);
        const envie = url.searchParams.get('envie');
        const ville = url.searchParams.get('ville');
        const rayon = url.searchParams.get('rayon');
        const lat = url.searchParams.get('lat');
        const lng = url.searchParams.get('lng');
        
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
      return '/recherche/envie';
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
    if (referer && referer.includes('/') && !referer.includes('/etablissements') && !referer.includes('/recherche') && !referer.includes('/carte') && !referer.includes('/dashboard')) {
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
    if (referer && referer.includes('/') && !referer.includes('/etablissements') && !referer.includes('/recherche') && !referer.includes('/carte') && !referer.includes('/dashboard')) {
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
