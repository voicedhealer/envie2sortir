import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ActionButtons from "../action-buttons";

export default async function EstablishmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      events: { orderBy: { startDate: "asc" } },
    },
  });

  if (!establishment) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <Link href="/etablissements" className="text-blue-500 hover:underline">
          ← Retour à la liste
        </Link>
        
        <ActionButtons establishment={establishment} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold mb-4">{establishment.name}</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700 mb-4">{establishment.description}</p>
            
            <div className="space-y-2">
              <p><strong>Adresse:</strong> {establishment.address}</p>
              <p><strong>Catégorie:</strong> {establishment.category}</p>
              <p><strong>Statut:</strong> {establishment.status}</p>
              {establishment.phone && (
                <p><strong>Téléphone:</strong> {establishment.phone}</p>
              )}
              {establishment.email && (
                <p><strong>Email:</strong> {establishment.email}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Coordonnées</h3>
            <p><strong>Latitude:</strong> {establishment.latitude}</p>
            <p><strong>Longitude:</strong> {establishment.longitude}</p>
            
            {establishment.events.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Événements</h3>
                <div className="space-y-2">
                  {establishment.events.map((event) => (
                    <div key={event.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.startDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
