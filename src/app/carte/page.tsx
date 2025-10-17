import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapComponent from "./map-component";

export default async function MapPage() {
  const now = new Date();
  
  const establishments = await prisma.establishment.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      latitude: true,
      longitude: true,
      activities: true,
      imageUrl: true,
      images: {
        select: {
          url: true,
          isCardImage: true
        }
      },
      status: true,
      avgRating: true,
      googleRating: true,
      prixMoyen: true,
      priceMin: true,
      priceMax: true,
      events: {
        where: {
          OR: [
            { endDate: { gte: now } }, // Événements qui ne sont pas encore terminés
            { AND: [{ endDate: null }, { startDate: { lte: now } }] } // Événements sans date de fin mais déjà commencés
          ]
        },
        select: {
          title: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { startDate: 'asc' },
        take: 1, // On prend seulement le prochain événement
      },
      comments: {
        select: {
          content: true,
          rating: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1, // On prend seulement le dernier commentaire
      },
    },
    orderBy: { name: "asc" },
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
