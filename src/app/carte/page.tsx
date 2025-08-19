import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapComponent from "./map-component";

export default async function MapPage() {
  const establishments = await prisma.establishment.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:underline">
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
