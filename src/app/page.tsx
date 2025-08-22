import HeroSearch from "./sections/HeroSearch";

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
                <HeroSearch />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections viendront ici */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <a href="/etablissements" className="block p-6 rounded-xl border border-gray-200 hover:shadow-md transition">
            <h3 className="text-xl font-semibold">📋 Liste des établissements</h3>
            <p className="text-gray-600 mt-2">Parcourez tous nos établissements avec recherche et filtres</p>
          </a>
          <a href="/carte" className="block p-6 rounded-xl border border-gray-200 hover:shadow-md transition">
            <h3 className="text-xl font-semibold">🗺️ Carte interactive</h3>
            <p className="text-gray-600 mt-2">Visualisez les établissements sur une carte</p>
          </a>
        </div>
      </section>
    </main>
  );
}
