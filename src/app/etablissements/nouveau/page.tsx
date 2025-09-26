import EstablishmentForm from "../establishment-form";
import Image from 'next/image';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewEstablishmentPage() {
  // Vérifier si l'utilisateur est connecté
  const session = await getServerSession(authOptions);
  
  // Si l'utilisateur n'est pas connecté, afficher le formulaire d'inscription professionnelle
  if (!session?.user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        {/* Header avec navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Espace Professionnel</h1>
                <p className="text-gray-600 mt-2">Rejoignez Envie2Sortir et faites découvrir votre établissement</p>
              </div>
              <a href="/" className="text-orange-600 hover:text-orange-700 font-medium">
                ← Retour à l'accueil
              </a>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <EstablishmentForm />
          </div>
        </div>
      </main>
    );
  }
  
  // Vérifier que l'utilisateur est un professionnel
  if (session.user.userType !== 'professional' && session.user.role !== 'pro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-600 mb-6">
            Seuls les professionnels peuvent créer des établissements. 
            Les administrateurs ne peuvent pas créer d'établissements.
          </p>
          <div className="space-y-3">
            <a 
              href="/dashboard" 
              className="block w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Retour au tableau de bord
            </a>
            <a 
              href="/" 
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  if (session?.user?.id) {
    console.log('🔍 Debug - Session user:', {
      id: session.user.id,
      role: session.user.role
    });
    
    // Vérifier si l'utilisateur a déjà un établissement
    // Recherche directe par ownerId (nouvelle architecture)
    let existingEstablishment = null;
    
    console.log('🔍 Debug - Recherche par ownerId:', session.user.id);
    existingEstablishment = await prisma.establishment.findFirst({
      where: {
        ownerId: session.user.id
      }
    });
    console.log('🔍 Debug - Résultat recherche par ownerId:', existingEstablishment);
    
    console.log('🔍 Debug - Établissement trouvé:', existingEstablishment);

    if (existingEstablishment) {
      // Afficher un message d'avertissement au lieu de rediriger
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès non autorisé
            </h1>
            <p className="text-gray-600 mb-6">
              Vous avez déjà un établissement enregistré sur notre plateforme. 
              Un seul établissement par compte professionnel est autorisé.
            </p>
            <div className="space-y-3">
              <a 
                href="/dashboard" 
                className="block w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Accéder à mon dashboard
              </a>
              <a 
                href="/" 
                className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      );
    }
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header avec navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Professionnel</h1>
              <p className="text-gray-600 mt-2">Rejoignez Envie2Sortir et faites découvrir votre établissement</p>
            </div>
            <a href="/" className="text-orange-600 hover:text-orange-700 font-medium">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section d'introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-32 h-32  mx-auto mb-0">
              <Image 
              src="/logo.svg" 
              alt="Envie2Sortir Logo" 
              width={1000} 
              height={1000}
              className="object-contain"
              />
              <span className="text-3xl text-white">Envie2Sortir</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rejoignez notre plateforme</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ajoutez votre établissement en quelques minutes et commencez à recevoir des clients dès aujourd'hui. 
              L'inscription et l'ajout de votre établissement se font en une seule étape pour vous simplifier la vie.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visibilité locale</h3>
              <p className="text-sm text-gray-600">Apparaissez dans les recherches de votre zone</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clients ciblés</h3>
              <p className="text-sm text-gray-600">Touchez des clients qui recherchent votre activité</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mise en ligne rapide</h3>
              <p className="text-sm text-gray-600">Votre établissement en ligne en moins de 5 minutes</p>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout d'établissement */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Ajoutez votre établissement</h3>
          <EstablishmentForm />
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions fréquentes</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Combien coûte l'inscription ?</h4>
              <p className="text-sm text-gray-600">L'inscription est actuellement gratuite pendant la phase de lancement.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Combien de temps pour être visible ?</h4>
              <p className="text-sm text-gray-600">Votre établissement sera visible immédiatement après validation (sous 24h).</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Puis-je modifier mes informations ?</h4>
              <p className="text-sm text-gray-600">Oui, vous pourrez modifier toutes vos informations à tout moment depuis votre espace.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
