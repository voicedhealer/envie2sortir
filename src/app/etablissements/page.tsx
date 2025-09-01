import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EstablishmentsPage() {
  const establishments = await prisma.establishment.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      city: true,
      activities: true,
      services: true,
      ambiance: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Établissements
        </h1>
        <p className="text-gray-600">
          Découvrez tous nos établissements partenaires
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {establishments.map((establishment) => (
          <div
            key={establishment.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {establishment.name}
              </h2>
              {establishment.description && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {establishment.description}
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                📍 {establishment.address}
                {establishment.city && `, ${establishment.city}`}
              </p>
            </div>

            {/* Activités */}
            {establishment.activities && Array.isArray(establishment.activities) && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Activités</p>
                <div className="flex flex-wrap gap-1">
                  {establishment.activities.slice(0, 3).map((activity: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                    >
                      {activity.replace(/_/g, " ")}
                    </span>
                  ))}
                  {establishment.activities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                      +{establishment.activities.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Ajouté le {new Date(establishment.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <Link
                href={`/etablissements/${establishment.slug}`}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Voir détails
              </Link>
            </div>
          </div>
        ))}
      </div>

      {establishments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun établissement disponible pour le moment.
          </p>
        </div>
      )}
    </main>
  );
}

