"use client";

import { useState } from "react";
import { AlertTriangle, Bug, Shield, Flag, Send } from "lucide-react";

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: "bug",
    url: "",
    description: "",
    email: "",
    priority: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi (à remplacer par un vrai appel API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const reportTypes = [
    {
      id: "bug",
      icon: Bug,
      title: "Bug technique",
      description: "Le site ne fonctionne pas correctement",
      color: "from-red-500 to-pink-500"
    },
    {
      id: "content",
      icon: Flag,
      title: "Contenu inapproprié",
      description: "Établissement avec contenu inapproprié",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "security",
      icon: Shield,
      title: "Problème de sécurité",
      description: "Vulnérabilité ou problème de sécurité",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "other",
      icon: AlertTriangle,
      title: "Autre",
      description: "Autre type de problème",
      color: "from-gray-500 to-gray-600"
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Signalement envoyé !</h1>
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre signalement. Notre équipe technique va examiner le problème et le corriger rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ type: "bug", url: "", description: "", email: "", priority: "medium" });
              }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors"
            >
              Signaler un autre problème
            </button>
            <a 
              href="/support" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors border-2 border-orange-500"
            >
              Retour au support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Signaler un problème</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Aidez-nous à améliorer Envie2Sortir en signalant les problèmes que vous rencontrez
            </p>
          </div>
        </div>
      </section>

      {/* Types de signalement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Quel type de problème voulez-vous signaler ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.type === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Formulaire de signalement */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Détails du signalement</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la page concernée (optionnel)
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://envie2sortir.fr/..."
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité du problème
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Faible - Amélioration mineure</option>
                    <option value="medium">Moyenne - Problème gênant</option>
                    <option value="high">Élevée - Problème bloquant</option>
                    <option value="critical">Critique - Site inaccessible</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Votre email (optionnel)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pour vous tenir informé de la résolution du problème
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Décrivez le problème en détail. Plus vous serez précis, plus nous pourrons le résoudre rapidement..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils pour un signalement efficace</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Décrivez les étapes pour reproduire le problème</li>
                    <li>• Mentionnez votre navigateur et système d'exploitation</li>
                    <li>• Ajoutez des captures d'écran si possible</li>
                    <li>• Précisez si le problème est récurrent</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.description}
                  className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le signalement
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Informations supplémentaires */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Que se passe-t-il après votre signalement ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Réception</h3>
              <p className="text-gray-600">
                Votre signalement est reçu et enregistré dans notre système de suivi.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyse</h3>
              <p className="text-gray-600">
                Notre équipe technique examine le problème et détermine la solution.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Résolution</h3>
              <p className="text-gray-600">
                Le problème est corrigé et vous êtes informé de la résolution.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              Merci de contribuer à l'amélioration d'Envie2Sortir ! 🚀
            </p>
            <a 
              href="/support" 
              className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors border-2 border-orange-500"
            >
              Retour au centre d'aide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
