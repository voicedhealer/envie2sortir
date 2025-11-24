import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import MapComponent from "./map-component";

// Force la page à être dynamique (pas de prérendu pendant le build)
export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const now = new Date().toISOString();
  const supabase = await createClient();
  
  // Récupérer tous les établissements approuvés avec leurs relations
  const { data: establishmentsData, error: establishmentsError } = await supabase
    .from('establishments')
    .select(`
      id,
      name,
      slug,
      address,
      city,
      latitude,
      longitude,
      activities,
      image_url,
      status,
      avg_rating,
      google_rating,
      prix_moyen,
      price_min,
      price_max,
      images!images_establishment_id_fkey (
        url,
        is_card_image
      ),
      events!events_establishment_id_fkey (
        title,
        start_date,
        end_date
      ),
      user_comments!user_comments_establishment_id_fkey (
        content,
        rating,
        created_at
      )
    `)
    .eq('status', 'approved')
    .order('name', { ascending: true });

  if (establishmentsError) {
    console.error('Erreur récupération établissements:', establishmentsError);
    return (
      <main className="min-h-screen p-8">
        <div className="mb-6">
          <Link href="/" className="text-orange-500 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">Carte des établissements</h1>
        <div className="text-red-500">Erreur lors du chargement des établissements</div>
      </main>
    );
  }

  // Transformer les données pour correspondre au format attendu par MapComponent
  const establishments = (establishmentsData || []).map((est: any) => {
    // Filtrer les événements actifs (non terminés)
    const activeEvents = (est.events || []).filter((event: any) => {
      if (event.end_date) {
        return new Date(event.end_date) >= new Date(now);
      }
      // Si pas de date de fin, vérifier que l'événement a commencé
      return event.start_date ? new Date(event.start_date) <= new Date(now) : false;
    }).sort((a: any, b: any) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ).slice(0, 1); // Prendre seulement le premier événement actif

    // Prendre seulement le dernier commentaire
    const lastComment = (est.user_comments || [])
      .sort((a: any, b: any) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];

    // Trouver l'image card ou la première image
    const cardImage = (est.images || []).find((img: any) => img.is_card_image);
    const firstImage = (est.images || [])[0];

    return {
      id: est.id,
      name: est.name,
      slug: est.slug,
      address: est.address,
      city: est.city,
      latitude: est.latitude,
      longitude: est.longitude,
      activities: typeof est.activities === 'string' ? JSON.parse(est.activities) : est.activities,
      imageUrl: est.image_url || cardImage?.url || firstImage?.url,
      images: (est.images || []).map((img: any) => ({
        url: img.url,
        isCardImage: img.is_card_image || false
      })),
      status: est.status,
      avgRating: est.avg_rating,
      googleRating: est.google_rating,
      prixMoyen: est.prix_moyen,
      priceMin: est.price_min,
      priceMax: est.price_max,
      events: activeEvents.map((event: any) => ({
        title: event.title,
        startDate: event.start_date,
        endDate: event.end_date
      })),
      comments: lastComment ? [{
        content: lastComment.content,
        rating: lastComment.rating
      }] : []
    };
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6">
        <Link href="/" className="text-orange-500 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Carte des établissements</h1>
      
      <div className="h-[600px] w-full rounded-lg overflow-hidden border border-white/20">
        <MapComponent establishments={establishments} />
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Cliquez sur un marqueur pour voir les détails de l'établissement
      </div>
    </main>
  );
}
