import EnvieSearchBar from "./sections/EnvieSearchBar";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="relative">
        <div className="hero-gradient/10">
          <div className="absolute inset-0 hero-gradient opacity-15" aria-hidden></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-black/5 text-gray-700">La plateforme ultra-locale de TOUS les divertissements</span>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight" style={{color: '#171717'}}>
                DÉCOUVREZ TOUTES LES SORTIES, PRÈS DE CHEZ VOUS
              </h1>
              <div className="mt-8">
                <EnvieSearchBar />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Nos meilleurs endroits pour..." */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos meilleurs endroits pour...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bar d'ambiance */}
            <a href="/recherche/envie?envie=bar%20d%27ambiance&ville=Dijon&rayon=5" className="group block">
              <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🍻</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Bar d'ambiance</h3>
                <p className="text-gray-600 text-sm">Découvrez les meilleurs bars et pubs de votre ville</p>
                <div className="mt-4 text-sm text-gray-500">Déjà 47 établissements</div>
              </div>
            </a>

            {/* Escape Game */}
            <a href="/recherche/envie?envie=escape_game&ville=Lyon&rayon=10" className="group block">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🧩</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Escape Game</h3>
                <p className="text-gray-600 text-sm">Résolvez des énigmes en équipe dans des salles thématiques</p>
                <div className="mt-4 text-sm text-gray-500">Déjà 12 établissements</div>
              </div>
            </a>

            {/* Karting */}
            <a href="/recherche/envie?envie=karting&ville=Paris&rayon=15" className="group block">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🏎️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Karting</h3>
                <p className="text-gray-600 text-sm">Adrénaline et compétition sur des circuits indoor</p>
                <div className="mt-4 text-sm text-gray-500">Déjà 8 établissements</div>
              </div>
            </a>

            {/* Bowling */}
            <a href="/recherche/envie?envie=bowling&ville=Bordeaux&rayon=8" className="group block">
              <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎳</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Bowling</h3>
                <p className="text-gray-600 text-sm">Amusement en famille ou entre amis sur les pistes</p>
                <div className="mt-4 text-sm text-gray-500">Déjà 15 établissements</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Section "Catégories visuelles" */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Catégories visuelles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Restaurant */}
            <a href="/recherche/envie?envie=restaurant&ville=Marseille&rayon=10" className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🍽️</span>
              </div>
              <div className="text-sm font-medium text-gray-700">Restaurant</div>
            </a>

            {/* Cinéma */}
            <a href="/recherche/envie?envie=cinema&ville=Lyon&rayon=15" className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🎬</span>
              </div>
              <div className="text-sm font-medium text-gray-700">Cinéma</div>
            </a>

            {/* Théâtre */}
            <a href="/recherche/envie?envie=theater&ville=Paris&rayon=10" className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🎭</span>
              </div>
              <div className="text-sm font-medium text-gray-700">Théâtre</div>
            </a>

            {/* Concert */}
            <a href="/recherche/envie?envie=concert&ville=Bordeaux&rayon=12" className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🎤</span>
              </div>
              <div className="text-sm font-medium text-gray-700">Concert</div>
            </a>

            {/* Musée */}
            <a href="/recherche/envie?envie=museum&ville=Lille&rayon=10" className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🏛️</span>
              </div>
              <div className="text-sm font-medium text-gray-700">Musée</div>
            </a>

            {/* Multi-activités */}
            <a href="/recherche/envie?envie=other&ville=Toulouse&rayon=15" className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">✨</span>
              </div>
              <div className="text-sm font-medium text-gray-700">Multi-activités</div>
            </a>
          </div>
        </div>
      </section>

      {/* Section "Comment ça marche ?" */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Choisissez votre ville</h3>
              <p className="text-gray-600">Sélectionnez votre localisation ou utilisez la géolocalisation pour découvrir ce qui se passe près de chez vous</p>
            </div>

            {/* Étape 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sélectionnez une activité</h3>
              <p className="text-gray-600">Parcourez nos catégories ou laissez-vous surprendre par nos suggestions personnalisées</p>
            </div>

            {/* Étape 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Réservez et profitez</h3>
              <p className="text-gray-600">Consultez les détails, les avis et réservez votre place en quelques clics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Ce qu'ils disent de nous" */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Ce qu'ils disent de nous</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Témoignage 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">⭐</span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">5.0</span>
              </div>
              <p className="text-gray-700 mb-4">"Envie2Sortir m'a permis de découvrir des endroits incroyables dans ma ville que je ne connaissais pas ! L'interface est intuitive et les recommandations sont parfaites."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  M
                </div>
                <div>
                  <div className="font-medium text-gray-900">Marie L.</div>
                  <div className="text-sm text-gray-500">Dijon</div>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">⭐</span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">5.0</span>
              </div>
              <p className="text-gray-700 mb-4">"Parfait pour organiser des sorties entre amis ! La géolocalisation et les filtres par catégorie nous font gagner un temps fou."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  T
                </div>
                <div>
                  <div className="font-medium text-gray-900">Thomas B.</div>
                  <div className="text-sm text-gray-500">Lyon</div>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">⭐</span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">5.0</span>
              </div>
              <p className="text-gray-700 mb-4">"En tant que professionnel, c'est un excellent moyen de se faire connaître localement. Les clients nous trouvent facilement !"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  S
                </div>
                <div>
                  <div className="font-medium text-gray-900">Sophie M.</div>
                  <div className="text-sm text-gray-500">Restauratrice</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Pour les professionnels" */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Pour les professionnels</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Rejoignez notre plateforme et faites découvrir votre établissement à des milliers de clients potentiels dans votre région
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Visibilité locale</h3>
              <p className="text-white/80 text-sm">Apparaissez dans les recherches de votre zone géographique</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Clients ciblés</h3>
              <p className="text-white/80 text-sm">Touchez des clients qui recherchent activement votre type d'activité</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestion simple</h3>
              <p className="text-white/80 text-sm">Mettez à jour vos informations et photos en quelques clics</p>
            </div>
          </div>
          <a 
            href="/etablissements/nouveau" 
            className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            Référencer mon établissement
          </a>
        </div>
      </section>

      {/* Section "Où nous trouver ?" */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Carte et géolocalisation */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Où nous trouver ?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Découvrez les établissements autour de vous et recevez nos meilleures recommandations directement dans votre boîte mail
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📍</span>
                  </div>
                  <div>
                    <div className="font-medium">Géolocalisation précise</div>
                    <div className="text-sm text-gray-500">Trouvez les établissements dans un rayon de 5km</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🔔</span>
                  </div>
                  <div>
                    <div className="font-medium">Notifications personnalisées</div>
                    <div className="text-sm text-gray-500">Soyez informé des nouveaux lieux et événements</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Restez informé !</h3>
              <p className="text-gray-600 mb-6">Recevez nos meilleures découvertes et offres exclusives</p>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
                >
                  S'abonner à la newsletter
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                En vous inscrivant, vous acceptez de recevoir nos communications. Vous pouvez vous désinscrire à tout moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-xl font-bold">E</span>
                </div>
                <span className="text-xl font-bold text-white">Envie2Sortir</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                La plateforme ultra-locale de tous les divertissements. Découvrez ce qui se passe près de chez vous.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><a href="/etablissements" className="hover:text-white transition-colors">Établissements</a></li>
                <li><a href="/carte" className="hover:text-white transition-colors">Carte interactive</a></li>
                <li><a href="/etablissements/nouveau" className="hover:text-white transition-colors">Ajouter un établissement</a></li>
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Signaler un problème</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Envie2Sortir. Tous droits réservés. | 
              <a href="#" className="hover:text-white transition-colors ml-2">Mentions légales</a> | 
              <a href="#" className="hover:text-white transition-colors ml-2">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
