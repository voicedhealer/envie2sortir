import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">À propos d'Envie2Sortir</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              La plateforme ultra-locale qui révolutionne la découverte des divertissements près de chez vous
            </p>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Chez Envie2Sortir, nous croyons que chaque envie mérite d'être satisfaite. Notre mission est de connecter 
                les habitants avec les meilleurs établissements de divertissement de leur région, en rendant la découverte 
                locale simple, intuitive et personnalisée.
              </p>
              <p className="text-lg text-gray-600">
                Que vous ayez envie de danser, de manger, de vous détendre ou de découvrir quelque chose de nouveau, 
                nous vous aidons à trouver exactement ce que vous cherchez, près de chez vous.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🎯</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Localité</h3>
              <p className="text-gray-600">
                Nous privilégions les établissements locaux et favorisons l'économie de proximité pour 
                renforcer les liens communautaires.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">💡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovation</h3>
              <p className="text-gray-600">
                Nous utilisons les dernières technologies pour offrir une expérience utilisateur 
                fluide et des recommandations intelligentes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Communauté</h3>
              <p className="text-gray-600">
                Nous créons des liens entre les habitants et les professionnels locaux pour 
                construire une communauté forte et solidaire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white font-bold">V</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vivien</h3>
              <p className="text-gray-600 mb-2">Fondateur & Développeur</p>
              <p className="text-sm text-gray-500">
                Passionné par l'innovation locale et les technologies web modernes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white font-bold">E</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">L'Équipe</h3>
              <p className="text-gray-600 mb-2">Développeurs & Designers</p>
              <p className="text-sm text-gray-500">
                Une équipe dédiée à créer la meilleure expérience utilisateur possible.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white font-bold">C</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Communauté</h3>
              <p className="text-gray-600 mb-2">Utilisateurs & Partenaires</p>
              <p className="text-sm text-gray-500">
                Notre plus grande force : une communauté engagée et passionnée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">📈</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
              <p className="text-lg text-gray-600 mb-6">
                Envie2Sortir est né d'une simple observation : il est souvent difficile de découvrir 
                les meilleurs endroits près de chez soi. Entre les réseaux sociaux saturés et les 
                moteurs de recherche génériques, les habitants perdent de vue les trésors cachés 
                de leur propre ville.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Nous avons créé Envie2Sortir pour résoudre ce problème en combinant géolocalisation 
                intelligente, recherche sémantique et recommandations personnalisées. Notre plateforme 
                comprend le langage naturel et vous aide à exprimer vos envies pour trouver exactement 
                ce que vous cherchez.
              </p>
              <p className="text-lg text-gray-600">
                Aujourd'hui, nous connectons des milliers d'habitants avec les meilleurs établissements 
                de leur région, tout en aidant les professionnels locaux à se faire connaître.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Rejoignez l'aventure Envie2Sortir</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Découvrez les meilleurs endroits près de chez vous ou référencez votre établissement 
            pour toucher de nouveaux clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/carte" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg"
            >
              Découvrir maintenant
            </Link>
            <Link 
              href="/etablissements/nouveau" 
              className="inline-block px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors text-lg border-2 border-white"
            >
              Référencer mon établissement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
