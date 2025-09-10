import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EstablishmentForm from "../../establishment-form";

export default async function EditEstablishmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'pro') {
    redirect('/auth/login?error=AccessDenied');
  }

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
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
      ownerId: true
    }
  });

  if (!establishment) {
    notFound();
  }

  // Vérifier que l'utilisateur est le propriétaire de l'établissement
  if (establishment.ownerId !== session.user.id) {
    redirect('/dashboard?error=AccessDenied');
  }

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
