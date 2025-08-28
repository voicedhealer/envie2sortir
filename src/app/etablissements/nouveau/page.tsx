import EstablishmentForm from "../establishment-form";
import Image from 'next/image';

export default function NewEstablishmentPage() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
