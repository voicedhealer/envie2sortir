"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MessageCircle, HelpCircle, AlertTriangle } from "lucide-react";

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Base de données de recherche d'aide
  const helpDatabase = [
    {
      id: "faq-1",
      title: "Comment utiliser la plateforme ?",
      content: "Découvrez comment utiliser Envie2Sortir pour la première fois",
      category: "Première utilisation",
      url: "/faq#premiere-utilisation",
      keywords: ["première", "utilisation", "début", "commencer", "guide"]
    },
    {
      id: "faq-2", 
      title: "Comment bien rechercher ?",
      content: "Apprenez à utiliser tous les filtres et options de recherche",
      category: "Recherche",
      url: "/faq#recherche-avancee",
      keywords: ["recherche", "filtres", "options", "avancée", "trouver"]
    },
    {
      id: "faq-3",
      title: "Référencer un établissement",
      content: "Guide complet pour ajouter votre établissement",
      category: "Professionnels",
      url: "/faq#referent-etablissement", 
      keywords: ["référencer", "établissement", "ajouter", "professionnel", "inscription"]
    },
    {
      id: "contact-1",
      title: "Nous contacter",
      content: "Contactez directement notre équipe support",
      category: "Support",
      url: "/contact",
      keywords: ["contact", "support", "équipe", "aide", "assistance"]
    },
    {
      id: "bug-1",
      title: "Signaler un problème",
      content: "Signalez un bug ou un contenu inapproprié",
      category: "Support",
      url: "/support/signaler",
      keywords: ["signaler", "bug", "problème", "erreur", "inapproprié"]
    },
    {
      id: "about-1",
      title: "À propos d'Envie2Sortir",
      content: "Découvrez notre mission et notre équipe",
      category: "Informations",
      url: "/a-propos",
      keywords: ["à propos", "mission", "équipe", "histoire", "entreprise"]
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulation d'un délai de recherche
    setTimeout(() => {
      const results = helpDatabase.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Centre d'aide</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions et l'aide dont vous avez besoin
            </p>
          </div>
        </div>
      </section>

      {/* Barre de recherche d'aide */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher dans l'aide..."
              className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
          
          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {result.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {result.content}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          {result.category}
                        </span>
                      </div>
                      <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
              <div className="text-gray-500 mb-2">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600">
                  Essayez avec d'autres mots-clés ou consultez nos catégories ci-dessous
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catégories d'aide - masquées si recherche active */}
      {searchResults.length === 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Comment pouvons-nous vous aider ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/faq" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">FAQ</h3>
                <p className="text-gray-600 text-center">
                  Questions fréquemment posées et réponses rapides
                </p>
              </div>
            </Link>

            <Link href="/contact" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Contact</h3>
                <p className="text-gray-600 text-center">
                  Contactez directement notre équipe support
                </p>
              </div>
            </Link>

            <Link href="/support/signaler" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Signaler un problème</h3>
                <p className="text-gray-600 text-center">
                  Signalez un bug ou un contenu inapproprié
                </p>
              </div>
            </Link>

            <Link href="/a-propos" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">À propos</h3>
                <p className="text-gray-600 text-center">
                  Découvrez notre mission et notre équipe
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Guides rapides - masqués si recherche active */}
      {searchResults.length === 0 && (
        <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Guides rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Première utilisation</h3>
              <p className="text-gray-600 mb-4">
                Découvrez comment utiliser Envie2Sortir pour la première fois et optimiser votre expérience.
              </p>
              <Link href="/faq#premiere-utilisation" className="text-orange-600 font-medium hover:text-orange-700">
                Lire le guide →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Recherche avancée</h3>
              <p className="text-gray-600 mb-4">
                Apprenez à utiliser tous les filtres et options de recherche pour trouver exactement ce que vous cherchez.
              </p>
              <Link href="/faq#recherche-avancee" className="text-orange-600 font-medium hover:text-orange-700">
                Lire le guide →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Référencer un établissement</h3>
              <p className="text-gray-600 mb-4">
                Guide complet pour ajouter et gérer votre établissement sur la plateforme.
              </p>
              <Link href="/faq#referent-etablissement" className="text-orange-600 font-medium hover:text-orange-700">
                Lire le guide →
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Contact rapide */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Besoin d'aide personnalisée ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Notre équipe support est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors text-lg"
            >
              Nous contacter
            </Link>
            <Link 
              href="/support/signaler" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg border-2 border-orange-500"
            >
              Signaler un problème
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
